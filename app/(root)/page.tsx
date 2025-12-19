import Events from "@/app/components/home/Events";
import Features from "@/app/components/home/Features";
import Hero from "@/app/components/home/Hero";
import News from "@/app/components/home/News";
import Stats from "@/app/components/home/Stats";
import Testimonials from "@/app/components/home/Testimonials";
import CallToAction from "@/app/components/home/CallToAction";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Hero />
      <div className="border-b border-slate-800">
        <Stats />
      </div>
      <div className="border-b border-slate-800">
        <Features />
      </div>
      <div className="border-b border-slate-800">
        <Events />
      </div>
      <div className="border-b border-slate-800">
        <Testimonials />
      </div>
      <div className="border-b border-slate-800">
        <News />
      </div>
      <CallToAction />
    </div>
  );
}

