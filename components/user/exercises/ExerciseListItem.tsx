import { List, Tag } from "antd";

interface ExerciseListItemProps {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: string;
  statusColor: string;
  onClick: () => void;
}

export default function ExerciseListItem({
  title,
  subject,
  deadline,
  status,
  statusColor,
  onClick,
}: ExerciseListItemProps) {
  return (
    <List.Item className="cursor-pointer hover:bg-gray-50 rounded-lg p-3" onClick={onClick}>
      <List.Item.Meta
        title={
          <div className="flex items-center justify-between">
            <span className="font-medium">{title}</span>
            <Tag color={statusColor}>{status}</Tag>
          </div>
        }
        description={
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{subject}</span>
            <span>•</span>
            <span>Hạn: {deadline}</span>
          </div>
        }
      />
    </List.Item>
  );
}

