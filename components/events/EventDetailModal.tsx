"use client";

import { Modal, ConfigProvider, theme as antTheme } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";

export interface EventDetail {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  color: string;
  description: string;
  organizer: string;
  participants: string;
}

interface EventDetailModalProps {
  open: boolean;
  event: EventDetail | null;
  onCancel: () => void;
}

export default function EventDetailModal({ open, event, onCancel }: EventDetailModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        components: {
          Modal: {
            contentBg: isDark ? '#1e293b' : '#ffffff',
            headerBg: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? 'white' : '#1e293b',
            titleFontSize: 20,
            colorIcon: isDark ? '#94a3b8' : '#64748b',
            colorIconHover: isDark ? 'white' : '#334155',
          },
        },
        token: {
          colorText: isDark ? 'white' : '#1e293b',
          colorTextSecondary: isDark ? '#94a3b8' : '#64748b',
        }
      }}
    >
      <Modal
        title={event?.title}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={600}
        centered
        styles={{
          mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        {event && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${
              event.color === "blue" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
              event.color === "green" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
              "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600"
            }`}>
              {event.status}
            </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <CalendarOutlined className="text-blue-500 dark:text-blue-400 text-lg" />
                </div>
                <span className="text-lg">{event.date}</span>
              </div>
              
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <ClockCircleOutlined className="text-orange-500 dark:text-orange-400 text-lg" />
                </div>
                <span className="text-lg">{event.time}</span>
              </div>
              
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <EnvironmentOutlined className="text-green-500 dark:text-green-400 text-lg" />
                </div>
                <span className="text-lg">{event.location}</span>
              </div>
              
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <UserOutlined className="text-purple-500 dark:text-purple-400 text-lg" />
                </div>
                <span className="text-lg">{event.organizer}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full block"></span>
                Mô tả
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{event.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}
