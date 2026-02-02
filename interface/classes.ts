/**
 * Class-related TypeScript interfaces
 * @module interface/classes
 * @description Type definitions for class management and class data structures
 */

/**
 * Class item interface for UI display
 * @interface ClassItem
 * @property {string} key - Unique key for table row
 * @property {string} name - Class name
 * @property {string} code - Class code/identifier
 * @property {number} students - Number of students in class
 * @property {string} teacher - Teacher name
 * @property {"Đang hoạt động" | "Tạm dừng"} status - Class status in Vietnamese
 */
export interface ClassItem {
  key: string;
  name: string;
  code: string;
  students: number;
  teacher: string;
  status: "Đang hoạt động" | "Tạm dừng";
}

/**
 * Class API response interface
 * @interface ClassApiItem
 * @property {number} class_id - Unique class identifier
 * @property {string} name - Class name
 * @property {string} code - Class code/identifier
 * @property {number} student_count - Number of students in class
 * @property {"active" | "inactive"} status - Class status
 * @property {number} created_by - User ID of class creator
 * @property {Object} creator - Creator information
 * @property {number} creator.user_id - Creator user ID
 * @property {string} creator.username - Creator username
 * @property {string} creator.fullname - Creator full name
 * @property {string} creator.email - Creator email
 * @property {string} creator.avatar - Creator avatar URL
 * @property {string} created_at - ISO timestamp of class creation
 */
export interface ClassApiItem {
  class_id: number;
  name: string;
  code: string;
  student_count: number;
  status: "active" | "inactive";
  created_by: number;
  creator: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
  };
  created_at: string;
}
