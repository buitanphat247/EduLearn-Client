/**
 * Centralized Error Messages
 * ✅ Provides consistent error messages across all pages
 */

export const ERROR_MESSAGES = {
  // General Errors
  GENERIC: "Có lỗi xảy ra. Vui lòng thử lại sau.",
  NETWORK_ERROR: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
  TIMEOUT: "Request timeout. Vui lòng thử lại.",
  UNAUTHORIZED: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này.",
  NOT_FOUND: "Không tìm thấy tài nguyên.",
  SERVER_ERROR: "Lỗi server. Vui lòng thử lại sau.",
  
  // Data Fetching Errors
  FETCH_FAILED: "Không thể tải dữ liệu. Vui lòng thử lại.",
  FETCH_TIMEOUT: "Quá trình tải dữ liệu mất quá nhiều thời gian. Vui lòng thử lại.",
  EMPTY_DATA: "Không có dữ liệu để hiển thị.",
  
  // Form Errors
  VALIDATION_FAILED: "Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.",
  REQUIRED_FIELD: "Trường này là bắt buộc.",
  INVALID_EMAIL: "Email không hợp lệ.",
  INVALID_PASSWORD: "Mật khẩu phải có ít nhất 8 ký tự.",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",
  
  // File Upload Errors
  FILE_TOO_LARGE: "File quá lớn. Vui lòng chọn file nhỏ hơn.",
  INVALID_FILE_TYPE: "Loại file không được hỗ trợ.",
  UPLOAD_FAILED: "Không thể tải file lên. Vui lòng thử lại.",
  
  // Authentication Errors
  LOGIN_FAILED: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.",
  LOGOUT_FAILED: "Đăng xuất thất bại. Vui lòng thử lại.",
  TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  TOKEN_INVALID: "Token không hợp lệ. Vui lòng đăng nhập lại.",
  
  // Exam/Exercise Errors
  EXAM_NOT_FOUND: "Không tìm thấy bài thi.",
  EXAM_EXPIRED: "Bài thi đã hết hạn.",
  EXAM_ALREADY_SUBMITTED: "Bài thi đã được nộp.",
  EXAM_NOT_STARTED: "Bài thi chưa bắt đầu.",
  SUBMISSION_FAILED: "Không thể nộp bài. Vui lòng thử lại.",
  
  // Class/Course Errors
  CLASS_NOT_FOUND: "Không tìm thấy lớp học.",
  COURSE_NOT_FOUND: "Không tìm thấy khóa học.",
  NOT_ENROLLED: "Bạn chưa đăng ký lớp học này.",
  
  // User Errors
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  PROFILE_UPDATE_FAILED: "Không thể cập nhật thông tin. Vui lòng thử lại.",
  
  // Permission Errors
  NO_PERMISSION: "Bạn không có quyền thực hiện hành động này.",
  ADMIN_ONLY: "Chỉ quản trị viên mới có quyền truy cập.",
  TEACHER_ONLY: "Chỉ giáo viên mới có quyền truy cập.",
  STUDENT_ONLY: "Chỉ học sinh mới có quyền truy cập.",
} as const;

/**
 * Get error message by key
 */
export function getErrorMessage(key: keyof typeof ERROR_MESSAGES): string {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.GENERIC;
}

/**
 * Get error message from error object
 */
export function getErrorMessageFromError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || ERROR_MESSAGES.GENERIC;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  return ERROR_MESSAGES.GENERIC;
}

/**
 * Error message categories for easier access
 */
export const ERROR_CATEGORIES = {
  GENERAL: {
    GENERIC: ERROR_MESSAGES.GENERIC,
    NETWORK_ERROR: ERROR_MESSAGES.NETWORK_ERROR,
    TIMEOUT: ERROR_MESSAGES.TIMEOUT,
    SERVER_ERROR: ERROR_MESSAGES.SERVER_ERROR,
  },
  AUTH: {
    UNAUTHORIZED: ERROR_MESSAGES.UNAUTHORIZED,
    FORBIDDEN: ERROR_MESSAGES.FORBIDDEN,
    LOGIN_FAILED: ERROR_MESSAGES.LOGIN_FAILED,
    TOKEN_EXPIRED: ERROR_MESSAGES.TOKEN_EXPIRED,
  },
  DATA: {
    FETCH_FAILED: ERROR_MESSAGES.FETCH_FAILED,
    EMPTY_DATA: ERROR_MESSAGES.EMPTY_DATA,
    NOT_FOUND: ERROR_MESSAGES.NOT_FOUND,
  },
  FORM: {
    VALIDATION_FAILED: ERROR_MESSAGES.VALIDATION_FAILED,
    REQUIRED_FIELD: ERROR_MESSAGES.REQUIRED_FIELD,
    INVALID_EMAIL: ERROR_MESSAGES.INVALID_EMAIL,
  },
} as const;
