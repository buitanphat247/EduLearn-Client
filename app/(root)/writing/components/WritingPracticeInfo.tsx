"use client";

import { Descriptions, Tag } from "antd";
import { InfoCircleOutlined, BookOutlined, OrderedListOutlined, BarChartOutlined, FieldTimeOutlined, AlignLeftOutlined } from "@ant-design/icons";
import { WritingGenerateResponse } from "@/lib/api/writing";
import dayjs from "dayjs";

interface WritingPracticeInfoProps {
    data: WritingGenerateResponse;
}

const TOPIC_LABELS: Record<string, string> = {
    general_communication: "Giao tiếp cơ bản",
    daily_life: "Cuộc sống hàng ngày",
    work_school: "Công việc & Học tập",
    hobbies: "Sở thích & Giải trí",
    travel: "Du lịch & Giao thông",
    shopping_food: "Mua sắm & Ăn uống",
    health_sport: "Sức khỏe & Thể thao",
    weather_environment: "Thời tiết & Môi trường",
    university_life: "Cuộc sống đại học",
    technology_education: "Công nghệ & Giáo dục",
    environment_society: "Môi trường & Xã hội",
    health_lifestyle: "Sức khỏe & Lối sống",
    economy_work: "Kinh tế & Công việc",
    job_interview: "Phỏng vấn xin việc",
    colleague_communication: "Giao tiếp đồng nghiệp",
    meeting_presentation: "Họp & Thuyết trình",
    email_report: "Email & Báo cáo",
    customer_partner: "Khách hàng & Đối tác",
};

export default function WritingPracticeInfo({ data }: WritingPracticeInfoProps) {
    const getDifficultyColor = (diff: number) => {
        if (diff <= 2) return "success";
        if (diff <= 4) return "processing";
        if (diff <= 6) return "warning";
        return "error";
    };

    const topicName = TOPIC_LABELS[data.topic] || data.topic;

    // Format createdAt safely; fallback if undefined
    const createdDate = data.createdAt ? dayjs(data.createdAt).format("DD/MM/YYYY HH:mm") : "N/A";

    return (
        <article className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs dark:shadow-sm mb-6 transition-colors duration-300">
            <header className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <InfoCircleOutlined className="text-blue-500 text-lg" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">Thông tin bài luyện</span>
                </div>
            </header>

            <div className="px-6 py-6">
                <Descriptions
                    bordered
                    column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                    className="bg-transparent"
                >
                    <Descriptions.Item label={<span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><BookOutlined /> Chủ đề</span>}>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{topicName}</span>
                    </Descriptions.Item>

                    <Descriptions.Item label={<span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><AlignLeftOutlined /> Dạng bài</span>}>
                        <span className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono border border-slate-200 dark:border-slate-600">
                                {data.practiceType || "COMMUNICATION"}
                            </span>
                            <Tag color="blue" className="m-0 border-blue-200 dark:border-blue-800">
                                {data.contentType === "DIALOGUE" ? "Hội thoại" : "Đoạn văn"}
                            </Tag>
                        </span>
                    </Descriptions.Item>

                    <Descriptions.Item label={<span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><BarChartOutlined /> Độ khó</span>}>
                        <Tag color={getDifficultyColor(data.difficulty)} className="font-medium">
                            Level {data.difficulty}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={<span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><OrderedListOutlined /> Số lượng câu</span>}>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                            {data.totalSentences} câu
                        </span>
                    </Descriptions.Item>

                    <Descriptions.Item label={<span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><FieldTimeOutlined /> Ngày tạo</span>}>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                            {createdDate}
                        </span>
                    </Descriptions.Item>

                    <Descriptions.Item label={<span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><InfoCircleOutlined /> Trạng thái</span>}>
                        <Tag color="success" className="m-0">Đang luyện tập</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </article>
    );
}
