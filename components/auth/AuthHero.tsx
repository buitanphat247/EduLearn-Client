export default function AuthHero() {
    return (
        <div className="hidden lg:flex flex-1 flex-col justify-center space-y-8 py-12">
            <div className="space-y-4">
                <h1 className="text-6xl font-extrabold leading-tight text-slate-800 dark:text-white tracking-tight transition-colors">
                    Học tập <span className="text-gradient animate-shine">Hiệu quả</span> <br />
                    Tương lai <span className="text-blue-600 dark:text-blue-400">Rạng ngời</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed transition-colors">
                    EduLearn mang đến trải nghiệm học tập đỉnh cao với công nghệ hiện đại, giúp bạn chinh phục mọi thử thách tri thức.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                {[
                    { icon: "📚", title: "Kho Tài Liệu", desc: "Đa dạng & chất lượng" },
                    { icon: "🚀", title: "Lộ Trình & Goal", desc: "Rõ ràng & tối ưu" },
                    { icon: "👥", title: "Cộng Đồng", desc: "Hỗ trợ 24/7" },
                    { icon: "🎓", title: "Chứng Chỉ", desc: "Được công nhận" },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-300 dark:border-slate-700/50 p-5 rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 cursor-default group shadow-sm hover:shadow-md"
                        style={{ animationDelay: `${index * 1.5}s` }}
                    >
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300" suppressHydrationWarning>{item.icon}</div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 transition-colors">{item.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => {
                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                        const initials = ['A', 'T', 'M', 'H'];
                        return (
                            <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-50 dark:border-[#0f172a] ${colors[i - 1]} flex items-center justify-center text-white text-sm font-bold transition-colors`}>
                                {initials[i - 1]}
                            </div>
                        );
                    })}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-[#0f172a] bg-blue-600 flex items-center justify-center text-white text-xs font-bold z-10 transition-colors">
                        10k+
                    </div>
                </div>
                <p>Người học đã tham gia</p>
            </div>
        </div>
    );
}
