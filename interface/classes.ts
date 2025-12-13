export interface ClassItem {
  key: string;
  name: string;
  code: string;
  students: number;
  teacher: string;
  status: "Đang hoạt động" | "Tạm dừng";
}

// API Response interface
export interface ClassApiItem {
  class_id: number;
  name: string;
  code: string;
  student_count: number;
  status: "active" | "inactive";
  created_by: number;
  creator: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
  };
  created_at: string;
}

