interface ContentHeaderProps {
  title: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const gradeFilters = [
  "Tất cả",
  "Khối 1",
  "Khối 2",
  "Khối 3",
  "Khối 4",
  "Khối 5",
  "Khối 6",
  "Khối 7",
  "Khối 8",
  "Khối 9",
  "Khối 10",
  "Khối 11",
  "Khối 12",
  "Khác",
];

export default function ContentHeader({ title, activeFilter, onFilterChange }: ContentHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="px-6 py-5">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-5">
          {title}
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {gradeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeFilter === filter
                  ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

