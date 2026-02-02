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
    title: "Công nghệ",
    description: "Đổi mới liên tục để luôn đi đầu trong nhu cầu giáo dục.",
  },
  {
    icon: <SunOutlined />,
    title: "Minh bạch",
    description: "Dữ liệu rõ ràng và giao tiếp cởi mở cho tất cả các bên liên quan.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Hiệu quả",
    description: "Tối ưu hóa quy trình làm việc để tập trung vào điều quan trọng: giảng dạy.",
  },
  {
    icon: <UserAddOutlined />,
    title: "Lấy người học làm trung tâm",
    description: "Đặt trải nghiệm học sinh vào trọng tâm của thiết kế.",
  },
];

export const TARGET_AUDIENCES: TargetAudienceItem[] = [
  {
    title: "Trường học",
    description: "Chuyển đổi số cho giáo dục phổ thông.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx9EgMRS3-kDHGtorC-r7NL95AVYF7U1bUWBSdzC0aqsNwzKHV2EuiSq7b-4lqUfO7xlv13Ky9P06s2eu5wDUilLTG4r32B0UujrTLpYJO4sW3zEqBuf-wlFw0EusXYNLLenivEo-w93AJPQsRjyXyTN1MZF9orTICunsFutMcseTtHI2TSLzjjZMK68-UrhcrQBSu-hct7eUuUPIvPEfUEcpE6H59HAo29laPd5yM7RoPZgeTZk_I-LxeYmJCkewRzSSuJUsyJTQ",
  },
  {
    title: "Trung tâm đào tạo",
    description: "Quản lý linh hoạt cho các khóa học chuyên biệt.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_13-JU4yJLCcS0kKH6thRSH1UXkMZIDiQjyPb7eB_uyj6n6DSjR_uVQdQme23F06ebM0NVMuVXDr-MX2Xej64DT2xgiRG1H70nKp6fS-_hMRE7sBgfVkJfX8HpZGk8Dm_RHJ-Y1Ef5b9nK8T8kGYMAdCwlcV7aDqL_o7y_fqMct5erIPqvQmJ3mQAp4oEydlwGQaHRdZmzWZ54pf0lcKYqb5E9Xv8p1sAUjG21clS5Pxrf4fyftooexi0JZT2hZqxeTSHFiV_98w",
  },
  {
    title: "Giáo viên",
    description: "Công cụ tự động hóa chấm điểm và theo dõi tiến độ.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSQgngMJ9WYFv_aSt6zt7oXhAmjXe6DQ1LUrUUy8byPveUNSJEZX3rIIs_rLgQ5kNc9nQal_Aax08V2FOM21z57v3VoHMQn5Wz-dS7uMsHpUTWZtNCjF6llJc5P5scGl2bi864bxID0J-9HuHSjBbOr3iHDXWb9J-ssYuP0fYOsq8lOXQfgTY4gvv-gTNVPzp1nzd55wiKHMcm0t3rw7FORUQ-sbHvO1Q8ei0kUlgaY003-iPceayYE35bU9AgFDrZp6XUJoByOek",
  },
  {
    title: "Học sinh",
    description: "Lộ trình học tập cá nhân hóa để đạt kết quả tốt hơn.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMaRSQNpeyJbVhXsNNNTcAytC8f_sUSxOB0oP5HtbHZiY-Xi-MSzYZQaCjxsHTrFTui3VrSHctveRij-brueIQxuNSbxG4Y29k7PDpxUV6_ZVI-aOn5FsrAXE5wZGzYX7XXdQor6SI1oVaXwvyxqw0x7b_h2hN2hoQBzBwpJACriCJgsuylvMkSFxppKhuPjfknYaFddf_EkQsrB22QKnfZUE-LJ_uR5Y26ckWb94rUivsuIDS4DRmlZd7DE4fEcx-hwLh-ZSoG50",
  },
];
