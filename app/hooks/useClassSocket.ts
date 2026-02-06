"use client";

import { useEffect, useCallback, useRef } from "react";
import { classSocketClient } from "@/lib/socket/class-client";

interface ClassSocketOptions {
  classId: string | number | undefined;
  userId: string | number | undefined;
  events?: {
    onClassUpdated?: (data: any) => void;
    onClassDeleted?: (data: any) => void;
    onStudentJoined?: (data: any) => void;
    onStudentRemoved?: (data: any) => void;
    onStudentStatusUpdated?: (data: any) => void;
    onAssignmentCreated?: (data: any) => void;
    onAssignmentUpdated?: (data: any) => void;
    onAssignmentDeleted?: (data: any) => void;
    onExamCreated?: (data: any) => void;
    onExamUpdated?: (data: any) => void;
    onExamDeleted?: (data: any) => void;
    onNotificationCreated?: (data: any) => void;
    onNotificationUpdated?: (data: any) => void;
    onNotificationDeleted?: (data: any) => void;
    onError?: (data: any) => void;
    onAccessDenied?: (data: any) => void;
  };
}

/**
 * Custom hook to manage class socket connections and events
 */
export function useClassSocket({ classId, userId, events }: ClassSocketOptions) {
  const eventsRef = useRef(events);

  // Update ref when events change to avoid re-subscribing on every render
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!classId || !userId) return;

    const classIdStr = String(classId);

    // Connect and join class room
    classSocketClient.connect();
    classSocketClient.joinClass(classIdStr);

    // Subscribe to events
    const unsubscribers: Array<() => void> = [];

    if (eventsRef.current?.onClassUpdated) {
      unsubscribers.push(
        classSocketClient.on("class_updated", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onClassUpdated?.(data);
        }),
      );
    }

    if (eventsRef.current?.onClassDeleted) {
      unsubscribers.push(
        classSocketClient.on("class_deleted", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onClassDeleted?.(data);
        }),
      );
    }

    if (eventsRef.current?.onStudentJoined) {
      unsubscribers.push(
        classSocketClient.on("student_joined", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onStudentJoined?.(data);
        }),
      );
    }

    if (eventsRef.current?.onStudentRemoved) {
      unsubscribers.push(
        classSocketClient.on("student_removed", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onStudentRemoved?.(data);
        }),
      );
    }

    if (eventsRef.current?.onStudentStatusUpdated) {
      unsubscribers.push(
        classSocketClient.on("student_status_updated", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onStudentStatusUpdated?.(data);
        }),
      );
    }

    // Assignment Events
    if (eventsRef.current?.onAssignmentCreated) {
      unsubscribers.push(
        classSocketClient.on("assignment_created", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onAssignmentCreated?.(data);
        }),
      );
    }
    if (eventsRef.current?.onAssignmentUpdated) {
      unsubscribers.push(
        classSocketClient.on("assignment_updated", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onAssignmentUpdated?.(data);
        }),
      );
    }
    if (eventsRef.current?.onAssignmentDeleted) {
      unsubscribers.push(
        classSocketClient.on("assignment_deleted", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onAssignmentDeleted?.(data);
        }),
      );
    }

    // Exam Events
    if (eventsRef.current?.onExamCreated) {
      unsubscribers.push(
        classSocketClient.on("exam_created", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onExamCreated?.(data);
        }),
      );
    }
    if (eventsRef.current?.onExamUpdated) {
      unsubscribers.push(
        classSocketClient.on("exam_updated", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onExamUpdated?.(data);
        }),
      );
    }
    if (eventsRef.current?.onExamDeleted) {
      unsubscribers.push(
        classSocketClient.on("exam_deleted", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onExamDeleted?.(data);
        }),
      );
    }

    // Notification Events
    if (eventsRef.current?.onNotificationCreated) {
      unsubscribers.push(
        classSocketClient.on("notification_created", (data) => {
          if (String(data.scope_id) === classIdStr && data.scope === "class") eventsRef.current?.onNotificationCreated?.(data);
        }),
      );
    }
    if (eventsRef.current?.onNotificationUpdated) {
      unsubscribers.push(
        classSocketClient.on("notification_updated", (data) => {
          if (String(data.scope_id) === classIdStr && data.scope === "class") eventsRef.current?.onNotificationUpdated?.(data);
        }),
      );
    }
    if (eventsRef.current?.onNotificationDeleted) {
      unsubscribers.push(
        classSocketClient.on("notification_deleted", (data) => {
          if (String(data.scope_id) === classIdStr && data.scope === "class") eventsRef.current?.onNotificationDeleted?.(data);
        }),
      );
    }

    if (eventsRef.current?.onError) {
      unsubscribers.push(
        classSocketClient.on("class:error", (data) => {
          eventsRef.current?.onError?.(data);
        }),
      );
    }

    if (eventsRef.current?.onAccessDenied) {
      unsubscribers.push(
        classSocketClient.on("class:access_denied", (data) => {
          if (String(data.class_id) === classIdStr) eventsRef.current?.onAccessDenied?.(data);
        }),
      );
    }

    // Cleanup on unmount or classId/userId change
    return () => {
      classSocketClient.leaveClass(classIdStr);
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [classId, userId]);

  const emit = useCallback((event: string, data: any) => {
    classSocketClient.emit(event, data);
  }, []);

  return { emit };
}
