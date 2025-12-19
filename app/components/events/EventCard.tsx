import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, ArrowRightOutlined } from "@ant-design/icons";

interface EventCardProps {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  color: string;
  onDetailClick?: () => void;
}

export default function EventCard({ id, title, date, time, location, status, color, onDetailClick }: EventCardProps) {
  
  const getStatusStyles = (color: string) => {
    switch (color) {
      case 'blue': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'green': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const statusStyle = getStatusStyles(color);
  
  // Side accent color
  const accentColorClass = color === 'blue' ? 'bg-blue-500' : (color === 'green' ? 'bg-emerald-500' : 'bg-gray-400');

  return (
    <div 
      className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100 cursor-pointer"
      onClick={onDetailClick}
    >
      {/* Side Accent Line */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColorClass}`}></div>
      
      <div className="p-6 pl-8 flex-1 flex flex-col relative z-10">
        
        {/* Header: Status & Icon */}
        <div className="flex justify-between items-start mb-5">
           <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide backdrop-blur-sm ${statusStyle}`}>
              {status}
           </span>
           <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
              <CalendarOutlined className="text-lg"/>
           </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        {/* Details Grid */}
        <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
             <CalendarOutlined className="text-blue-500"/>
             <span className="font-semibold text-gray-700">{date}</span>
          </div>
           <div className="flex items-center gap-3 text-gray-500 text-sm">
             <ClockCircleOutlined className="text-gray-400"/>
             <span>{time}</span>
          </div>
           <div className="flex items-center gap-3 text-gray-500 text-sm">
             <EnvironmentOutlined className="text-gray-400"/>
             <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto flex items-center justify-between text-sm font-semibold text-gray-900 pt-2">
            <span className="group-hover:text-blue-600 transition-colors">Xem chi tiết</span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 transform group-hover:translate-x-1">
               <ArrowRightOutlined />
            </div>
        </div>
      </div>
    </div>
  );
}
