/**
 * Media utility functions
 */

export const R2_PUBLIC_URL = "https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev";

/**
 * Ensures a media URL is absolute by prepending the R2 public base URL if it's a relative path.
 *
 * @param path - The image path or URL
 * @returns {string} The formatted absolute URL
 */
export const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return "";

  // If it's already an absolute URL (starts with http or https), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it starts with /, prepend the R2 URL
  if (path.startsWith("/")) {
    return `${R2_PUBLIC_URL}${path}`;
  }

  // Default: prepend R2 URL with a /
  return `${R2_PUBLIC_URL}/${path}`;
};
