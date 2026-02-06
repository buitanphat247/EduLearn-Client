"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRightOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";

interface NewsCardProps {
   id: number | string;
   title: string;
   excerpt?: string;
   image?: string;
   date: string;
   category?: string;
   time?: string;
   location?: string;
   type?: 'news' | 'event';
   accentColor?: string;
   onClick?: () => void;
}

export default function NewsCard({
   id, title, excerpt, image, date, category,
   time, location, type = 'news', accentColor, onClick
}: NewsCardProps) {
   const router = useRouter();
   const href = type === 'event' ? `/events/${id}` : `/news/${id}`;
   const isEvent = type === 'event';

   // Custom border logic: If accentColor is provided, use it for Left Border. Else standard border.
   const containerClasses = `h-full bg-white dark:bg-[#1e293b] rounded-[20px] transition-all duration-300 flex flex-col relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-blue-900/10 hover:-translate-y-1 ${accentColor
      ? `border-l-[6px] ${accentColor} border-t border-r border-b border-slate-200 dark:border-slate-800`
      : 'border border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
      }`;

   const InnerContent = (
      <div className={containerClasses}>
         {/* Render Image for News Only */}
         {image && !isEvent && (
            <div className="relative aspect-[16/10] overflow-hidden">
               <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase rounded-md backdrop-blur-md border border-blue-500/20 shadow-sm">
                  {category || 'Tin tức'}
               </span>
               <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
               />
            </div>
         )}

         {/* Content Body */}
         <div className="p-6 flex flex-col flex-1">

            {/* Event Badge & Header */}
            {isEvent && (
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${accentColor?.includes('blue') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                     accentColor?.includes('green') || accentColor?.includes('emerald') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                     }`}>
                     {category || 'Sự kiện'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                     <CalendarOutlined />
                  </div>
               </div>
            )}

            {/* News Date */}
            {!isEvent && (
               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-xs mb-3 font-medium">
                  <CalendarOutlined />
                  <span>{date}</span>
               </div>
            )}

            {/* Title */}
            <h3 className={`text-lg font-bold text-slate-800 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isEvent ? 'text-xl mb-6' : ''}`}>
               {title}
            </h3>

            {/* Event Details */}
            {isEvent && (
               <div className="space-y-4 mb-6 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                     <CalendarOutlined className="text-slate-500 text-lg" />
                     <span>{date}</span>
                  </div>
                  {time && (
                     <div className="flex items-center gap-3">
                        <ClockCircleOutlined className="text-slate-500 text-lg" />
                        <span>{time}</span>
                     </div>
                  )}
                  {location && (
                     <div className="flex items-center gap-3">
                        <EnvironmentOutlined className="text-slate-500 text-lg" />
                        <span>{location}</span>
                     </div>
                  )}
               </div>
            )}

            {/* News Excerpt */}
            {!isEvent && (
               <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {excerpt}
               </p>
            )}

            {/* Footer */}
            <div className="mt-auto pt-5 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
               <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {isEvent ? 'Xem chi tiết' : 'Đọc chi tiết'}
               </span>
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <ArrowRightOutlined />
               </div>
            </div>
         </div>
      </div>
   );

   if (onClick) {
      return (
         <div onClick={onClick} className="block h-full group cursor-pointer">
            {InnerContent}
         </div>
      );
   }

   return (
      <Link
         href={href}
         prefetch={false}
         onMouseEnter={() => router.prefetch(href)}
         className="block h-full group"
      >
         {InnerContent}
      </Link>
   )
}
