"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export default function ParallaxPair({ children }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : ["-10%", "10%"]);
  const wordmarkY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : ["-12%", "12%"]);
  const wordmarkX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : ["-2%", "2%"]);
  const wordmarkScale = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [1, 1, 1] : [0.96, 1.02, 0.96]);
  const wordmarkOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], reduceMotion ? [0.08, 0.08, 0.08, 0.08] : [0, 0.08, 0.08, 0]);

  return (
    <div ref={ref} className="parallax-pair">
      <motion.div className="parallax-pair__bg" style={{ y: bgY }} aria-hidden="true" />
      <div className="parallax-pair__wordmark-anchor" aria-hidden="true">
        <motion.span
          className="parallax-pair__wordmark"
          style={{ y: wordmarkY, x: wordmarkX, scale: wordmarkScale, opacity: wordmarkOpacity }}
        >
          রসপল্লী
        </motion.span>
      </div>
      <div className="parallax-pair__grain" aria-hidden="true" />
      <div className="parallax-pair__content">{children}</div>
    </div>
  );
}
