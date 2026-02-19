"use client";

import { useState, useMemo } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { ActivityCalendar } from "react-activity-calendar";
import { ActivityStat } from "@/lib/api/vocabulary";

interface LearningActivityCalendarProps {
    theme: string;
}

export default function LearningActivityCalendar({ theme }: LearningActivityCalendarProps) {
    // Mock data generator for activity calendar (Temporary as requested)
    const generateMockActivityData = () => {
        const data = [];
        const today = new Date();
        for (let i = 0; i <= 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const count = Math.floor(Math.random() * 10); // Random activities 0-9
            if (count > 0) {
                data.push({
                    date: date.toISOString().split('T')[0],
                    count: count,
                    level: Math.floor(Math.random() * 5), // Random level 0-4
                });
            }
        }
        return data.reverse();
    };

    const [activityData] = useState<ActivityStat[]>(generateMockActivityData());
    const [loading] = useState(false); // Set to false since using mock data

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-colors duration-300 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <CalendarOutlined className="text-xl" />
                        </div>
                        Biểu đồ học tập
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Theo dõi tiến độ ôn tập và ghi nhớ từ vựng của bạn
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                {loading ? (
                    <div className="h-40 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                ) : (
                    <div className="w-full flex justify-center">
                        {activityData.length > 0 ? (
                            <ActivityCalendar
                                data={activityData}
                                theme={{
                                    light: ['#f1f5f9', '#bbf7d0', '#4ade80', '#22c55e', '#166534'],
                                    dark: ['#1e293b', '#064e3b', '#059669', '#10b981', '#34d399'],
                                }}
                                colorScheme={theme === 'dark' ? 'dark' : 'light'}
                                labels={{
                                    months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                                    weekdays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                                    totalCount: '{{count}} hoạt động trong năm qua',
                                    legend: {
                                        less: 'Ít hơn',
                                        more: 'Nhiều hơn',
                                    },
                                }}
                                renderBlock={(block, activity) => (
                                    <Tooltip
                                        title={`${activity.count} hoạt động vào ${new Date(activity.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                                        overlayInnerStyle={{ borderRadius: '12px' }}
                                    >
                                        {block}
                                    </Tooltip>
                                )}
                                blockSize={24}
                                blockRadius={3}
                                blockMargin={5}
                                showWeekdayLabels
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 w-full">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <CalendarOutlined className="text-4xl text-slate-300 dark:text-slate-600" />
                                </div>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Dữ liệu học tập còn trống</p>
                                <p className="text-slate-500 dark:text-slate-500 max-w-xs text-center">Bắt đầu học ngay để xây dựng chuỗi hoạt động học tập của bạn!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
