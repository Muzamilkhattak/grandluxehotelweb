"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  glareColor?: string;
}

export default function Tilt3D({
  children,
  className = "",
  maxTilt = 8,
  perspective = 1000,
  scale = 1.02,
  glare = false,
  glareColor = "rgba(215, 181, 109, 0.16)",
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 25 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["10%", "90%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["10%", "90%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
      }}
      className={`relative ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered ? scale : 1,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full h-full will-change-transform relative"
      >
        {children}

        {glare && isHovered && (
          <motion.div
            style={{
              left: glareX,
              top: glareY,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${glareColor} 0%, transparent 65%)`,
            }}
            className="absolute pointer-events-none w-[160%] h-[160%] rounded-full z-40 transition-opacity duration-300"
          />
        )}
      </motion.div>
    </div>
  );
}
