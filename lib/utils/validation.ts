/**
 * Password validation utilities
 * Matches backend validation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
 */

// Password regex pattern - must include: lowercase, uppercase, number, special character
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Password validation message
export const PASSWORD_VALIDATION_MESSAGE = 
  "Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)";

// Minimum password length
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns true if password is valid, false otherwise
 */
export function validatePassword(password: string): boolean {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return false;
  }
  return PASSWORD_REGEX.test(password);
}

/**
 * Get password validation rules for Ant Design Form
 * @returns Array of validation rules
 */
export function getPasswordValidationRules() {
  return [
    { required: true, message: "Vui lòng nhập mật khẩu!" },
    { min: PASSWORD_MIN_LENGTH, message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự!` },
    {
      pattern: PASSWORD_REGEX,
      message: PASSWORD_VALIDATION_MESSAGE,
    },
  ];
}

/**
 * Get password validation rules for new password (change password, reset password)
 * @returns Array of validation rules
 */
export function getNewPasswordValidationRules() {
  return [
    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
    { min: PASSWORD_MIN_LENGTH, message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự!` },
    {
      pattern: PASSWORD_REGEX,
      message: PASSWORD_VALIDATION_MESSAGE,
    },
  ];
}
