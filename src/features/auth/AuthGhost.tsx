"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  eyesClosed?: boolean;
};

export function AuthGhost({ eyesClosed }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 140));
        const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 140));
        setLook({ x: dx, y: dy });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove as any);
    };
  }, []);

  const px = `${look.x * 6}px`;
  const py = `${look.y * 5}px`;

  return (
    <div className="pointer-events-none select-none">
      <div
        ref={ref}
        className="relative mx-auto h-24 w-24 text-white/90 drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]"
        style={{ transform: `translate3d(${px}, ${py}, 0)` }}
      >
        <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
          <defs>
            <radialGradient id="g" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="65%" stopColor="rgba(255,255,255,0.78)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.60)" />
            </radialGradient>
          </defs>
          <path
            d="M60 16c-20 0-36 16-36 36v42l13-11 11 10 12-10 12 10 11-10 13 11V52c0-20-16-36-36-36z"
            fill="url(#g)"
            opacity="0.9"
          />

          <g transform={`translate(${look.x * 6}, ${look.y * 4})`}>
            {eyesClosed ? (
              <>
                <path
                  d="M44 56c6 3 10 3 16 0"
                  stroke="rgba(0,0,0,0.75)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M60 56c6 3 10 3 16 0"
                  stroke="rgba(0,0,0,0.75)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                <circle cx="50" cy="54" r="4.2" fill="rgba(0,0,0,0.75)" />
                <circle cx="70" cy="54" r="4.2" fill="rgba(0,0,0,0.75)" />
              </>
            )}
            <path
              d="M56 68c3 3 5 3 8 0"
              stroke="rgba(0,0,0,0.65)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
