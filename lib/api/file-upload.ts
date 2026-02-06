import apiClient from "@/app/config/api";
import axios from "axios";

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

/**
 * Gets a presigned URL for direct upload to R2
 */
export const getPresignedUrl = async (fileName: string, contentType: string, folder: string = "avatars"): Promise<PresignedUrlResponse> => {
  try {
    const response = await apiClient.post("/file-upload/presigned-url", {
      fileName,
      contentType,
      folder,
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy URL upload";
    throw new Error(errorMessage);
  }
};

/**
 * Uploads a file directly to the presigned URL
 */
export const uploadToPresignedUrl = async (uploadUrl: string, file: File, contentType: string): Promise<void> => {
  try {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Lỗi khi upload file lên R2";
    throw new Error(errorMessage);
  }
};

/**
 * High-level function to handle the entire upload process
 */
export const uploadFile = async (file: File, folder: string = "avatars"): Promise<string> => {
  const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type, folder);
  await uploadToPresignedUrl(uploadUrl, file, file.type);
  return fileUrl;
};
