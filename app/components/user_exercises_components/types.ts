export interface UserExerciseItem {
  key: string;
  name: string;
  class: string;
  subject: string;
  date: string;
  deadline: string;
  status: "Chưa nộp" | "Đã nộp" | "Quá hạn";
}
