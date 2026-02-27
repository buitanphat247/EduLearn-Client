"use client";

import { useState } from "react";
import { SwapOutlined, CopyOutlined, SoundOutlined, ReloadOutlined } from "@ant-design/icons";
import { App, Input, Select, Button, message } from "antd";

const { TextArea } = Input;

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "Tiếng Anh", value: "en" },
  { label: "Tiếng Pháp", value: "fr" },
  { label: "Tiếng Đức", value: "de" },
  { label: "Tiếng Tây Ban Nha", value: "es" },
  { label: "Tiếng Nhật", value: "ja" },
  { label: "Tiếng Hàn", value: "ko" },
  { label: "Tiếng Trung", value: "zh" },
];

export default function TranslatorFeature() {
  const { message: messageApi } = App.useApp();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("vi");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      messageApi.warning("Vui lòng nhập văn bản cần dịch");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      messageApi.warning("Ngôn ngữ nguồn và đích không thể giống nhau");
      return;
    }

    setLoading(true);
    try {
      // TODO: Gọi API dịch thuật thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock translation result
      setTranslatedText(`[Dịch từ ${sourceLanguage} sang ${targetLanguage}]\n${sourceText}`);
      messageApi.success("Dịch thuật thành công!");
    } catch (error) {
      messageApi.error("Có lỗi xảy ra khi dịch. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleCopy = (text: string, type: "source" | "target") => {
    navigator.clipboard.writeText(text);
    messageApi.success(type === "source" ? "Đã sao chép văn bản nguồn" : "Đã sao chép văn bản dịch");
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!text.trim()) {
      messageApi.warning("Không có văn bản để phát âm");
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      messageApi.warning("Trình duyệt không hỗ trợ phát âm");
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl p-6 md:p-8 transition-colors duration-300">
          {/* Language Selectors */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-2">Ngôn ngữ nguồn</label>
              <Select
                value={sourceLanguage}
                onChange={setSourceLanguage}
                className="w-full"
                options={languages}
              />
            </div>
            
            <div className="flex items-end justify-center md:justify-start">
              <Button
                type="default"
                icon={<SwapOutlined />}
                onClick={handleSwapLanguages}
                className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all font-medium"
                title="Đổi ngôn ngữ"
              />
            </div>

            <div className="flex-1">
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-2">Ngôn ngữ đích</label>
              <Select
                value={targetLanguage}
                onChange={setTargetLanguage}
                className="w-full"
                options={languages}
              />
            </div>
          </div>

          {/* Translation Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Source Text */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-600 dark:text-slate-300 font-medium">Văn bản cần dịch</label>
                <div className="flex gap-2">
                  {sourceText && (
                    <>
                      <Button
                        type="text"
                        icon={<SoundOutlined />}
                        onClick={() => handleSpeak(sourceText, sourceLanguage)}
                        className="text-slate-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 h-8 px-2"
                        title="Phát âm"
                      />
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy(sourceText, "source")}
                        className="text-slate-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 h-8 px-2"
                        title="Sao chép"
                      />
                    </>
                  )}
                </div>
              </div>
              <TextArea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Nhập văn bản cần dịch..."
                rows={12}
                className="resize-none border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl placeholder:text-slate-400 shadow-sm"
                showCount
                maxLength={5000}
              />
            </div>

            {/* Translated Text */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-600 dark:text-slate-300 font-medium">Kết quả dịch</label>
                <div className="flex gap-2">
                  {translatedText && (
                    <>
                      <Button
                        type="text"
                        icon={<SoundOutlined />}
                        onClick={() => handleSpeak(translatedText, targetLanguage)}
                        className="text-slate-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 h-8 px-2"
                        title="Phát âm"
                      />
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy(translatedText, "target")}
                        className="text-slate-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 h-8 px-2"
                        title="Sao chép"
                      />
                    </>
                  )}
                </div>
              </div>
              <TextArea
                value={translatedText}
                placeholder="Kết quả dịch sẽ hiển thị ở đây..."
                rows={12}
                className="resize-none border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl placeholder:text-slate-400 shadow-sm"
                readOnly
                showCount
                maxLength={5000}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button
              type="primary"
              size="middle"
              loading={loading}
              onClick={handleTranslate}
              className="bg-blue-600 hover:bg-blue-500 border-none rounded-xl h-10 font-semibold text-white shadow-lg hover:shadow-xl dark:shadow-blue-900/40 transition-all flex-1 sm:flex-initial min-w-[160px]"
            >
              Dịch ngay
            </Button>
            <Button
              type="default"
              size="middle"
              icon={<ReloadOutlined />}
              onClick={handleClear}
              className="h-10 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl font-medium transition-all"
            >
              Xóa tất cả
            </Button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 transition-colors duration-300">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">Dịch nhanh</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Dịch thuật tức thời với độ chính xác cao</p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 transition-colors duration-300">
            <div className="text-2xl mb-2">🌐</div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">Đa ngôn ngữ</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Hỗ trợ nhiều ngôn ngữ phổ biến</p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 transition-colors duration-300">
            <div className="text-2xl mb-2">🔊</div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">Phát âm</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nghe phát âm của văn bản dịch</p>
          </div>
        </div>
    </div>
  );
}

