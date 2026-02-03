"use client";

import dynamic from "next/dynamic";
import Features from "@/app/components/home/Features";
import Hero from "@/app/components/home/Hero";
import Stats from "@/app/components/home/Stats";
import ScrollAnimation from "@/app/components/common/ScrollAnimation";

// Dynamic imports for below-the-fold components to reduce initial bundle size
const Testimonials = dynamic(() => import("@/app/components/home/Testimonials"), {
  ssr: true, // Keep SSR for SEO
  loading: () => (
    <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500 py-16">
      <div className="container mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

const Integrations = dynamic(() => import("@/app/components/home/Integrations"), {
  ssr: true,
  loading: () => (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-10">
        <div className="text-center mb-12 space-y-4 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto" />
          <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  ),
});

const ValueProps = dynamic(() => import("@/app/components/home/ValueProps"), {
  ssr: true,
  loading: () => (
    <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500 py-16">
      <div className="container mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-pulse">
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

const CallToAction = dynamic(() => import("@/app/components/home/CallToAction"), {
  ssr: true,
  loading: () => (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-10">
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-12 border border-slate-200 dark:border-slate-700 text-center space-y-6 animate-pulse">
          <div className="h-10 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto" />
          <div className="h-6 w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto" />
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0f172a] transition-all duration-500 ease-in-out">
      <Hero />
      <ScrollAnimation direction="up" delay={0}>
        <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500">
          <Stats />
        </div>
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={100}>
        <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500">
          <Features />
        </div>
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={200}>
        <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500">
          <Testimonials />
        </div>
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={300}>
        <Integrations />
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={400}>
        <ValueProps />
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={500}>
        <CallToAction />
      </ScrollAnimation>
    </div>
  );
}

