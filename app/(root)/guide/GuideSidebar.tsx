"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface GuideSidebarProps {
  menu: any[];
  currentSlug: string;
  baseUrl?: string;
}

export default function GuideSidebar({ menu, currentSlug, baseUrl = "/guide" }: GuideSidebarProps) {
  const router = useRouter();
  return (
    <div className="space-y-8">
      {menu.map((section, idx) => (
        <div key={idx}>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider opacity-80">
            {section.title}
          </h4>
          <ul className="space-y-2 border-l border-slate-100 dark:border-slate-800 ml-1">
            {section.items.map((item: any) => {
              const isActive = currentSlug === item.slug;
              return (
                <li key={item.slug} className="-ml-px">
                  <Link
                    href={`${baseUrl}?doc=${item.slug}`}
                    prefetch={false}
                    onMouseEnter={() => router.prefetch(`${baseUrl}?doc=${item.slug}`)}
                    className={`
                      block py-1.5 pl-4 border-l-2 text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
