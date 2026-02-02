"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Features from "@/app/components/home/Features";
import Hero from "@/app/components/home/Hero";
import Stats from "@/app/components/home/Stats";
import ScrollAnimation from "@/app/components/common/ScrollAnimation";

// Dynamic imports for below-the-fold components to reduce initial bundle size
const Testimonials = dynamic(() => import("@/app/components/home/Testimonials"), {
  ssr: true, // Keep SSR for SEO
});

const Integrations = dynamic(() => import("@/app/components/home/Integrations"), {
  ssr: true,
});

const ValueProps = dynamic(() => import("@/app/components/home/ValueProps"), {
  ssr: true,
});

const CallToAction = dynamic(() => import("@/app/components/home/CallToAction"), {
  ssr: true,
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
          <Suspense fallback={<div className="h-64" />}>
            <Testimonials />
          </Suspense>
        </div>
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={300}>
        <Suspense fallback={<div className="h-64" />}>
          <Integrations />
        </Suspense>
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={400}>
        <Suspense fallback={<div className="h-64" />}>
          <ValueProps />
        </Suspense>
      </ScrollAnimation>
      <ScrollAnimation direction="up" delay={500}>
        <Suspense fallback={<div className="h-64" />}>
          <CallToAction />
        </Suspense>
      </ScrollAnimation>
    </div>
  );
}

