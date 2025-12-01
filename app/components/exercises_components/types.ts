export interface ExerciseItem {
  key: string;
  name: string;
  class: string;
  subject: string;
  date: string;
  deadline: string;
  status: "Đang mở" | "Đã đóng";
}
