"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useAnimate,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export function LandingMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/** Content is visible in the server HTML, including when JavaScript is unavailable. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, margin: "0px 0px 64px 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const animation = animate(
      scope.current,
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
    );
    return () => animation.stop();
  }, [animate, delay, inView, reduced, scope]);

  return (
    <div ref={scope} className={className} data-reveal="">
      {children}
    </div>
  );
}

/** Observe a stationary wrapper so its animated child cannot change scroll progress. */
export function Parallax({
  children,
  className,
  contentClassName,
  distance = 40,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  distance?: number;
}) {
  const target = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const travel = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [-distance, distance],
  );
  const smoothTravel = useSpring(travel, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.05,
  });
  const transform = useMotionTemplate`translate3d(0, calc(${smoothTravel}px * var(--parallax-strength, 1)), 0)`;

  return (
    <div ref={target} className={className} data-parallax="">
      <m.div
        className={`motion-parallax ${contentClassName ?? ""}`}
        style={reduced ? undefined : { transform }}
      >
        {children}
      </m.div>
    </div>
  );
}
