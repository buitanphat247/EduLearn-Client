import { ReactNode } from "react";

interface FeaturesHeaderProps {
  title: string;
  description: string;
  /** Optional badge (e.g. "Free" / "Pro" subscription label) */
  badge?: ReactNode;
}

export default function FeaturesHeader({ title, description, badge }: FeaturesHeaderProps) {
  return (
    <div className="text-center mb-12">
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {badge}
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
      <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6 shadow-sm shadow-blue-500/20"></div>
    </div>
  );
}

