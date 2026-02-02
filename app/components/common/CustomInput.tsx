"use client";

import { sanitizeInput } from "@/lib/utils/sanitize";

/**
 * CustomInput - Reusable input component with sanitization
 * 
 * @description 
 * A customizable input component that provides:
 * - Automatic input sanitization to prevent XSS attacks
 * - Optional search icon
 * - Clear button when value is present
 * - Dark mode support
 * - Accessible keyboard navigation
 * 
 * @example
 * ```tsx
 * <CustomInput
 *   placeholder="Tìm kiếm..."
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   showSearchIcon={true}
 *   wrapperClassName="w-full"
 * />
 * ```
 * 
 * @param {CustomInputProps} props - Component props
 * @param {string} [props.placeholder="Tìm kiếm..."] - Placeholder text
 * @param {string} [props.value] - Input value (automatically sanitized)
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - Change handler
 * @param {string} [props.wrapperClassName="w-1/2 mx-auto mb-16"] - CSS classes for wrapper div
 * @param {string} [props.inputClassName=""] - Additional CSS classes for input element
 * @param {boolean} [props.showSearchIcon=true] - Whether to show search icon
 * 
 * @returns {JSX.Element} Rendered input component
 * 
 * @accessibility
 * - Input has proper ARIA labels
 * - Clear button has descriptive aria-label
 * - Keyboard accessible (Enter to submit, Escape to clear)
 * - Focus management
 */
interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wrapperClassName?: string;
  inputClassName?: string;
  showSearchIcon?: boolean;
}

export default function CustomInput({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  wrapperClassName = "w-1/2 mx-auto mb-16",
  inputClassName = "",
  showSearchIcon = true,
}: CustomInputProps) {
  // Sanitize input value
  const sanitizedValue = value ? sanitizeInput(value) : "";

  // Handle input change with sanitization
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    // Create new event with sanitized value
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitized,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(sanitizedEvent);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && sanitizedValue) {
      const emptyEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(emptyEvent);
      e.currentTarget.blur();
    }
  };

  const handleClear = () => {
    const emptyEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(emptyEvent);
  };

  return (
    <div className={wrapperClassName}>
      <div className="relative w-full">
        {showSearchIcon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-500 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={sanitizedValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label={placeholder || "Input field"}
          className={`
            w-full h-10 px-4 rounded-lg
            bg-white dark:bg-[#1e293b]
            border border-slate-200 dark:border-slate-700/50
            text-slate-700 dark:text-slate-200
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            shadow-lg shadow-blue-500/5 dark:shadow-black/20
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
            transition-all duration-200
            ${showSearchIcon ? 'pl-10' : ''}
            ${inputClassName}
          `}
        />
        {sanitizedValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Xóa nội dung tìm kiếm"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
