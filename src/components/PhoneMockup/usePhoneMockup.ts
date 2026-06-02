import type { Transition, TargetAndTransition } from "motion/react";

export function usePhoneMockup() {
  const entrance: TargetAndTransition = { opacity: 1, y: 0 };

  const loop: TargetAndTransition = {
    opacity: 1,
    rotate: [0, 0, -90, -90, 0, 0],
    y: [0, -10, -10, -10, -10, 0],
  };

  const loopTransition: Transition = {
    opacity: { duration: 0.6, ease: "easeOut" },
    rotate: {
      duration: 11,
      times: [0, 0.32, 0.46, 0.74, 0.88, 1],
      repeat: Infinity,
      ease: "easeInOut",
    },
    y: {
      duration: 11,
      times: [0, 0.32, 0.46, 0.74, 0.88, 1],
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const entranceTransition: Transition = {
    duration: 0.7,
    ease: [0.16, 1, 0.3, 1],
  };

  return { entrance, loop, loopTransition, entranceTransition };
}
