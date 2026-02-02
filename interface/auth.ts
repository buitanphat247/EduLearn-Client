/**
 * Authentication-related TypeScript interfaces
 * @module interface/auth
 * @description Type definitions for authentication, user management, and authorization
 */

/**
 * User role interface
 * @interface Role
 * @description Represents a user role in the system
 */
export interface Role {
  /** Unique role identifier */
  role_id: number;
  /** Role name (e.g., 'admin', 'user', 'student', 'teacher') */
  role_name: string;
  /** ISO timestamp when role was created */
  created_at: string;
  /** ISO timestamp when role was last updated */
  updated_at: string;
}

/**
 * User interface
 * @interface User
 * @description Represents a user in the system
 * @example
 * ```typescript
 * const user: User = {
 *   user_id: 1,
 *   username: 'john_doe',
 *   fullname: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890',
 *   avatar: 'https://example.com/avatar.jpg',
 *   created_at: '2024-01-01T00:00:00Z',
 *   updated_at: '2024-01-01T00:00:00Z',
 *   role: { role_id: 1, role_name: 'user', ... }
 * };
 * ```
 */
export interface User {
  /** User identifier (supports both number and string for consistency) */
  user_id: number | string; // ✅ Support both number and string for consistency
  /** Unique username */
  username: string;
  /** User's full name */
  fullname: string;
  /** User's email address */
  email: string;
  /** User's phone number */
  phone: string;
  /** URL to user's avatar image */
  avatar: string;
  /** ISO timestamp when user was created */
  created_at: string;
  /** ISO timestamp when user was last updated */
  updated_at: string;
  /** User's role information */
  role: Role;
  /** Access token (optional, may not be present in all responses) */
  access_token?: string; // ✅ Optional (may not be present in all responses)
  /** Refresh token (optional, may not be present in all responses) */
  refresh_token?: string; // ✅ Optional (may not be present in all responses)
}

/**
 * Sign in request payload
 * @interface SignInRequest
 * @description Request body for user authentication
 */
export interface SignInRequest {
  /** User's email or username */
  emailOrUsername: string;
  /** User's password */
  password: string;
  /** Device name for session tracking */
  device_name: string;
}

/**
 * Sign in response
 * @interface SignInResponse
 * @description Response from sign in API endpoint
 */
export interface SignInResponse {
  /** Request status (true if successful) */
  status: boolean;
  /** Response message */
  message: string;
  /** Response data containing user information */
  data: {
    user: User;
  };
  /** HTTP status code */
  statusCode: number;
  /** ISO timestamp of the response */
  timestamp: string;
}

/**
 * Sign up request payload
 * @interface SignUpRequest
 * @description Request body for user registration
 */
export interface SignUpRequest {
  /** Desired username (must be unique) */
  username: string;
  /** User's full name */
  fullname: string;
  /** User's email address (must be unique) */
  email: string;
  /** User's phone number */
  phone: string;
  /** User's password */
  password: string;
  /** Role ID to assign to the user */
  role_id: number;
  /** Device name for session tracking */
  device_name: string;
}

/**
 * Sign up user data
 * @interface SignUpUser
 * @description User data returned after successful registration
 */
export interface SignUpUser {
  /** User identifier (consistent with User interface) */
  user_id: number | string; // ✅ Consistent with User interface
  /** Username */
  username: string;
  /** User's full name */
  fullname: string;
  /** User's email address */
  email: string;
  /** User's phone number */
  phone: string;
  /** URL to user's avatar image */
  avatar: string;
  /** Role ID assigned to the user */
  role_id: number;
  /** User's role information */
  role: Role;
  /** ISO timestamp when user was created */
  created_at: string;
  /** ISO timestamp when user was last updated */
  updated_at: string;
}

/**
 * Sign up response
 * @interface SignUpResponse
 * @description Response from sign up API endpoint
 */
export interface SignUpResponse {
  /** Request status (true if successful) */
  status: boolean;
  /** Response message */
  message: string;
  /** Response data containing user information */
  data: {
    user: User;
  };
  /** HTTP status code */
  statusCode: number;
  /** ISO timestamp of the response */
  timestamp: string;
}

/**
 * Refresh token request payload
 * @interface RefreshTokenRequest
 * @description Request body for token refresh
 */
export interface RefreshTokenRequest {
  /** Refresh token to exchange for new access token */
  refresh_token: string;
}

/**
 * Refresh token response
 * @interface RefreshTokenResponse
 * @description Response from token refresh API endpoint
 */
export interface RefreshTokenResponse {
  /** New access token */
  access_token: string;
}
