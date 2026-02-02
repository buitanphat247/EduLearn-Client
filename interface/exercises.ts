/**
 * Exercise-related TypeScript interfaces
 * @module interface/exercises
 * @description Type definitions for exercise/assignment management
 */

/**
 * Exercise item interface for admin/teacher view
 * @interface ExerciseItem
 * @property {string} key - Unique key for table row
 * @property {string} name - Exercise name
 * @property {string} class - Class name
 * @property {string} subject - Subject name
 * @property {string} date - Exercise creation date
 * @property {string} deadline - Exercise deadline
 * @property {"Đang mở" | "Đã đóng"} status - Exercise status in Vietnamese
 */
export interface ExerciseItem {
  key: string;
  name: string;
  class: string;
  subject: string;
  date: string;
  deadline: string;
  status: "Đang mở" | "Đã đóng";
}

/**
 * User exercise item interface for student view
 * @interface UserExerciseItem
 * @property {string} key - Unique key for table row
 * @property {string} name - Exercise name
 * @property {string} class - Class name
 * @property {string} subject - Subject name
 * @property {string} date - Exercise creation date
 * @property {string} deadline - Exercise deadline
 * @property {"Chưa nộp" | "Đã nộp" | "Quá hạn"} status - Submission status in Vietnamese
 */
export interface UserExerciseItem {
  key: string;
  name: string;
  class: string;
  subject: string;
  date: string;
  deadline: string;
  status: "Chưa nộp" | "Đã nộp" | "Quá hạn";
}
