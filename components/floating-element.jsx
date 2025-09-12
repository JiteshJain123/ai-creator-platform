"use client";

import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { floatingElements } from "@/lib/data";

const FloatingAnimations = () => {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const FloatingElement = ({ children, className = "", delay = 0 }) => {
    if (!mounted) {
      return <div className={className}>{children}</div>;
    }

    return (
      <div
        className={className}
        style={{
          animationDelay: `${delay}s`,
          transform: `translateY(${
            Math.sin(Date.now() * 0.001 + delay) * 10
          }px)`,
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 flex items-center justify-center">
      {floatingElements.map((element, index) => (
        <FloatingElement
          key={index}
          className={`absolute ${element.position} ${
            mounted ? "animate-pulse" : ""
          }`}
          delay={element.delay}
        >
          <div
            className={`${element.size} bg-gradient-to-br ${element.color} ${element.rotation} shadow-2xl shadow-purple-500/50 flex items-center justify-center rounded-2xl`}
          >
            <element.icon
              className={`${element.size
                .replace("w-", "w-")
                .replace("h-", "h-")
                .replace(/\d+/g, (match) =>
                  Math.floor(parseInt(match) * 0.6)
                )} text-white`}
            />
          </div>
        </FloatingElement>
      ))}

      {/* Central floating cube */}
      <FloatingElement
        className={`z-10 ${mounted ? "animate-pulse" : ""}`}
        delay={0.5}
      >
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-3xl shadow-2xl shadow-purple-500/50 flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500"
          style={
            mounted
              ? {
                  transform: `rotate(${12 + scrollY * 0.1}deg) scale(${
                    1 + Math.sin(Date.now() * 0.001) * 0.05
                  })`,
                }
              : { transform: "rotate(12deg) scale(1)" }
          }
        >
          <Zap className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
        </div>
      </FloatingElement>
    </div>
  );
};

export default FloatingAnimations;
