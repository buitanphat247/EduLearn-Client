"use client";

import { useState } from "react";
import { Table, Tag, Card } from "antd";
import { TrophyOutlined, BookOutlined } from "@ant-design/icons";
import GradeStatCard from "@/app/components/user_components/GradeStatCard";
import UserGradesHeader from "@/app/components/user_grades_components/UserGradesHeader";

const gradesData = {
  student: {
    name: "Nguyễn Văn A",
    class: "9A3",
    studentId: "HS2024001",
  },
  semesters: ["Học kỳ 1", "Học kỳ 2", "Cả năm"],
  years: ["2024-2025", "2023-2024", "2022-2023"],
  subjects: [
    {
      key: "1",
      subject: "Toán học",
      oral: 8.5,
      test15: 8.0,
      test45: 7.5,
      midterm: 8.0,
      final: 8.5,
      average: 8.1,
    },
    {
      key: "2",
      subject: "Ngữ văn",
      oral: 7.5,
      test15: 8.0,
      test45: 7.0,
      midterm: 7.5,
      final: 8.0,
      average: 7.6,
    },
    {
      key: "3",
      subject: "Tiếng Anh",
      oral: 9.0,
      test15: 8.5,
      test45: 9.0,
      midterm: 8.5,
      final: 9.0,
      average: 8.8,
    },
    {
      key: "4",
      subject: "Vật lý",
      oral: 8.0,
      test15: 7.5,
      test45: 8.0,
      midterm: 7.5,
      final: 8.0,
      average: 7.8,
    },
    {
      key: "5",
      subject: "Hóa học",
      oral: 7.0,
      test15: 7.5,
      test45: 7.0,
      midterm: 7.0,
      final: 7.5,
      average: 7.2,
    },
    {
      key: "6",
      subject: "Sinh học",
      oral: 8.5,
      test15: 8.0,
      test45: 8.5,
      midterm: 8.0,
      final: 8.5,
      average: 8.3,
    },
    {
      key: "7",
      subject: "Lịch sử",
      oral: 8.0,
      test15: 8.5,
      test45: 8.0,
      midterm: 8.5,
      final: 8.0,
      average: 8.2,
    },
    {
      key: "8",
      subject: "Địa lý",
      oral: 7.5,
      test15: 8.0,
      test45: 7.5,
      midterm: 8.0,
      final: 7.5,
      average: 7.7,
    },
    {
      key: "9",
      subject: "GDCD",
      oral: 9.0,
      test15: 9.0,
      test45: 8.5,
      midterm: 9.0,
      final: 9.0,
      average: 8.9,
    },
    {
      key: "10",
      subject: "Tin học",
      oral: 9.5,
      test15: 9.0,
      test45: 9.5,
      midterm: 9.0,
      final: 9.5,
      average: 9.3,
    },
  ],
};

const getScoreColor = (score: number | null) => {
  if (score === null) return "text-gray-400";
  if (score >= 8.5) return "text-green-600 font-semibold";
  if (score >= 6.5) return "text-blue-600";
  if (score >= 5.0) return "text-orange-500";
  return "text-red-500";
};

const getAverageTag = (score: number) => {
  if (score >= 8.5) return { color: "green", text: "Giỏi" };
  if (score >= 6.5) return { color: "blue", text: "Khá" };
  if (score >= 5.0) return { color: "orange", text: "TB" };
  return { color: "red", text: "Yếu" };
};

