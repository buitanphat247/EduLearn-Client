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
      case 'blue': return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case 'green': return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default: return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600";
    }
  };

  const statusStyle = getStatusStyles(color);
  
  // Side accent color
  const accentColorClass = color === 'blue' ? 'bg-blue-600 dark:bg-blue-500' : (color === 'green' ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-500 dark:bg-slate-600');

  return (
    <div 
      className="group relative bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-slate-200 dark:border-slate-700 cursor-pointer"
      onClick={onDetailClick}
    >
      {/* Side Accent Line */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColorClass}`}></div>
      
      <div className="p-6 flex-1 flex flex-col relative z-10">
        
        {/* Header: Status & Icon */}
        <div className="flex justify-between items-start">
           <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${statusStyle}`}>
              {status}
           </span>
           <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <CalendarOutlined className="text-lg"/>
           </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Details Grid */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
             <CalendarOutlined className="text-blue-500 dark:text-blue-400"/>
             <span className="font-semibold text-slate-700 dark:text-slate-300">{date}</span>
          </div>
           <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
             <ClockCircleOutlined className="text-slate-400 dark:text-slate-500"/>
             <span>{time}</span>
          </div>
           <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
             <EnvironmentOutlined className="text-slate-400 dark:text-slate-500"/>
             <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-white pt-2">
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Xem chi tiết</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 transform group-hover:translate-x-1">
               <ArrowRightOutlined />
            </div>
        </div>
      </div>
    </div>
  );
}
