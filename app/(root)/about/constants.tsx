import React from "react";
import {
  RocketOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  SunOutlined,
  UserAddOutlined
} from "@ant-design/icons";

/**
 * About Page Constants
 * ✅ Extracted hardcoded arrays to constants file for better maintainability
 */

export interface StatItem {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export interface ValueItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface TargetAudienceItem {
  title: string;
  description: string;
  image: string;
}

export const ABOUT_STATS: StatItem[] = [
  { title: "Học viên", value: "15,000+", icon: <HeartOutlined /> },
  { title: "Khóa học", value: "500+", icon: <RocketOutlined /> },
  { title: "Chuyên gia", value: "100+", icon: <ExperimentOutlined /> },
  { title: "Đánh giá 5*", value: "98%", icon: <SafetyCertificateOutlined /> },
];

export const ABOUT_VALUES: ValueItem[] = [
  {
    icon: <ToolOutlined />,
    title: "Công nghệ tiên phong",
    description: "Sử dụng AI tạo ra hệ thống giám sát và học tập liên tục phát triển.",
  },
  {
    icon: <SunOutlined />,
    title: "Minh bạch tuyệt đối",
    description: "Ngăn chặn và phát hiện gian lận một cách tự động, kết quả công bằng 100%.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Hiệu quả tức thì",
    description: "Phân tích, đánh giá, chấm bài siêu tốc giải phóng thời gian cho giáo viên.",
  },
  {
    icon: <UserAddOutlined />,
    title: "Trải nghiệm cá nhân hoá",
    description: "Gợi ý các công cụ học tập phù hợp nhất với năng lực của từng học viên.",
  },
];

export const TARGET_AUDIENCES: TargetAudienceItem[] = [
  {
    title: "Trường học & Đại học",
    description: "Tổ chức các kỳ thi trực tuyến an toàn với độ bảo mật và trung thực thông tin tối đa.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx9EgMRS3-kDHGtorC-r7NL95AVYF7U1bUWBSdzC0aqsNwzKHV2EuiSq7b-4lqUfO7xlv13Ky9P06s2eu5wDUilLTG4r32B0UujrTLpYJO4sW3zEqBuf-wlFw0EusXYNLLenivEo-w93AJPQsRjyXyTN1MZF9orTICunsFutMcseTtHI2TSLzjjZMK68-UrhcrQBSu-hct7eUuUPIvPEfUEcpE6H59HAo29laPd5yM7RoPZgeTZk_I-LxeYmJCkewRzSSuJUsyJTQ",
  },
  {
    title: "Khảo thí & Trung tâm luyện thi",
    description: "Công cụ giám sát quy mô lớn tự động hoá kết quả trong thời gian thực.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_13-JU4yJLCcS0kKH6thRSH1UXkMZIDiQjyPb7eB_uyj6n6DSjR_uVQdQme23F06ebM0NVMuVXDr-MX2Xej64DT2xgiRG1H70nKp6fS-_hMRE7sBgfVkJfX8HpZGk8Dm_RHJ-Y1Ef5b9nK8T8kGYMAdCwlcV7aDqL_o7y_fqMct5erIPqvQmJ3mQAp4oEydlwGQaHRdZmzWZ54pf0lcKYqb5E9Xv8p1sAUjG21clS5Pxrf4fyftooexi0JZT2hZqxeTSHFiV_98w",
  },
  {
    title: "Giáo viên",
    description: "Giảm tải hoàn toàn việc coi thi và chấm điểm để tập trung vào chất lượng chuyên môn thực sự.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSQgngMJ9WYFv_aSt6zt7oXhAmjXe6DQ1LUrUUy8byPveUNSJEZX3rIIs_rLgQ5kNc9nQal_Aax08V2FOM21z57v3VoHMQn5Wz-dS7uMsHpUTWZtNCjF6llJc5P5scGl2bi864bxID0J-9HuHSjBbOr3iHDXWb9J-ssYuP0fYOsq8lOXQfgTY4gvv-gTNVPzp1nzd55wiKHMcm0t3rw7FORUQ-sbHvO1Q8ei0kUlgaY003-iPceayYE35bU9AgFDrZp6XUJoByOek",
  },
  {
    title: "Học sinh & Học viên",
    description: "Khai thác tối đa năng lực học tập cùng AI trợ lý từ việc nghe, viết, và ghi nhớ lâu sâu sắc.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMaRSQNpeyJbVhXsNNNTcAytC8f_sUSxOB0oP5HtbHZiY-Xi-MSzYZQaCjxsHTrFTui3VrSHctveRij-brueIQxuNSbxG4Y29k7PDpxUV6_ZVI-aOn5FsrAXE5wZGzYX7XXdQor6SI1oVaXwvyxqw0x7b_h2hN2hoQBzBwpJACriCJgsuylvMkSFxppKhuPjfknYaFddf_EkQsrB22QKnfZUE-LJ_uR5Y26ckWb94rUivsuIDS4DRmlZd7DE4fEcx-hwLh-ZSoG50",
  },
];
