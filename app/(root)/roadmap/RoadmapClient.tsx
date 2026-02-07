"use client";

import ScrollAnimation from "@/app/components/common/ScrollAnimation";
import {
    FlagOutlined,
    CheckCircleOutlined,
    AppstoreOutlined,
    SafetyOutlined,
    RobotOutlined,
    BookOutlined,
    MobileOutlined,
    SoundOutlined,
    TeamOutlined,
    CloudOutlined,
    BarChartOutlined,
    BgColorsOutlined,
    CreditCardOutlined,
    SafetyCertificateOutlined,
    ExperimentOutlined
} from "@ant-design/icons";
import { ReactNode } from "react";

// Icon mapping for features using Ant Design icons
function getIconForFeature(text: string): ReactNode {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("hệ thống") || lowerText.includes("core")) return <AppstoreOutlined />;
    if (lowerText.includes("bảo mật") || lowerText.includes("security")) return <SafetyOutlined />;
    if (lowerText.includes("ai")) return <RobotOutlined />;
    if (lowerText.includes("thư viện") || lowerText.includes("book")) return <BookOutlined />;
    if (lowerText.includes("mobile") || lowerText.includes("app")) return <MobileOutlined />;
    if (lowerText.includes("voice") || lowerText.includes("trợ lý")) return <SoundOutlined />;
    if (lowerText.includes("social") || lowerText.includes("learning")) return <TeamOutlined />;
    if (lowerText.includes("offline") || lowerText.includes("cloud")) return <CloudOutlined />;
    if (lowerText.includes("analytics") || lowerText.includes("dashboard")) return <BarChartOutlined />;
    if (lowerText.includes("dark") || lowerText.includes("mode")) return <BgColorsOutlined />;
    if (lowerText.includes("vr") || lowerText.includes("ar") || lowerText.includes("lớp học")) return <ExperimentOutlined />;
    if (lowerText.includes("payment")) return <CreditCardOutlined />;
    if (lowerText.includes("blockchain") || lowerText.includes("certificate")) return <SafetyCertificateOutlined />;

    return <CheckCircleOutlined />;
}

interface Milestone {
    title: string;
    description: string;
    features: { title: string; description: string; subItems: string[] }[];
    isCurrent: boolean;
}

interface RoadmapClientProps {
    intro: string;
    milestones: Milestone[];
}

export default function RoadmapClient({ intro, milestones }: RoadmapClientProps) {
    return (
        <main className="h-full bg-[#f8fafc] dark:bg-[#0f172a] transition-colors">
            <ScrollAnimation direction="up" delay={0}>
                {/* Header */}
                <header className="py-16 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                            Lộ trình Phát triển <span className="text-blue-600">EduLearn</span> 🚀
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {intro || "Chúng tôi cam kết mang đến trải nghiệm giáo dục tốt nhất thông qua việc liên tục đổi mới và cập nhật công nghệ."}
                        </p>
                    </div>
                </header>

                {/* Timeline */}
                <section className="container mx-auto px-4">
                    <div className="relative">
                        {/* Center Line - Desktop Only */}
                        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-slate-200 dark:bg-slate-700" />

                        <div className="space-y-12 lg:space-y-16">
                            {milestones.map((item, index) => {
                                const isLeft = index % 2 === 0;

                                return (
                                    <div key={index} className="relative">
                                        {/* Timeline Dot - Desktop */}
                                        <div className="hidden lg:block absolute left-1/2 top-8 -translate-x-1/2 z-10">
                                            {item.isCurrent ? (
                                                <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white dark:border-[#0f172a] shadow-lg flex items-center justify-center text-white ring-8 ring-blue-500/10">
                                                    <FlagOutlined className="text-sm" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-full shadow-sm" />
                                            )}
                                        </div>

                                        {/* Row Container - Using Grid for precise control */}
                                        <div className="lg:grid lg:grid-cols-2 lg:gap-20">
                                            {/* Left Column */}
                                            <div className={isLeft ? '' : 'hidden lg:block'}>
                                                {isLeft && (
                                                    <RoadmapCard item={item} align="right" />
                                                )}
                                            </div>

                                            {/* Right Column */}
                                            <div className={!isLeft ? '' : 'hidden lg:block'}>
                                                {!isLeft && (
                                                    <RoadmapCard item={item} align="left" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Mobile Card (always visible on mobile) */}
                                        <div className="lg:hidden">
                                            <RoadmapCard item={item} align="left" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </ScrollAnimation>
        </main>
    );
}

// Custom Roadmap Card Component
interface RoadmapCardProps {
    item: Milestone;
    align: 'left' | 'right';
}

function RoadmapCard({ item, align }: RoadmapCardProps) {
    return (
        <div className={`
            bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl 
            shadow-xl shadow-slate-200/50 dark:shadow-none 
            border transition-all duration-300 hover:border-blue-500 mb-10
            ${item.isCurrent
                ? 'border-blue-500 dark:border-blue-800'
                : 'border-slate-300 dark:border-slate-700'
            }
        `}>
            {/* Status Badge */}
            {item.isCurrent && (
                <div className={`flex items-center gap-2 mb-4 ${align === 'right' ? 'lg:justify-end' : ''}`}>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                        <CheckCircleOutlined className="text-sm" />
                        Hiện tại
                    </span>
                </div>
            )}

            {/* Title */}
            <h3 className={`text-xl md:text-2xl font-bold mb-4 ${item.isCurrent ? 'text-blue-600' : 'text-slate-900 dark:text-white'} ${align === 'right' ? 'lg:text-right' : ''}`}>
                {item.title}
            </h3>

            {/* Description */}
            {item.description && (
                <p className={`text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed ${align === 'right' ? 'lg:text-right' : ''}`}>
                    {item.description}
                </p>
            )}

            {/* Features List */}
            <ul className="space-y-4">
                {item.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-3 ${align === 'right' ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
                        <span className="text-blue-600 text-xl flex-shrink-0 mt-0.5">
                            {getIconForFeature(feature.title)}
                        </span>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {feature.title}
                            </h4>
                            {feature.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {feature.description}
                                </p>
                            )}
                            {feature.subItems.length > 0 && (
                                <ul className={`mt-2 space-y-1 ${align === 'right' ? 'lg:mr-1' : 'ml-1'}`}>
                                    {feature.subItems.map((sub, subIdx) => (
                                        <li key={subIdx} className={`text-xs text-slate-500 dark:text-slate-500 flex items-center gap-2 ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                                            <span className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                                            {sub}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
