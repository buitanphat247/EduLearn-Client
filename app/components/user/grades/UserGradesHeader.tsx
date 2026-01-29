"use client";

import { Select } from "antd";
import { CalendarOutlined, BookOutlined } from "@ant-design/icons";

const { Option } = Select;

interface UserGradesHeaderProps {
  selectedYear: string;
  selectedSemester: string;
  onYearChange: (year: string) => void;
  onSemesterChange: (semester: string) => void;
  years: string[];
  semesters: string[];
}

export default function UserGradesHeader({
  selectedYear,
  selectedSemester,
  onYearChange,
  onSemesterChange,
  years,
  semesters,
}: UserGradesHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Bảng điểm
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={selectedYear}
          onChange={onYearChange}
          size="middle"
          style={{ width: 160 }}
          suffixIcon={<CalendarOutlined />}
          className="shrink-0"
        >
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
        <Select
          value={selectedSemester}
          onChange={onSemesterChange}
          size="middle"
          style={{ width: 150 }}
          suffixIcon={<BookOutlined />}
          className="shrink-0"
        >
          {semesters.map((sem) => (
            <Option key={sem} value={sem}>
              {sem}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
}
