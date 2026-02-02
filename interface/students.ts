/**
 * Student-related TypeScript interfaces
 * @module interface/students
 * @description Type definitions for student management and student data structures
 */

/**
 * Student item interface for UI display
 * @interface StudentItem
 * @property {string} key - Unique key for table row
 * @property {number | string} userId - User ID (for deletion operations)
 * @property {string} name - Student name
 * @property {string} studentId - Student identifier/code
 * @property {string} class - Class name
 * @property {string | null} email - Student email (can be null)
 * @property {string | null} phone - Student phone (can be null)
 * @property {"Đang học" | "Tạm nghỉ" | "Đã tốt nghiệp" | "Bị cấm"} status - Student status in Vietnamese
 * @property {"online" | "banned"} [apiStatus] - Status from API
 * @property {number | string} [classStudentId] - Class-student record ID (for status updates)
 */
export interface StudentItem {
  key: string;
  userId: number | string; // ID của người dùng (user_id) để xóa học sinh
  name: string;
  studentId: string;
  class: string;
  email: string | null; // ✅ Can be null from API
  phone: string | null; // ✅ Can be null from API
  status: "Đang học" | "Tạm nghỉ" | "Đã tốt nghiệp" | "Bị cấm";
  apiStatus?: string; // Status từ API: "online" | "banned"
  classStudentId?: number | string; // ID của bản ghi class-student để update status
}
