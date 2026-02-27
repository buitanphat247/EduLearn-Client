"use client";

export default function UserWelcomeBanner() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, Học sinh!</h1>
        <p className="text-blue-50 text-lg">Chào mừng bạn quay trở lại. Dưới đây là tổng quan về học tập của bạn.</p>
      </div>
    </div>
  );
}
