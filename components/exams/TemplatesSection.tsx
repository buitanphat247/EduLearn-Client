"use client";

import { DownloadOutlined } from "@ant-design/icons";

interface Template {
  name: string;
  type: string;
}

interface TemplatesSectionProps {
  templates: Template[];
  disabled?: boolean;
}

export default function TemplatesSection({ templates, disabled = false }: TemplatesSectionProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Tải mẫu</h3>
      <div className="space-y-2">
        {templates.map((template, index) => (
          <a
            key={index}
            href="#"
            onClick={(e) => disabled && e.preventDefault()}
            className={`flex items-center gap-2 text-sm ${
              disabled ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:underline"
            }`}
          >
            <DownloadOutlined />
            <span>{template.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
