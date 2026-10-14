import confetti from 'canvas-confetti';

export function fireHeartConfetti(originX = 0.5, originY = 0.6) {
  const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fef08a', '#fbbf24', '#ffffff', '#a855f7'];

  // Left spray
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 70,
    origin: { x: originX - 0.1, y: originY },
    colors: colors,
    shapes: ['circle', 'square'],
    scalar: 1.1,
    drift: 0,
    ticks: 200,
  });

  // Right spray
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 70,
    origin: { x: originX + 0.1, y: originY },
    colors: colors,
    shapes: ['circle', 'square'],
    scalar: 1.1,
    drift: 0,
    ticks: 200,
  });

  // Center sparkle fountain
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { x: originX, y: originY - 0.05 },
    colors: ['#ffe4e6', '#f43f5e', '#d97706', '#fef3c7', '#38bdf8'],
    gravity: 0.8,
    scalar: 1.2,
    ticks: 250,
  });
}

export function fireBirthdayFireworks() {
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#f43f5e', '#e11d48', '#fda4af', '#f59e0b', '#fbbf24', '#38bdf8', '#c084fc', '#ffffff'];

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    // Launch bursts from bottom left, bottom right, and middle
    confetti({
      startVelocity: 35,
      spread: 360,
      ticks: 120,
      origin: {
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.4 + 0.2,
      },
      colors: colors,
      scalar: 1.2,
      shapes: ['circle', 'square'],
    });
  }, 250);
}

export function fireGrandHugCelebration() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#f43f5e', '#e11d48', '#fda4af', '#f59e0b', '#fbbf24', '#ffffff', '#ec4899'];

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);

    // Random showers from both edges
    confetti({
      particleCount,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      scalar: 1.2,
    });

    confetti({
      particleCount,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      scalar: 1.2,
    });
  }, 200);
}
