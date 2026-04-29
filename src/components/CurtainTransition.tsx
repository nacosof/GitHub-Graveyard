"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { CandleIcon, TombstoneIcon } from "@/features/graveyard/components/Icons";

type CurtainApi = {
  playTo: (href: string) => void;
  isPlaying: boolean;
};

const CurtainContext = createContext<CurtainApi | null>(null);

export function useCurtainTransition() {
  const ctx = useContext(CurtainContext);
  if (!ctx) throw new Error("useCurtainTransition must be used within CurtainTransitionProvider");
  return ctx;
}

function GhostHand({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <svg
      viewBox="0 0 160 100"
      aria-hidden="true"
      className={
        "size-[160px] text-white/90 drop-shadow-[0_0_55px_rgba(255,255,255,0.18)] " +
        (flip ? "-scale-x-100" : "")
      }
      fill="none"
    >
      <path
        d="M14 60c18-18 42-28 66-28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M14 66c18-14 40-22 64-22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />

      <path
        d="M72 40c12 0 22 4 30 10 6 4 14 6 22 6"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      <path
        d="M78 58l12 12"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M90 70l14 10"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
        opacity="0.85"
      />

      <path d="M92 34l18-10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M110 24l18-6"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M128 18l18-2"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <path d="M98 40l22-8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M120 32l20-4"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M140 28l16 0"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <path d="M100 48l24-2" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M124 46l20 2"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M144 48l12 6"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <path d="M96 56l22 8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M118 64l18 10"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M136 74l12 10"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <path
        d="M56 78c10 2 18 2 26-2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}

export function CurtainTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "closing" | "opening" | "fadeout">("idle");
  const targetRef = useRef<string | null>(null);
  const targetPathnameRef = useRef<string | null>(null);
  const lockRef = useRef(false);
  const phaseRef = useRef(phase);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const playTo = useCallback(
    (href: string) => {
      if (lockRef.current) return;
      lockRef.current = true;
      targetRef.current = href;
      targetPathnameRef.current = (() => {
        try {
          return new URL(href, window.location.href).pathname;
        } catch {
          return null;
        }
      })();
      clearTimers();
      setPhase("closing");

      window.setTimeout(() => {
        const to = targetRef.current;
        if (!to) return;
        router.push(to);
      }, 520);

      timersRef.current.push(
        window.setTimeout(() => {
          if (phaseRef.current !== "closing") return;
          setPhase("opening");
        }, 2000),
      );
    },
    [router, clearTimers],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (lockRef.current) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as Element | null;
      const a = target?.closest?.("a");
      if (!a) return;

      if (a.getAttribute("data-no-curtain") === "1") return;
      if (a.hasAttribute("download")) return;

      const hrefAttr = a.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#")) return;

      const targetAttr = a.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const current = new URL(window.location.href);
      if (
        url.pathname === current.pathname &&
        url.search === current.search &&
        url.hash !== "" &&
        url.hash !== current.hash
      ) {
        return;
      }

      e.preventDefault();
      playTo(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [playTo]);

  useEffect(() => {
    if (phase !== "closing") return;
    const targetPath = targetPathnameRef.current;
    if (!targetPath) return;
    if (pathname !== targetPath) return;

    // Page is mounted -> open curtains.
    setPhase("opening");
    clearTimers();
    timersRef.current.push(
      window.setTimeout(() => setPhase("fadeout"), 600),
      window.setTimeout(() => {
        setPhase("idle");
        lockRef.current = false;
        targetRef.current = null;
        targetPathnameRef.current = null;
        clearTimers();
      }, 820),
    );
  }, [pathname, phase, clearTimers]);

  const api = useMemo<CurtainApi>(() => ({ playTo, isPlaying: phase !== "idle" }), [playTo, phase]);

  return (
    <CurtainContext.Provider value={api}>
      {children}
      <CurtainOverlay phase={phase} />
    </CurtainContext.Provider>
  );
}

function CurtainOverlay({ phase }: { phase: "idle" | "closing" | "opening" | "fadeout" }) {
  const [closed, setClosed] = useState(false);
  const [fadeAll, setFadeAll] = useState(false);

  useEffect(() => {
    if (phase === "idle") return;
    if (phase === "closing") {
      setFadeAll(false);
      setClosed(false);
      const id = window.requestAnimationFrame(() => setClosed(true));
      return () => window.cancelAnimationFrame(id);
    }
    if (phase === "opening") {
      setFadeAll(false);
      setClosed(true);
      const id = window.requestAnimationFrame(() => setClosed(false));
      return () => window.cancelAnimationFrame(id);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "fadeout") return;
    setFadeAll(true);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      className={
        "pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 ease-out " +
        (fadeAll ? "opacity-0" : "opacity-100")
      }
    >
      <div
        className={
          "absolute inset-0 bg-black/40 transition-opacity duration-[520ms] ease-[cubic-bezier(.2,.9,.2,1)] " +
          (closed ? "opacity-100" : "opacity-0")
        }
      />
      <div className="absolute inset-0">
        <div
          className={
            "absolute inset-y-0 left-0 w-1/2 bg-black/95 " +
            "transition-transform duration-[520ms] ease-[cubic-bezier(.2,.9,.2,1)] " +
            (closed ? "translate-x-0" : "-translate-x-full")
          }
        >
          <div className="absolute left-0 right-0 top-[22%] px-6">
            <div className="flex items-center justify-end gap-3 pr-0">
              <TombstoneIcon className="size-7 text-white/85" width={24} height={24} />
              <div className="gg-retro -mr-6 text-3xl font-semibold tracking-wider text-white/90">
                Grave
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            "absolute inset-y-0 right-0 w-1/2 bg-black/95 " +
            "transition-transform duration-[520ms] ease-[cubic-bezier(.2,.9,.2,1)] " +
            (closed ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="absolute left-0 right-0 top-[22%] px-6">
            <div className="flex items-center justify-start gap-3 pl-0">
              <div className="gg-retro -ml-6 text-3xl font-semibold tracking-wider text-white/90">
                yard
              </div>
              <CandleIcon className="size-7 text-white/85" width={24} height={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <div
          className={
            "transition-[transform,opacity] duration-[520ms] ease-[cubic-bezier(.2,.9,.2,1)] " +
            "opacity-100"
          }
          style={{
            transform: closed
              ? "translate3d(calc(50vw - 158px), 0, 0)"
              : "translate3d(-240px, 0, 0)",
            transformOrigin: "100% 50%",
          }}
        >
          <div className="rotate-0">
            <GhostHand side="left" />
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <div
          className={
            "transition-[transform,opacity] duration-[520ms] ease-[cubic-bezier(.2,.9,.2,1)] " +
            "opacity-100"
          }
          style={{
            transform: closed
              ? "translate3d(calc(-50vw + 158px), 0, 0)"
              : "translate3d(240px, 0, 0)",
            transformOrigin: "0% 50%",
          }}
        >
          <div className="rotate-0">
            <GhostHand side="right" />
          </div>
        </div>
      </div>

      <div
        className={
          "absolute inset-0 bg-black/40 [mask-image:radial-gradient(60%_60%_at_50%_50%,transparent,black)] " +
          "transition-opacity duration-[520ms] ease-[cubic-bezier(.2,.9,.2,1)] " +
          (closed ? "opacity-100" : "opacity-0")
        }
      />
    </div>
  );
}
