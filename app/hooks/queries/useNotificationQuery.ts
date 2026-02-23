import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getNotificationsByUserId,
  getNotificationRecipientsByUserId,
  type NotificationResponse,
  type NotificationRecipientResponse,
} from "@/lib/api/notifications";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: number | string, filters: { page: number; limit: number; search?: string; is_read?: boolean }) =>
    [...notificationKeys.all, "list", userId, filters] as const,
};

export function useNotificationsQuery(userId: number | string | null, params: { page: number; limit: number; search?: string; is_read?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(userId || "", params),
    queryFn: async () => {
      const [result, recipients] = await Promise.all([getNotificationsByUserId(userId!, params), getNotificationRecipientsByUserId(userId!)]);

      const readStatusMap = new Map<number | string, boolean>();
      recipients.forEach((recipient: NotificationRecipientResponse) => {
        const notifId = recipient.notification_id || recipient.notification?.notification_id;
        if (notifId) {
          readStatusMap.set(notifId, recipient.is_read === true);
        }
      });

      const mappedNotifications = result.data.map((notif: NotificationResponse) => {
        const notifId = notif.notification_id;
        const isRead = readStatusMap.get(notifId) || false;
        return {
          ...notif,
          is_read: isRead,
        };
      });

      return {
        data: mappedNotifications,
        total: result.total || result.data.length,
      };
    },
    enabled: !!userId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
