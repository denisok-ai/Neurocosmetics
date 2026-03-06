"use client";

import { useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Image3DProps extends Omit<ImageProps, "ref"> {
  /** Интенсивность наклона (градусы) */
  tiltIntensity?: number;
  /** Включить эффект масштаба при наведении */
  scaleOnHover?: boolean;
  /** Дополнительные классы для обёртки */
  wrapperClassName?: string;
}

export function Image3D({
  tiltIntensity = 12,
  scaleOnHover = true,
  wrapperClassName = "",
  className = "",
  ...imageProps
}: Image3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), springConfig);
  const scaleTransform = useTransform(y, [-0.5, 0, 0.5], [1.02, 1, 0.98]);
  const scaleStatic = useMotionValue(1);
  const scale = useSpring(scaleOnHover ? scaleTransform : scaleStatic, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const xVal = (e.clientX - centerX) / rect.width;
    const yVal = (e.clientY - centerY) / rect.height;
    x.set(xVal);
    y.set(yVal);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-[1200px] ${wrapperClassName}`}
      style={{ perspectiveOrigin: "center center" }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
      >
        <Image
          {...imageProps}
          className={className}
          style={{ transform: "translateZ(0)" }}
        />
      </motion.div>
    </motion.div>
  );
}
