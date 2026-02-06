import apiClient from "@/app/config/api";

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemUpdates: boolean;
  twoFactorAuth: boolean;
}

export interface UpdateSettingsResponse {
  status: boolean;
  message: string;
  data: UserSettings;
}

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const response = await apiClient.put<UpdateSettingsResponse>("/user/settings", settings);

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    return response.data.data || settings;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật cài đặt";
    throw new Error(errorMessage);
  }
};
