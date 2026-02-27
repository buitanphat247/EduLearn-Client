"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollAnimationProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
}

export default function ScrollAnimation({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ✅ Fix memory leak - Remove delay from dependencies, handle it in callback
  useEffect(() => {
    setIsVisible(false);
    
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // ✅ Use delay from closure instead of dependency
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, []); // ✅ Remove delay from dependencies to prevent observer recreation

  const getTransform = () => {
    switch (direction) {
      case "left":
        return isVisible ? "translateX(0)" : "translateX(-50px)";
      case "right":
        return isVisible ? "translateX(0)" : "translateX(50px)";
      case "up":
        return isVisible ? "translateY(0)" : "translateY(50px)";
      case "down":
        return isVisible ? "translateY(0)" : "translateY(-50px)";
      default:
        return isVisible ? "translateY(0)" : "translateY(50px)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </div>
  );
}

