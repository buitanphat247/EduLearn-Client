import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getClasses,
  getClassesByUser,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudentsByClass,
  getBannedStudents,
  addStudentToClass,
  removeStudentFromClass,
  updateClassStudentStatus,
  joinClassByCode,
  type GetClassesParams,
  type GetClassesByUserParams,
  type CreateClassParams,
  type UpdateClassParams,
  type AddStudentToClassParams,
  type RemoveStudentFromClassParams,
  type UpdateClassStudentStatusParams,
  type JoinClassByCodeParams,
} from "@/lib/api/classes";

export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (params: GetClassesParams) => [...classKeys.lists(), params] as const,
  byUserLists: () => [...classKeys.all, "byUser"] as const,
  byUser: (params: GetClassesByUserParams) => [...classKeys.byUserLists(), params] as const,
  details: () => [...classKeys.all, "detail"] as const,
  detail: (id: number | string, userId?: number | string) => [...classKeys.details(), id, userId] as const,
  students: (classId: number | string) => [...classKeys.detail(classId), "students"] as const,
  bannedStudents: (classId: number | string) => [...classKeys.detail(classId), "banned"] as const,
};

export function useClassesQuery(params: GetClassesParams) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => getClasses(params),
    placeholderData: keepPreviousData,
  });
}

export function useClassesByUserQuery(params: GetClassesByUserParams) {
  return useQuery({
    queryKey: classKeys.byUser(params),
    queryFn: () => getClassesByUser(params),
    enabled: !!params.userId,
    placeholderData: keepPreviousData,
  });
}

export function useClassDetailQuery(id: number | string, userId?: number | string) {
  return useQuery({
    queryKey: classKeys.detail(id, userId),
    queryFn: () => getClassById(id, userId),
    enabled: !!id,
  });
}

export function useClassStudentsQuery(classId: number | string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...classKeys.students(classId), { page, limit }],
    queryFn: () => getClassStudentsByClass({ classId, page, limit }),
    enabled: !!classId,
    placeholderData: keepPreviousData,
  });
}

export function useBannedStudentsQuery(classId: number | string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...classKeys.bannedStudents(classId), { page, limit }],
    queryFn: () => getBannedStudents({ classId, page, limit }),
    enabled: !!classId,
    placeholderData: keepPreviousData,
  });
}

// Mutations
export function useCreateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateClassParams) => createClass(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.byUserLists() });
    },
  });
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number | string; params: UpdateClassParams }) => updateClass(id, params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.byUserLists() });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) });
    },
  });
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteClass(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: classKeys.lists() });
      await queryClient.cancelQueries({ queryKey: classKeys.byUserLists() });
      const previousLists = queryClient.getQueriesData({ queryKey: classKeys.lists() });
      const previousByUser = queryClient.getQueriesData({ queryKey: classKeys.byUserLists() });
      // Optimistic remove from all cached class lists
      queryClient.setQueriesData({ queryKey: classKeys.lists() }, (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) return old.filter((c: any) => c.class_id !== deletedId && c.id !== deletedId);
        if (old.data && Array.isArray(old.data))
          return { ...old, data: old.data.filter((c: any) => c.class_id !== deletedId && c.id !== deletedId), total: (old.total || 1) - 1 };
        return old;
      });
      queryClient.setQueriesData({ queryKey: classKeys.byUserLists() }, (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) return old.filter((c: any) => c.class_id !== deletedId && c.id !== deletedId);
        if (old.data && Array.isArray(old.data))
          return { ...old, data: old.data.filter((c: any) => c.class_id !== deletedId && c.id !== deletedId), total: (old.total || 1) - 1 };
        return old;
      });
      return { previousLists, previousByUser };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([qk, data]: [any, any]) => queryClient.setQueryData(qk, data));
      }
      if (context?.previousByUser) {
        context.previousByUser.forEach(([qk, data]: [any, any]) => queryClient.setQueryData(qk, data));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.byUserLists() });
    },
  });
}

export function useAddStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AddStudentToClassParams) => addStudentToClass(params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.class_id) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.class_id) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useRemoveStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: RemoveStudentFromClassParams) => removeStudentFromClass(params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.bannedStudents(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useUpdateStudentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateClassStudentStatusParams & { classId: number | string }) =>
      updateClassStudentStatus({ id: params.id, status: params.status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.students(variables.classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.bannedStudents(variables.classId) });
    },
  });
}

export function useJoinClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: JoinClassByCodeParams) => joinClassByCode(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.byUserLists() });
    },
  });
}
