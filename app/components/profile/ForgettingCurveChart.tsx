"use client";

import React, { useMemo, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ChartOptions,
    TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LineChartOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Tooltip as AntTooltip, message } from 'antd';
import { getForgettingCurveData, type ForgettingCurveDataset } from '@/lib/api/vocabulary';
import { getProfile } from '@/lib/api/auth';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

interface ForgettingCurveChartProps {
    theme: string;
}

export default function ForgettingCurveChart({ theme }: ForgettingCurveChartProps) {
    const isDark = theme === 'dark';
    const [realDatasets, setRealDatasets] = useState<ForgettingCurveDataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStage, setSelectedStage] = useState<number | 'all'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profile = await getProfile();
                if (profile && profile.user_id) {
                    const datasets = await getForgettingCurveData(Number(profile.user_id));
                    setRealDatasets(datasets);
                }
            } catch (error) {
                console.error("Error fetching forgetting curve:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stages = [
        { key: 'all', label: 'Tất cả' },
        { key: 0, label: 'Lần 1', fullLabel: 'Học lần đầu' },
        { key: 1, label: 'Lần 2', fullLabel: 'Ôn tập lần 1' },
        { key: 2, label: 'Lần 3', fullLabel: 'Ôn tập lần 2' },
        { key: 3, label: 'Lần 4', fullLabel: 'Ôn tập lần 3' },
    ];

    const data = useMemo(() => {
        const labels = Array.from({ length: 31 }, (_, i) => `Ngày ${i}`);
        const colors = [
            { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }, // Initial
            { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }, // 1st
            { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }, // 2nd
            { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' }, // 3rd
        ];

        const filteredDatasets = realDatasets
            .map((ds, idx) => ({
                label: ds.label,
                data: ds.data,
                borderColor: colors[idx]?.border || '#3b82f6',
                backgroundColor: colors[idx]?.bg || 'rgba(59, 130, 246, 0.1)',
                fill: selectedStage !== 'all',
                tension: 0.35,
                borderWidth: selectedStage === idx ? 3 : (selectedStage === 'all' ? 2.5 : 1.5),
                pointRadius: 0,
                pointHoverRadius: 6,
                hidden: selectedStage !== 'all' && selectedStage !== idx
            }))
            .filter(ds => !ds.hidden);

        return { labels, datasets: filteredDatasets };
    }, [realDatasets, selectedStage]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: 12, right: 16, bottom: 8, left: 8 },
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#1e293b',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 14,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (context: TooltipItem<'line'>) => `${context.dataset.label}: ${Number(context.parsed.y).toFixed(1)}%`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { size: 13, weight: 500 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 9,
                },
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                },
                ticks: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { size: 13, weight: 500 },
                    callback: (value: string | number) => `${value}%`,
                },
            },
        },
        interaction: { mode: 'index' as const, intersect: false },
    };

    const currentStats = useMemo(() => {
        if (!realDatasets || realDatasets.length === 0) return null;
        let ds;
        if (selectedStage === 'all') {
            ds = realDatasets[0];
        } else {
            ds = realDatasets[selectedStage as number];
        }

        if (!ds || !ds.data || ds.data.length === 0) return null;

        return {
            start: ds.data[0] ?? 0,
            day7: ds.data[7] ?? 0,
            day30: ds.data[30] ?? 0,
            label: ds.label
        };
    }, [realDatasets, selectedStage]);

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all duration-500 p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-blue-400/20">
                        <LineChartOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            Phân tích Trí nhớ
                            <AntTooltip title="Dựa trên thuật toán SM-2, biểu đồ dự báo khả năng ghi nhớ của bạn qua từng giai đoạn ôn tập.">
                                <InfoCircleOutlined className="text-slate-400 dark:text-slate-500 text-base cursor-help hover:text-blue-500" />
                            </AntTooltip>
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                            Dự báo độ bền vững dựa trên dữ liệu thật
                        </p>
                    </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl flex flex-wrap gap-1 border border-slate-200 dark:border-slate-700/50 self-start lg:self-center">
                    {stages.map((stage) => (
                        <button
                            key={stage.key}
                            onClick={() => setSelectedStage(stage.key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${selectedStage === stage.key
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {stage.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group mb-5">
                <div className="h-[580px] w-full min-h-[400px]">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-20 rounded-2xl backdrop-blur-sm">
                            <SyncOutlined spin className="text-3xl text-blue-500" />
                        </div>
                    ) : null}
                    <Line options={options} data={data} key={selectedStage} />
                </div>
            </div>

        </div>
    );
}

