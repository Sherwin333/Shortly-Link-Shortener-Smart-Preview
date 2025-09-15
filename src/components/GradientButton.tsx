"use client";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function GradientButton({ children, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="relative px-5 py-2 rounded-xl font-semibold text-white overflow-hidden group"
    >
      {/* animated gradient bg */}
      <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 
                       bg-[length:200%_200%] animate-gradientMove opacity-90 group-hover:opacity-100" />
      {/* glow effect */}
      <span className="absolute inset-0 blur-md bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-40 group-hover:opacity-60" />
      {/* text layer */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
