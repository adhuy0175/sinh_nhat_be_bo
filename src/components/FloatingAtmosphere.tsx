import React, { useMemo } from 'react';

export const FloatingAtmosphere: React.FC = () => {
  // Generate stable random particle positions
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: (i * 4.1 + (i % 5) * 11) % 96 + 2,
      y: (i * 7.3 + (i % 3) * 19) % 94 + 3,
      size: 10 + (i % 4) * 6,
      duration: 10 + (i % 6) * 4,
      delay: (i % 5) * 1.5,
      type: i % 5 === 0 ? 'balloon' : i % 5 === 1 ? 'heart' : i % 5 === 2 ? 'star' : i % 5 === 3 ? 'petal' : 'orb',
      balloonColor: ['#F8DCE4', '#C98799', '#fde68a', '#fbcfe8', '#fed7aa'][i % 5],
      opacity: 0.2 + (i % 3) * 0.12,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Gentle gradient background atmosphere */}
      <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#F8DCE4]/25 blur-[120px]" />
      <div className="absolute top-[35%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-100/25 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[#C98799]/15 blur-[130px]" />

      {/* Floating ambient particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-gentle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
          }}
        >
          {p.type === 'balloon' && (
            <div className="flex flex-col items-center">
              <div
                className="w-5 h-6 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] shadow-sm relative"
                style={{ backgroundColor: p.balloonColor }}
              >
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full" />
              </div>
              <div className="w-0.5 h-3 bg-stone-300/60" />
            </div>
          )}

          {p.type === 'heart' && (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-rose-400 drop-shadow-sm"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}

          {p.type === 'star' && (
            <svg
              width={p.size * 0.8}
              height={p.size * 0.8}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-amber-300 animate-sparkle"
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          )}

          {p.type === 'petal' && (
            <div
              className="w-3.5 h-2.5 rounded-full bg-gradient-to-r from-rose-300 to-pink-200 rotate-45 transform"
            />
          )}

          {p.type === 'orb' && (
            <div
              className="rounded-full bg-amber-200/50 blur-[1px]"
              style={{ width: p.size * 0.6, height: p.size * 0.6 }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
