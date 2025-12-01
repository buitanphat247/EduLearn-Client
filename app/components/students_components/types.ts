export interface StudentItem {
  key: string;
  name: string;
  studentId: string;
  class: string;
  email: string;
  phone: string;
  status: "Đang học" | "Tạm nghỉ" | "Đã tốt nghiệp";
}
