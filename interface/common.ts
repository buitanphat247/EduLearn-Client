/**
 * Common TypeScript interfaces
 * @module interface/common
 * @description Shared type definitions used across the application
 */

/**
 * Comment interface for discussion/comment features
 * @interface Comment
 * @property {string | number} id - Unique comment identifier
 * @property {string} author - Author name
 * @property {string} avatar - Author avatar URL
 * @property {string} time - Comment timestamp (ISO string or formatted)
 * @property {string} content - Comment content/text
 * @property {number} likes - Number of likes
 * @property {Comment[]} [replies] - Optional nested replies
 */
export interface Comment {
  id: string | number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  replies?: Comment[];
}
