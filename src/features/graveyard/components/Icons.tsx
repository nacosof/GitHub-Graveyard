import type { CSSProperties } from "react";

export function CandleIcon({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32 8c4 5 4 10 0 15-4-5-4-10 0-15Z" className="fill-current" opacity="0.9" />
      <path
        d="M26 26h12c2.2 0 4 1.8 4 4v20c0 3.3-2.7 6-6 6H28c-3.3 0-6-2.7-6-6V30c0-2.2 1.8-4 4-4Z"
        className="fill-current"
        opacity="0.8"
      />
      <path
        d="M32 23v6"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M26 40h12"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TombstoneIcon({
  className,
  style,
  width,
  height,
}: {
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 26c0-8.837 5.82-16 13-16s13 7.163 13 16v22H20V26Z"
        className="fill-current"
        opacity="0.9"
      />
      <path d="M16 48h32v6H16v-6Z" className="fill-current" opacity="0.65" />
      <path
        d="M27 29h10"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M27 36h10"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FinishedIcon({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 14v36"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M22 16h20l-6 6 6 6H22V16Z" className="fill-current" opacity="0.75" />
      <path
        d="M28 44l4 4 8-10"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UnderratedIcon({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32 10l12 12-12 32L20 22 32 10Z" className="fill-current" opacity="0.75" />
      <path
        d="M32 10l12 12-12 8-12-8 12-12Z"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M48 34l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" className="fill-current" opacity="0.55" />
    </svg>
  );
}
