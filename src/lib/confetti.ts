import confetti from "canvas-confetti";

const BRAND_COLORS = ["#ff4f6b", "#b15cff", "#a78bfa"];

export function celebrate() {
  const end = Date.now() + 900;

  function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors: BRAND_COLORS,
      zIndex: 10000,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors: BRAND_COLORS,
      zIndex: 10000,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  }

  frame();
}
