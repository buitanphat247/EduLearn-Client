/**
 * Utility functions for working with cookies
 */

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  
  return null;
};

/**
 * Get user ID from cookie
 * Tries to get from "user_id" cookie first, then from "user" cookie (parsed JSON)
 */
export const getUserIdFromCookie = (): number | string | null => {
  // Try to get from "user_id" cookie first
  const userIdCookie = getCookie("user_id");
  if (userIdCookie) {
    // Try to parse as number, fallback to string
    const parsed = Number(userIdCookie);
    return isNaN(parsed) ? userIdCookie : parsed;
  }

  // Try to get from "user" cookie (JSON format)
  const userCookie = getCookie("user");
  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie);
      if (userData && userData.user_id) {
        // Try to parse as number, fallback to string
        const parsed = Number(userData.user_id);
        return isNaN(parsed) ? userData.user_id : parsed;
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }

  return null;
};

