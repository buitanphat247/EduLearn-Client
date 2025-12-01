import { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import { SendOutlined, RobotOutlined, CloseOutlined, StopOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  time: string;
  isTyping?: boolean;
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn với các câu hỏi về học tập, bài tập, hoặc bất kỳ điều gì bạn cần. Hãy hỏi tôi bất cứ điều gì!",
      sender: "ai",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(userMessage.text),
        sender: "ai",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes("xin chào") || lowerText.includes("hello") || lowerText.includes("hi")) {
      return "Xin chào! Rất vui được trò chuyện với bạn. Bạn cần tôi giúp gì hôm nay?";
    }
    
    if (lowerText.includes("bài tập") || lowerText.includes("homework")) {
      return "Tôi có thể giúp bạn với bài tập. Bạn đang gặp khó khăn với môn học nào? Hãy mô tả chi tiết câu hỏi hoặc vấn đề bạn đang gặp phải.";
    }
    
    if (lowerText.includes("toán") || lowerText.includes("math")) {
      return "Tôi có thể hỗ trợ bạn với môn Toán. Bạn có thể gửi cho tôi câu hỏi cụ thể, và tôi sẽ cố gắng giải thích cách giải cho bạn.";
    }
    
    if (lowerText.includes("cảm ơn") || lowerText.includes("thank")) {
      return "Không có gì! Tôi rất vui được giúp đỡ bạn. Nếu bạn có thêm câu hỏi nào khác, đừng ngại hỏi tôi nhé!";
    }
    
    return "Cảm ơn bạn đã hỏi. Tôi đang học hỏi và cải thiện khả năng của mình. Bạn có thể mô tả chi tiết hơn về câu hỏi của bạn không? Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* AI Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <RobotOutlined className="text-2xl text-blue-600" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-base">Trợ lý AI</h3>
              <span className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <CloseOutlined className="text-lg" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((message) => (
            <AIMessageBubble
              key={message.id}
              text={message.text}
              time={message.time}
              sender={message.sender}
            />
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-300 rounded-lg px-4 py-3 max-w-[70%]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-300 bg-white shrink-0">
          <div className="flex items-end gap-2">
            <TextArea
              ref={inputRef}
              rows={1}
              placeholder="Nhập câu hỏi của bạn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none flex-1"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isTyping}
            />
            <Button
              type="primary"
              icon={isTyping ? <StopOutlined /> : <SendOutlined />}
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              size="large"
              className="shrink-0"
            >
              {isTyping ? "Đang gửi..." : "Gửi"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
          </p>
        </div>
      </div>
    </>
  );
}

interface AIMessageBubbleProps {
  text: string;
  time: string;
  sender: "user" | "ai";
}

function AIMessageBubble({ text, time, sender }: AIMessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${sender === "user" ? "justify-end" : "justify-start"}`}>
      {sender === "ai" && (
        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
          <RobotOutlined className="text-white text-sm" />
        </div>
      )}
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`rounded-lg px-4 py-2.5 ${
            sender === "user"
              ? "bg-linear-to-r from-blue-500 to-blue-600 text-white"
              : "bg-white text-gray-800 border border-gray-300 shadow-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap wrap-break-word">{text}</p>
        </div>
        <span
          className={`text-xs mt-1 px-1 ${
            sender === "user" ? "text-right text-gray-500" : "text-left text-gray-500"
          }`}
        >
          {time}
        </span>
      </div>
      {sender === "user" && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-1 text-white text-xs font-semibold">
          B
        </div>
      )}
    </div>
  );
}





