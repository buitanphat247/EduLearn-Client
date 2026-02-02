"use client";

import { useState, useRef, useEffect } from "react";

/**
 * CustomSelect - Reusable select dropdown component
 * 
 * @description 
 * A custom select component that provides:
 * - Dropdown menu with options
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Clear button to reset selection
 * - Click outside to close
 * - Dark mode support
 * - Full keyboard accessibility
 * 
 * @example
 * ```tsx
 * <CustomSelect
 *   placeholder="Chọn một tùy chọn"
 *   value={selectedValue}
 *   onChange={(value) => setSelectedValue(value)}
 *   options={[
 *     { label: "Option 1", value: "opt1" },
 *     { label: "Option 2", value: "opt2" }
 *   ]}
 *   allowClear={true}
 * />
 * ```
 * 
 * @param {CustomSelectProps} props - Component props
 * @param {string} [props.placeholder="Chọn..."] - Placeholder text
 * @param {string} [props.value] - Selected value
 * @param {(value: string | undefined) => void} [props.onChange] - Change handler
 * @param {SelectOption[]} [props.options=[]] - Array of select options
 * @param {string} [props.wrapperClassName="w-full"] - CSS classes for wrapper div
 * @param {string} [props.selectClassName=""] - Additional CSS classes for select button
 * @param {boolean} [props.allowClear=true] - Whether to show clear button
 * 
 * @returns {JSX.Element} Rendered select component
 * 
 * @accessibility
 * - Full keyboard navigation (Arrow keys, Enter, Escape, Tab)
 * - ARIA labels and roles
 * - Focus management
 * - Screen reader support
 */
interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  options?: SelectOption[];
  wrapperClassName?: string;
  selectClassName?: string;
  allowClear?: boolean;
}

export default function CustomSelect({
  placeholder = "Chọn...",
  value,
  onChange,
  options = [],
  wrapperClassName = "w-full",
  selectClassName = "",
  allowClear = true,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleSelect = (optionValue: string) => {
    if (value === optionValue && allowClear) {
      onChange?.(undefined);
    } else {
      onChange?.(optionValue);
    }
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
      return;
    }

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelect(options[focusedIndex].value);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(optionValue);
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const optionElement = selectRef.current?.querySelector(`[data-option-index="${focusedIndex}"]`) as HTMLElement;
      optionElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex, isOpen]);

  return (
    <div className={`relative ${wrapperClassName}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setFocusedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        aria-label={selectedOption ? `Selected: ${selectedOption.label}` : placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="custom-select-options"
        className={`
          w-full h-10 px-4 rounded-lg
          bg-white dark:bg-[#1e293b]
          border border-slate-200 dark:border-slate-700/50
          text-left
          shadow-lg shadow-blue-500/5 dark:shadow-black/20
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
          transition-all duration-200
          flex items-center justify-between
          ${selectClassName}
        `}
      >
        <span
          className={`
            ${selectedOption ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}
            truncate
          `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {value && allowClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
                setFocusedIndex(-1);
              }}
              aria-label="Xóa lựa chọn"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          id="custom-select-options"
          role="listbox"
          aria-label="Select options"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                data-option-index={index}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={value === option.value}
                className={`
                  w-full px-4 py-2 text-left
                  hover:bg-slate-50 dark:hover:bg-slate-700/50
                  transition-colors
                  focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50
                  ${value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}
                  ${focusedIndex === index ? 'bg-slate-50 dark:bg-slate-700/50' : ''}
                `}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm" role="status" aria-live="polite">
              Không có tùy chọn
            </div>
          )}
        </div>
      )}
    </div>
  );
}
