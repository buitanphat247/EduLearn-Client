"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wrapperClassName?: string;
  inputClassName?: string;
}

export default function SearchInput({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  wrapperClassName = "w-1/2 mx-auto mb-16",
  inputClassName = "w-full shadow-lg shadow-blue-500/5 dark:shadow-black/20",
}: SearchInputProps) {
  return (
    <div className={wrapperClassName}>
      <Input
        prefix={<SearchOutlined className="text-slate-500 dark:text-slate-400 text-xl mr-2 py-2" />}
        placeholder={placeholder}
        allowClear
        value={value}
        onChange={onChange}
        className={inputClassName}
        style={{ height: '40px' }}
      />
    </div>
  );
}