export default function UserGrades() {
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1");

  const totalAverage = gradesData.subjects.reduce((sum, s) => sum + s.average, 0) / gradesData.subjects.length;
  const averageTag = getAverageTag(totalAverage);

  const columns = [
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      fixed: "left" as const,
      width: 140,
      render: (text: string) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: "Miệng",
      dataIndex: "oral",
      key: "oral",
      width: 70,
      align: "center" as const,
      render: (score: number) => <span className={getScoreColor(score)}>{score}</span>,
    },
    {
      title: "15 phút",
      dataIndex: "test15",
      key: "test15",
      width: 80,
      align: "center" as const,
      render: (score: number) => <span className={getScoreColor(score)}>{score}</span>,
    },
    {
      title: "1 tiết",
      dataIndex: "test45",
      key: "test45",
      width: 70,
      align: "center" as const,
      render: (score: number) => <span className={getScoreColor(score)}>{score}</span>,
    },
    {
      title: "Giữa kỳ",
      dataIndex: "midterm",
      key: "midterm",
      width: 80,
      align: "center" as const,
      render: (score: number) => <span className={getScoreColor(score)}>{score}</span>,
    },
    {
      title: "Cuối kỳ",
      dataIndex: "final",
      key: "final",
      width: 80,
      align: "center" as const,
      render: (score: number) => <span className={getScoreColor(score)}>{score}</span>,
    },
    {
      title: "TB môn",
      dataIndex: "average",
      key: "average",
      width: 90,
      align: "center" as const,
      render: (score: number) => {
        return (
          <div className="flex items-center justify-center gap-1">
            <span className={`font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
          </div>
        );
      },
    },
    {
      title: "Xếp loại",
      key: "rank",
      width: 80,
      align: "center" as const,
      render: (_: any, record: any) => {
        const tag = getAverageTag(record.average);
        return <Tag color={tag.color}>{tag.text}</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-3">
      <UserGradesHeader
        selectedYear={selectedYear}
        selectedSemester={selectedSemester}
        onYearChange={setSelectedYear}
        onSemesterChange={setSelectedSemester}
        years={gradesData.years}
        semesters={gradesData.semesters}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GradeStatCard
          title="Học sinh"
          value={gradesData.student.name}
          borderColor="blue"
          subtitle={`Lớp ${gradesData.student.class} • ${gradesData.student.studentId}`}
        />
        <GradeStatCard
          title="Điểm TB"
          value={<span className="text-2xl font-bold text-green-600">{totalAverage.toFixed(1)}</span>}
          borderColor="green"
          tag={averageTag}
        />
        <GradeStatCard
          title="Môn cao nhất"
          value={gradesData.subjects.reduce((prev, curr) => (prev.average > curr.average ? prev : curr)).subject}
          borderColor="yellow"
          subtitle={
            <span className="text-yellow-600 flex items-center gap-1">
              <TrophyOutlined />
              {Math.max(...gradesData.subjects.map((s) => s.average)).toFixed(1)} điểm
            </span>
          }
        />
        <GradeStatCard
          title="Xếp hạng lớp"
          value={
            <>
              <span className="text-2xl font-bold text-purple-600">5</span>
              <span className="text-gray-500 text-sm">/ 42</span>
            </>
          }
          borderColor="purple"
          subtitle="Top 12%"
        />
      </div>

      <Card
        className="border border-gray-200 hover:shadow-lg transition-all duration-300"
        styles={{
          body: { padding: "20px" },
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOutlined className="text-blue-500" />
          <span className="text-lg font-semibold text-gray-800">
            Chi tiết điểm số - {selectedSemester} ({selectedYear})
          </span>
        </div>
        <Table
          columns={columns}
          dataSource={gradesData.subjects}
          pagination={false}
          scroll={{ x: 700 }}
          size="middle"
          className="grades-table"
          rowClassName={(_, index) => (index % 2 === 0 ? "bg-gray-50" : "")}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-blue-50 font-semibold">
                <Table.Summary.Cell index={0}>
                  <span className="font-bold text-blue-700">Điểm TB</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="center">
                  <span className="text-lg font-bold text-blue-700">{totalAverage.toFixed(1)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  <Tag color={averageTag.color} className="font-bold">
                    {averageTag.text}
                  </Tag>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <div className="mt-3">
        <Card
          className="border border-gray-200 hover:shadow-lg transition-all duration-300"
          styles={{
            body: { padding: "16px" },
          }}
        >
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">Chú thích:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Giỏi (≥8.5)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Khá (6.5-8.4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span>TB (5.0-6.4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Yếu (&lt;5.0)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
