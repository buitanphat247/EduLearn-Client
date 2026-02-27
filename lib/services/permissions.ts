import apiClient from "@/config/api";

export const getRoles = async () => {
  const response = await apiClient.get("/roles");
  return response.data;
};

export const getPermissions = async () => {
  const response = await apiClient.get("/permissions");
  return response.data;
};

export const getRolePermissions = async (roleId: number) => {
  const response = await apiClient.get(`/permissions/role/${roleId}`);
  return response.data;
};

export const assignPermissions = async (roleId: number, permissionIds: number[]) => {
  const response = await apiClient.post("/permissions/assign", {
    role_id: roleId,
    permission_ids: permissionIds,
  });
  return response.data;
};

export const bulkSyncPermissions = async (permissions: any[]) => {
  const response = await apiClient.post("/permissions/bulk-sync", permissions);
  return response.data;
};

