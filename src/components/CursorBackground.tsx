"use client";
import React, { useEffect, useState } from "react";

export default function CursorBackground() {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-50 transition-all duration-300"
      style={{
        background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.3), rgba(6,11,23,1))`,
      }}
    />
  );
}
