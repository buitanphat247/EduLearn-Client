import { Avatar } from "antd";

interface ClassListItemProps {
  name: string;
  teacher: string;
  time: string;
  room: string;
}

const getSubjectColor = (name: string) => {
  const colors: { [key: string]: string } = {
    "Toán học": "bg-blue-500",
    "Ngữ văn": "bg-purple-500",
    "Vật lý": "bg-orange-500",
    "Hóa học": "bg-pink-500",
    "Sinh học": "bg-green-500",
    "Lịch sử": "bg-yellow-500",
    "Địa lý": "bg-cyan-500",
    "Tiếng Anh": "bg-indigo-500",
  };
  return colors[name] || "bg-blue-500";
};

export default function ClassListItem({ name, teacher, time, room }: ClassListItemProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar size={48} className={`${getSubjectColor(name)} text-white font-bold shrink-0`}>
        {name[0]}
      </Avatar>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-2">{name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Giáo viên:</span>
            <span>{teacher}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Thời gian:</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Phòng:</span>
            <span>{room}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

