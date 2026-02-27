import { ReactNode } from "react";

interface SidebarStatCardProps {
  title: string;
  value: ReactNode;
  /**
   * Icon rendered in the left circle.
   */
  icon: ReactNode;
  /**
   * Background color classes for the icon wrapper.
   * Example: "bg-indigo-100 text-indigo-600"
   */
  iconWrapperClassName: string;
}

export function SidebarStatCard(props: SidebarStatCardProps) {
  const { title, value, icon, iconWrapperClassName } = props;

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconWrapperClassName}`}
        >
          {icon}
        </span>
        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="mt-1 text-2xl md:text-3xl font-extrabold">{value}</div>
    </div>
  );
}

