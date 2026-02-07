"use client";

import React, { ReactNode } from "react";

/**
 * CustomCard - Reusable card component with header and body sections
 * 
 * @description 
 * A flexible card component that provides:
 * - Optional title and extra content in header
 * - Configurable padding (none, sm, md, lg)
 * - Click handler support
 * - Dark mode support
 * - Accessible structure with proper semantic HTML
 * 
 * @example
 * ```tsx
 * <CustomCard
 *   title="Card Title"
 *   extra={<Button>Action</Button>}
 *   padding="md"
 *   onClick={() => console.log('Card clicked')}
 * >
 *   <p>Card content goes here</p>
 * </CustomCard>
 * ```
 * 
 * @param {CustomCardProps} props - Component props
 * @param {ReactNode} props.children - Card body content
 * @param {string | ReactNode} [props.title] - Card title (renders header if provided)
 * @param {ReactNode} [props.extra] - Extra content in header (e.g., action buttons)
 * @param {string} [props.className=""] - Additional CSS classes for card container
 * @param {React.CSSProperties} [props.style] - Inline styles for card container
 * @param {string} [props.headerClassName=""] - Additional CSS classes for header
 * @param {string} [props.bodyClassName=""] - Additional CSS classes for body
 * @param {"none" | "sm" | "md" | "lg"} [props.padding="md"] - Padding size
 * @param {() => void} [props.onClick] - Click handler (makes card clickable)
 * 
 * @returns {JSX.Element} Rendered card component
 * 
 * @accessibility
 * - Uses semantic HTML structure
 * - Clickable cards have proper role and keyboard support
 * - Title is properly associated with content
 */
interface CustomCardProps {
  children: ReactNode;
  title?: string | ReactNode;
  extra?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  headerClassName?: string;
  bodyClassName?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export default function CustomCard({
  children,
  title,
  extra,
  className = "",
  style,
  headerClassName = "",
  bodyClassName = "",
  padding = "md",
  onClick,
}: CustomCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  if (title) {
    return (
      <article
        className={`bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm ${className} ${onClick ? "cursor-pointer" : ""}`}
        style={style}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick && typeof title === "string" ? `Card: ${title}` : undefined}
      >
        <header className={`px-6 py-4 border-b border-gray-100 dark:!border-slate-700 flex items-center justify-between ${headerClassName}`}>
          <div>{typeof title === "string" ? <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3> : title}</div>
          {extra && <div>{extra}</div>}
        </header>
        <div className={`px-6 py-4 ${bodyClassName}`}>{children}</div>
      </article>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-md transition-transform duration-300 ${paddingClasses[padding]
        } ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={style}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
