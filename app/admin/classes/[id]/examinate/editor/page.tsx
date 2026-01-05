"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Button, Input, Modal } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  StarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  PartData,
  QuestionItem,
  QuestionType,
  GeneralConfig,
  LatexEditor,
  QuestionCard,
  getQuestionType,
} from "@/app/components/exams/editor";

export default function ExamEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const classId = params?.id as string;

  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [examTitle, setExamTitle] = useState("Kiểm tra 15 phút - Toán Đại Số - Lớp 12");
  const [timeMinutes, setTimeMinutes] = useState(45);
  const [maxScore, setMaxScore] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(40);
  const [status, setStatus] = useState("draft");
  const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);

  // Initialize with new data structure
  const [partsData, setPartsData] = useState<PartData[]>([
    {
      name: "PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.",
      questions: [
        {
          id: "1",
          question: "Mệnh đề toán học nào sau đây là mệnh đề sai?",
          answers: [
            { key: "A", content: "Số 2 là số nguyên." },
            { key: "B", content: "Số 2 là số hữu tỉ." },
            { key: "C", content: "Số 2 là số hữu tỉ dương." },
            { key: "D", content: "Số 2 không là số nguyên tố." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "2",
          question: "Cho hai tập hợp [:$mathm2_1$] và [:$mathm2_2$]. Tập hợp [:$mathm2_3$] là",
          answers: [
            { key: "A", content: "tập hợp tất cả các phần tử thuộc [:$mathm2_4$] hoặc thuộc [:$mathm2_5$]." },
            { key: "B", content: "tập hợp tất cả các phần tử vừa thuộc [:$mathm2_6$] vừa thuộc [:$mathm2_7$]." },
            { key: "C", content: "tập hợp các phần tử thuộc [:$mathm2_8$] nhưng không thuộc [:$mathm2_9$]." },
            { key: "D", content: "tập hợp tất cả các phần tử thuộc [:$mathm2_10$] nhưng không thuộc [:$mathm2_11$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "3",
          question: "Tập hợp rỗng là",
          answers: [
            { key: "A", content: "tập hợp có đúng 1 phần tử." },
            { key: "B", content: "tập hợp có đúng 2 phần tử." },
            { key: "C", content: "tập hợp có vô số phần tử." },
            { key: "D", content: "tập hợp không có phần tử nào." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "4",
          question:
            "Cho hai tập hợp [:$mathm4_1$] và [:$mathm4_2$] khác [:$mathm4_3$]. Tập hợp [:$mathm4_4$] là tập hợp con của tập hợp [:$mathm4_5$] khi và chỉ khi",
          answers: [
            { key: "A", content: "có một phần tử của [:$mathm4_6$] là phần tử của [:$mathm4_7$]." },
            { key: "B", content: "mọi phần tử của [:$mathm4_8$] đều là phần tử của [:$mathm4_9$]." },
            { key: "C", content: "mọi phần tử của [:$mathm4_10$] đều là phần tử của [:$mathm4_11$]." },
            { key: "D", content: "hiệu của [:$mathm4_12$] và [:$mathm4_13$] là tập hợp khác rỗng." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "5",
          question: "Phát biểu nào nào sau đây là đúng?",
          answers: [
            { key: "A", content: "Với hai vectơ bất kì [:$mathm5_1$] và số thực [:$mathm5_2$], ta có: [:$mathm5_3$]." },
            { key: "B", content: "Với hai vectơ bất kì [:$mathm5_4$] và số thực [:$mathm5_5$], ta có: [:$mathm5_6$]." },
            { key: "C", content: "Với hai vectơ bất kì [:$mathm5_7$] và số thực [:$mathm5_8$], ta có: [:$mathm5_9$]." },
            { key: "D", content: "Với hai vectơ bất kì [:$mathm5_10$] và số thực [:$mathm5_11$], ta có: [:$mathm5_12$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "6",
          question: "Cho góc nhọn [:$mathm6_1$] tùy ý. Phát biểu nào sau đây là đúng?",
          answers: [
            { key: "A", content: "[:$mathm6_2$]." },
            { key: "B", content: "[:$mathm6_3$]." },
            { key: "C", content: "[:$mathm6_4$]." },
            { key: "D", content: "[:$mathm6_5$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "7",
          question: "Cho góc nhọn [:$mathm7_1$] tùy ý. Phát biểu nào sau đây là đúng?",
          answers: [
            { key: "A", content: "[:$mathm7_2$]." },
            { key: "B", content: "[:$mathm7_3$]." },
            { key: "C", content: "[:$mathm7_4$]." },
            { key: "D", content: "[:$mathm7_5$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "8",
          question: "Cho [:$mathm8_1$] là trọng tâm [:$mathm8_2$] và điểm [:$mathm8_3$] tùy ý. Phát biểu nào sau đây là đúng?",
          answers: [
            { key: "A", content: "[:$mathm8_4$]." },
            { key: "B", content: "[:$mathm8_5$]." },
            { key: "C", content: "[:$mathm8_6$]." },
            { key: "D", content: "[:$mathm8_7$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "9",
          question: "Cho tam giác nhọn [:$mathm9_1$] nội tiếp đường tròn bán kính [:$mathm9_2$]. Phát biểu nào sau đây là đúng?",
          answers: [
            { key: "A", content: "[:$mathm9_3$]." },
            { key: "B", content: "[:$mathm9_4$]." },
            { key: "C", content: "[:$mathm9_5$]." },
            { key: "D", content: "[:$mathm9_6$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "10",
          question: "Cho tam giác [:$mathm10_1$]. Phát biểu nào sau đây là đúng?",
          answers: [
            { key: "A", content: "[:$mathm10_2$]" },
            { key: "B", content: "[:$mathm10_3$]" },
            { key: "C", content: "[:$mathm10_4$]" },
            { key: "D", content: "[:$mathm10_5$]" },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "11",
          question:
            "Cho đoạn thẳng [:$mathm11_1$] và hai điểm [:$mathm11_2$] thuộc đoạn thẳng [:$mathm11_3$] sao cho: [:$mathm11_4$]. Phát biểu nào sau đây là đúng?",
          answers: [
            { key: "A", content: "[:$mathm11_5$]." },
            { key: "B", content: "[:$mathm11_6$]." },
            { key: "C", content: "[:$mathm11_7$]." },
            { key: "D", content: "[:$mathm11_8$]." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
        },
        {
          id: "12",
          question:
            "Cho hệ bất phương trình bậc nhất hai ẩn [:$mathm12_1$] có miền nghiệm được biểu diễn là hình tứ giác [:$mathm12_2$] (tham khảo hình vẽ). Giá trị lớn nhất của biểu thức [:$mathm12_3$] bằng bao nhiêu?",
          answers: [
            { key: "A", content: "6 ." },
            { key: "B", content: "7 ." },
            { key: "C", content: "8 ." },
            { key: "D", content: "5 ." },
          ],
          correct_answer: { A: false, B: false, C: false, D: false },
          picture: "https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev/image-maths/20260102_162121_508.jpeg",
        },
      ],
    },
    {
      name: "PHẦN II. Câu trắc nghiệm đúng sai.",
      questions: [
        {
          id: "1",
          question:
            "Một cuộc thi bắn cung có 20 người tham gia. Trong lần bắn đầu tiên có 18 người bắn trúng mục tiêu. Trong lần bắn thứ hai có 15 người bắn trúng mục tiêu. Trong lần bắn thứ ba chỉ còn 10 người bắn trúng mục tiêu.",
          answers: [
            { key: "A", content: "Số người bắn trượt mục tiêu trong lần đầu tiên là 2 ." },
            { key: "B", content: "Số người bắn trượt mục tiêu trong lần bắn thứ hai là 6 ." },
            { key: "C", content: "Số người bắn trượt mục tiêu trong lần bắn thứ nhất và thứ hai nhiều nhất là 8 ." },
            { key: "D", content: "Số người bắn trúng mục tiêu trong cả ba lần bắn ít nhất là 3." },
          ],
          correct_answer: { B: false, C: false },
        },
        {
          id: "2",
          question:
            "Cho tứ giác [:$mathm14_1$] có [:$mathm14_2$] lần lượt là trung điểm của các cạnh [:$mathm14_3$]. Gọi [:$mathm14_4$] là trung điểm của đoạn thẳng [:$mathm14_5$] và [:$mathm14_6$] là trọng tâm tam giác [:$mathm14_7$].",
          answers: [
            { key: "A", content: "[:$mathm14_8$]." },
            { key: "B", content: "[:$mathm14_9$]." },
            { key: "C", content: "[:$mathm14_10$]." },
            { key: "D", content: "[:$mathm14_11$]." },
          ],
          correct_answer: { B: false, C: false, D: false },
        },
        {
          id: "3",
          question:
            "Cho hình bình hành [:$mathm15_1$]. Gọi [:$mathm15_2$] là giao điểm của [:$mathm15_3$] và [:$mathm15_4$] (Hình bên).",
          picture: "https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev/image-maths/20260102_162123_673.jpeg",
          answers: [
            { key: "A", content: "[:$mathm15_5$] và [:$mathm15_6$] là hai vectơ đối nhau." },
            { key: "B", content: "[:$mathm15_7$] và [:$mathm15_8$] là hai vectơ đối nhau." },
            { key: "C", content: "[:$mathm15_9$]." },
            { key: "D", content: "[:$mathm15_10$]." },
          ],
          correct_answer: { B: false },
        },
        {
          id: "4",
          question: "Lớp 10A có 40 học sinh, trong đó có 27 học sinh tham gia câu lạc bộ bóng rổ và 25 học sinh tham gia câu lạc bộ bóng đá.",
          answers: [
            { key: "A", content: "Số học sinh tham gia câu lạc bộ bóng rổ hoặc tham gia câu lạc bộ bóng đá nhiều nhất là 40." },
            { key: "B", content: "Số học sinh tham gia cả hai câu lạc bộ bóng rổ và bóng đá ít nhất là 10." },
            { key: "C", content: "Số học sinh không tham gia cả hai câu lạc bộ bóng rổ và bóng đá ít nhất là 1." },
            { key: "D", content: "Số học sinh không tham gia cả hai câu lạc bộ bóng rổ và bóng đá nhiều nhất là 10." },
          ],
          correct_answer: { B: false, C: false, D: false },
        },
      ],
    },
    {
      name: "PHẦN III. Câu trắc nghiệm trả lời ngắn.",
      questions: [
        {
          id: "1",
          question: "Cho hình chữ nhật [:$mathm17_1$] có [:$mathm17_2$]. Độ dài của vectơ [:$mathm17_3$] bằng bao nhiêu?",
          answers: [{ key: "A", content: "10" }],
          correct_answer: { A: false },
        },
        {
          id: "2",
          question:
            "Để đo khoảng cách từ vị trí [:$mathm18_1$] đến vị trí [:$mathm18_2$] ở hai bên bờ hồ, bạn Hà tiến hành đo khoảng cách [:$mathm18_3$] và các góc [:$mathm18_4$]. Kết quả nhận được là: [:$mathm18_5$] và [:$mathm18_6$] (Hình bên). Khoảng cách từ vị trí [:$mathm18_7$] đến vị trí [:$mathm18_8$] là bao nhiêu mét (làm tròn kết quả đến hàng đơn vị của mét)?",
          picture: "https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev/image-maths/20260102_162125_437.jpeg",
          answers: [{ key: "A", content: "31" }],
          correct_answer: { A: false },
        },
        {
          id: "3",
          question:
            "Hai tàu đánh cá cùng xuất phát từ bến [:$mathm19_1$] và đi về hai vùng biển khác nhau theo hai nửa đường thẳng tạo với nhau một góc [:$mathm19_2$]. Tàu thứ nhất chạy với tốc độ 8 hải lí một giờ và tàu thứ hai chạy với tốc độ 12 hải lí một giờ. Sau đúng 2 giờ thì khoảng cách giữa hai tàu là bao nhiêu hải lí (làm tròn kết quả đến hàng đơn vị của hải lí)?",
          answers: [{ key: "A", content: "21" }],
          correct_answer: { A: false },
        },
        {
          id: "4",
          question:
            "Có 100 tấm thẻ được đánh số thứ tự từ 1 đến 100 và được đặt ngửa trên bàn. Người ta lật ngược các tấm thẻ như sau:\nLần thứ nhất, lật ngược tất cả các tấm thẻ có số thứ tự chia hết cho 2.\nLần thứ hai, lật ngược tất cả các tấm thẻ có số thứ tự chia hết cho 5 .\nHỏi sau lần thứ hai, có bao nhiêu tấm thẻ được đặt sấp. Biết rằng, khi bị lật ngược, thẻ đang ngửa sẽ thành sấp và thẻ đang sấp sẽ thành ngửa.",
          answers: [{ key: "A", content: "50" }],
          correct_answer: { A: false },
        },
        {
          id: "5",
          question:
            "Để chế biến một hộp thực phẩm [:$mathm21_1$] cần [:$mathm21_2$] cà chua và [:$mathm21_3$] thịt; một hộp thực phẩm [:$mathm21_4$] cần [:$mathm21_5$] cà chua và [:$mathm21_6$] thịt. Lợi nhuận thu được từ 1 hộp thực phẩm [:$mathm21_7$] và 1 hộp thực phẩm [:$mathm21_8$] lần lượt là 4000 đồng và 5000 đồng. Chị Hoa có [:$mathm21_9$] cà chua và [:$mathm21_10$] thịt để sản xuất các hộp thực phẩm [:$mathm21_11$] và [:$mathm21_12$]. Với lượng nguyên liệu như trên, lợi nhuận lớn nhất chị Hoa có thể thu được là bao nhiêu nghìn đồng?",
          answers: [{ key: "A", content: "45" }],
          correct_answer: { A: false },
        },
        {
          id: "6",
          question:
            "Một xưởng sản xuất bàn và ghế. Thời gian để một công nhân hoàn thiện 1 chiếc bàn và 1 chiếc ghế lần lượt là 120 phút và 30 phút. Xưởng có 4 công nhân, mỗi công nhân làm việc không quá 6 tiếng mỗi ngày. Biết rằng sản phẩm của xưởng luôn được tiêu thụ hết, mỗi chiếc bàn lãi 200 nghì đồng, mỗi chiếc ghế lãi 75 nghì đồng và số ghế không vượt quá 4 lần số bàn. Trong một ngày sản xuất, xưởng có thể thu được lợi nhuận lớn nhất là bao nhiêu tiền? Viết câu trả lời theo đơn vị triệu đồng.",
          answers: [{ key: "A", content: "3" }],
          correct_answer: { A: false },
        },
      ],
    },
  ]);

  const handleSave = useCallback(() => {
    message.success("Lưu đề thi thành công!");
  }, [message]);

  const handleCancel = useCallback(() => {
    router.push(`/admin/classes/${classId}/examinate`);
  }, [router, classId]);

  const handleAddQuestion = useCallback(() => {
    setShowQuestionTypeModal(true);
  }, []);

  const handleCreateQuestion = useCallback((type: QuestionType) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      // Add to first part for now (can be enhanced to select part)
      if (newParts.length > 0) {
        const partIndex = 0;
        const newQuestion: QuestionItem = {
          id: String(Date.now()),
          question: "",
          answers:
            type === "fill_blank"
              ? [{ key: "A", content: "" }]
              : type === "true_false"
              ? [
                  { key: "A", content: "" },
                  { key: "B", content: "" },
                ]
              : [
                  { key: "A", content: "" },
                  { key: "B", content: "" },
                ],
          correct_answer: type === "fill_blank" ? { A: false } : type === "true_false" ? { A: false, B: false } : { A: false, B: false },
        };
        newParts[partIndex].questions.push(newQuestion);
      }
      return newParts;
    });
    setShowQuestionTypeModal(false);
  }, []);

  const handleDeleteQuestion = useCallback((partIndex: number, questionId: string) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      if (newParts[partIndex]) {
        newParts[partIndex] = {
          ...newParts[partIndex],
          questions: newParts[partIndex].questions.filter((q) => q.id !== questionId),
        };
      }
      return newParts;
    });
  }, []);

  const handleUpdateQuestion = useCallback((partIndex: number, questionId: string, field: keyof QuestionItem, value: any) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      if (newParts[partIndex]) {
        newParts[partIndex] = {
          ...newParts[partIndex],
          questions: newParts[partIndex].questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
        };
      }
      return newParts;
    });
  }, []);

  const handleUpdateAnswer = useCallback((partIndex: number, questionId: string, answerIndex: number, field: string, value: any) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      if (newParts[partIndex]) {
        newParts[partIndex] = {
          ...newParts[partIndex],
          questions: newParts[partIndex].questions.map((q) => {
            if (q.id === questionId) {
              const newAnswers = [...q.answers];
              newAnswers[answerIndex] = { ...newAnswers[answerIndex], [field]: value };
              return { ...q, answers: newAnswers };
            }
            return q;
          }),
        };
      }
      return newParts;
    });
  }, []);

  const handleAddAnswer = useCallback((partIndex: number, questionId: string) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      if (newParts[partIndex]) {
        newParts[partIndex] = {
          ...newParts[partIndex],
          questions: newParts[partIndex].questions.map((q) => {
            if (q.id === questionId) {
              const nextKey = String.fromCharCode(65 + q.answers.length); // A, B, C, D...
              const newAnswer = { key: nextKey, content: "" };
              return {
                ...q,
                answers: [...q.answers, newAnswer],
                correct_answer: { ...q.correct_answer, [nextKey]: false },
              };
            }
            return q;
          }),
        };
      }
      return newParts;
    });
  }, []);

  const handleRemoveAnswer = useCallback((partIndex: number, questionId: string, answerIndex: number) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      if (newParts[partIndex]) {
        newParts[partIndex] = {
          ...newParts[partIndex],
          questions: newParts[partIndex].questions.map((q) => {
            if (q.id === questionId) {
              const removedAnswer = q.answers[answerIndex];
              const newAnswers = q.answers.filter((_, index) => index !== answerIndex);
              const newCorrectAnswer = { ...q.correct_answer };
              delete newCorrectAnswer[removedAnswer.key];
              return {
                ...q,
                answers: newAnswers,
                correct_answer: newCorrectAnswer,
              };
            }
            return q;
          }),
        };
      }
      return newParts;
    });
  }, []);

  const handleSelectAnswer = useCallback((partIndex: number, questionId: string, answerIndex: number) => {
    setPartsData((prev) => {
      const newParts = [...prev];
      if (newParts[partIndex]) {
        newParts[partIndex] = {
          ...newParts[partIndex],
          questions: newParts[partIndex].questions.map((q) => {
            if (q.id === questionId) {
              const selectedAnswer = q.answers[answerIndex];
              // For multiple choice: only one correct answer
              // For true_false: can have multiple correct answers
              const questionType = getQuestionType(newParts[partIndex].name);
              const newCorrectAnswer: Record<string, boolean> = {};

              if (questionType === "multiple_choice") {
                // Set all to false, then set selected to true
                q.answers.forEach((ans) => {
                  newCorrectAnswer[ans.key] = false;
                });
                newCorrectAnswer[selectedAnswer.key] = true;
              } else if (questionType === "true_false") {
                // Toggle the selected answer
                newCorrectAnswer[selectedAnswer.key] = !q.correct_answer[selectedAnswer.key];
                // Keep other answers' states
                q.answers.forEach((ans) => {
                  if (ans.key !== selectedAnswer.key) {
                    newCorrectAnswer[ans.key] = q.correct_answer[ans.key] || false;
                  }
                });
              } else {
                // fill_blank: just update the answer
                newCorrectAnswer[selectedAnswer.key] = true;
              }

              return { ...q, correct_answer: newCorrectAnswer };
            }
            return q;
          }),
        };
      }
      return newParts;
    });
  }, []);

  // Generate LaTeX source from partsData
  const generateLatexSource = useCallback((): string => {
    let latex = "";

    // Generate LaTeX for each part
    partsData.forEach((part) => {
      latex += `${part.name}\n`;
      latex += `Trả lời các câu hỏi từ 1 đến ${part.questions.length}, chọn một phương án đúng cho mỗi câu.\n\n`;

      part.questions.forEach((question, index) => {
        latex += `Câu ${index + 1}. ${question.question}\n`;

        const questionType = getQuestionType(part.name);

        if (questionType === "true_false") {
          question.answers.forEach((answer) => {
            const isCorrect = question.correct_answer[answer.key] === true;
            const marker = isCorrect ? "*" : "×";
            latex += `${marker}${answer.key}. ${answer.content} - ${isCorrect ? "Đúng" : "Sai"}\n`;
          });
        } else if (questionType === "fill_blank") {
          latex += `Đáp án: ${question.answers[0]?.content || ""}\n`;
        } else {
          // multiple_choice
          question.answers.forEach((answer) => {
            const isCorrect = question.correct_answer[answer.key] === true;
            const marker = isCorrect ? "*" : "";
            latex += `${marker}${answer.key}. ${answer.content}\n`;
          });
        }

        latex += `% End of Question ${index + 1}\n\n`;
      });
    });

    return latex;
  }, [partsData]);

  const [latexSource, setLatexSource] = useState("");

  // Update LaTeX source when questions change
  useEffect(() => {
    setLatexSource(generateLatexSource());
  }, [generateLatexSource]);

  const latexLines = useMemo(() => latexSource.split("\n"), [latexSource]);
  const totalLines = latexLines.length;

  const handleLatexChange = useCallback((value: string) => {
    setLatexSource(value);
  }, []);

  // Calculate total questions count
  const totalQuestionsCount = useMemo(() => {
    return partsData.reduce((sum, part) => sum + part.questions.length, 0);
  }, [partsData]);

  // Update totalQuestions when partsData changes
  useEffect(() => {
    setTotalQuestions(totalQuestionsCount);
  }, [totalQuestionsCount]);

  const handleLineNumbersScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      const diff = Math.abs(textareaRef.current.scrollTop - lineNumbersRef.current.scrollTop);
      if (diff > 1) {
        textareaRef.current.scrollTop = lineNumbersRef.current.scrollTop;
      }
    }
  }, []);

  const handleTextareaScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      const diff = Math.abs(lineNumbersRef.current.scrollTop - textareaRef.current.scrollTop);
      if (diff > 1) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  }, []);

  // Memoize callbacks for GeneralConfig
  const handleTimeChange = useCallback((value: number | null) => {
    setTimeMinutes(value || 0);
  }, []);

  const handleMaxScoreChange = useCallback((value: number | null) => {
    setMaxScore(value || 0);
  }, []);

  const handleTotalQuestionsChange = useCallback((value: number | null) => {
    setTotalQuestions(value || 0);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
  }, []);

  const handleExamTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExamTitle(e.target.value);
  }, []);

  return (
    <div className="bg-gray-50/50 h-full flex flex-col space-y-3 overflow-hidden">
      <style jsx global>{`
        /* Custom Scrollbar for Main Content */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel} className="text-blue-600 hover:text-blue-700 border-none shadow-none">
              Quay lại
            </Button>
            <Input
              value={examTitle}
              onChange={handleExamTitleChange}
              className="text-base font-medium border-gray-200 rounded-md"
              style={{ width: "500px" }}
              placeholder="Nhập tên đề thi..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Lưu đề thi
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Main Content Area */}
          <div className="h-full overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {/* General Configuration */}
            <GeneralConfig
              timeMinutes={timeMinutes}
              maxScore={maxScore}
              totalQuestions={totalQuestions}
              status={status}
              onTimeChange={handleTimeChange}
              onMaxScoreChange={handleMaxScoreChange}
              onTotalQuestionsChange={handleTotalQuestionsChange}
              onStatusChange={handleStatusChange}
            />

            {/* Questions Section */}
            {partsData.map((part, partIndex) => (
              <div key={partIndex} className="space-y-6">
                {/* Part Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-blue-600">{part.name}</h3>
                    <Button type="link" icon={<StarOutlined />} className="text-blue-600 p-0 h-auto">
                      Cố định câu hỏi
                    </Button>
                  </div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuestion} className="bg-blue-600">
                    Thêm câu hỏi
                  </Button>
                </div>

                {/* Questions List */}
                {part.questions.map((question, questionIndex) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    partIndex={partIndex}
                    partName={part.name}
                    questionIndex={questionIndex}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                    onAddAnswer={handleAddAnswer}
                    onUpdateAnswer={handleUpdateAnswer}
                    onRemoveAnswer={handleRemoveAnswer}
                    onSelectAnswer={handleSelectAnswer}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Sidebar - LaTeX Source */}
          <LatexEditor
            latexSource={latexSource}
            latexLines={latexLines}
            totalLines={totalLines}
            onLatexChange={handleLatexChange}
            lineNumbersRef={lineNumbersRef}
            textareaRef={textareaRef}
            onLineNumbersScroll={handleLineNumbersScroll}
            onTextareaScroll={handleTextareaScroll}
          />
        </div>
      </div>

      {/* Modal chọn loại câu hỏi */}
      <Modal title="Chọn loại câu hỏi" open={showQuestionTypeModal} onCancel={() => setShowQuestionTypeModal(false)} footer={null} width={600}>
        <div className="grid grid-cols-3 gap-4 py-4">
          <div
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            onClick={() => handleCreateQuestion("multiple_choice")}
          >
            <div className="text-center">
              <FileTextOutlined className="text-3xl text-blue-600 mb-2" />
              <div className="font-semibold text-gray-800">Trắc nghiệm</div>
              <div className="text-sm text-gray-500 mt-1">Nhiều phương án lựa chọn</div>
            </div>
          </div>
          <div
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
            onClick={() => handleCreateQuestion("true_false")}
          >
            <div className="text-center">
              <InfoCircleOutlined className="text-3xl text-orange-600 mb-2" />
              <div className="font-semibold text-gray-800">Đúng/Sai</div>
              <div className="text-sm text-gray-500 mt-1">Nhiều câu hỏi, chọn Đúng/Sai</div>
            </div>
          </div>
          <div
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
            onClick={() => handleCreateQuestion("fill_blank")}
          >
            <div className="text-center">
              <FileTextOutlined className="text-3xl text-green-600 mb-2" />
              <div className="font-semibold text-gray-800">Tự luận</div>
              <div className="text-sm text-gray-500 mt-1">Điền đáp án vào ô trống</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
