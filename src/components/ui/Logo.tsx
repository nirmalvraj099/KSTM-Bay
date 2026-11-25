import { useId } from "react";

/** KSTM Bay "Render Stack" mark: three stacked tiles, front tile carries the K. */
export function LogoMark({ size = 40 }: { size?: number }) {
  const gid = useId();
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 120 120" aria-label="KSTM Bay" role="img">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF3B2F" />
          <stop offset="1" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      <rect className="f3" x="34" y="6" width="80" height="80" rx="18" fill="none" stroke="#F4F2EE" strokeOpacity=".28" strokeWidth="5" />
      <rect className="f2" x="20" y="20" width="80" height="80" rx="18" fill="#1d1d26" stroke="#F4F2EE" strokeOpacity=".6" strokeWidth="5" />
      <g className="f1">
        <rect x="6" y="34" width="80" height="80" rx="18" fill={`url(#${gid})`} />
        <g transform="translate(6 34) scale(0.8) skewX(-12) translate(12 0)" fill="#0A0A0E">
          <rect x="22" y="22" width="15" height="56" rx="2" />
          <polygon points="40,50 62,22 80,22 57,50" />
          <polygon points="40,50 57,50 80,78 62,78" />
        </g>
      </g>
    </svg>
  );
}

/** Mark plus "KSTM BAY" wordmark. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="brand inline-flex items-center gap-3">
      <LogoMark size={size} />
      <span className="disp text-xl text-white">
        KSTM <span className="font-light">BAY</span>
      </span>
    </span>
  );
}
