import { useId } from "react";
import { type Body, type RenderStyle, parsePreset } from "./renders";

/** Shows a bid render: an uploaded image, or one of the built-in sample renders drawn as SVG. */
export function RenderImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const preset = parsePreset(src);
  if (!preset) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`object-cover ${className}`} />;
  }
  return <SampleRender style={preset.style} body={preset.body} alt={alt} className={className} />;
}

const BODY: Record<Body, { shell: string; glass: string[]; wheels: [number, number]; r: number }> = {
  hatch: {
    shell: "M34,150 L38,124 Q42,111 70,107 L132,101 Q162,68 204,64 L292,64 Q318,66 336,98 L360,106 Q378,112 378,130 L378,150 Q378,158 370,158 L340,158 A38,38 0 0 0 264,158 L144,158 A38,38 0 0 0 68,158 L42,158 Q34,158 34,150 Z",
    glass: ["M143,101 Q168,74 204,72 L222,72 L222,101 Z", "M230,72 L290,72 Q310,74 324,98 L230,101 Z"],
    wheels: [106, 302],
    r: 30,
  },
  sedan: {
    shell: "M30,150 L35,126 Q40,113 70,109 L132,104 Q162,72 202,68 L254,68 Q286,70 316,100 L360,108 Q378,112 380,130 L380,150 Q380,158 372,158 L338,158 A38,38 0 0 0 262,158 L143,158 A38,38 0 0 0 67,158 L38,158 Q30,158 30,150 Z",
    glass: ["M143,104 Q168,78 202,76 L216,76 L216,104 Z", "M224,76 L252,76 Q276,78 300,102 L224,104 Z"],
    wheels: [105, 300],
    r: 30,
  },
  suv: {
    shell: "M30,152 L32,112 Q34,98 52,96 L112,93 L136,58 Q141,51 152,51 L298,51 Q311,51 318,62 L340,93 L366,97 Q380,100 380,116 L380,152 Q380,160 372,160 L344,160 A42,42 0 0 0 260,160 L148,160 A42,42 0 0 0 64,160 L38,160 Q30,160 30,152 Z",
    glass: ["M144,91 L160,61 L226,61 L226,91 Z", "M234,61 L297,61 Q306,61 310,69 L322,91 L234,91 Z"],
    wheels: [106, 302],
    r: 34,
  },
};

function SampleRender({ style, body, alt, className }: { style: RenderStyle; body: Body; alt: string; className: string }) {
  const id = useId().replace(/:/g, "");
  const b = BODY[body];
  const lift = style.offroad ? -10 : style.lowered ? 5 : 0;
  const r = b.r + (style.offroad ? 4 : style.lowered ? 1 : 0);
  const groundY = 188;
  const wheelY = groundY - r;
  return (
    <svg viewBox="0 0 410 230" role="img" aria-label={alt} className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`bg${id}`} cx="50%" cy="30%" r="80%">
          <stop offset="0" stopColor="#23232d" />
          <stop offset="1" stopColor="#0a0a0e" />
        </radialGradient>
        <linearGradient id={`paint${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={style.paint} />
          <stop offset="1" stopColor={style.paint2} />
        </linearGradient>
        <linearGradient id={`glass${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a4252" />
          <stop offset="1" stopColor="#0d1016" />
        </linearGradient>
        <radialGradient id={`beam${id}`} cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor={style.accent} stopOpacity=".55" />
          <stop offset="1" stopColor={style.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="410" height="230" fill={`url(#bg${id})`} />
      {/* studio floor */}
      <ellipse cx="205" cy={groundY + 2} rx="190" ry="14" fill="#000" opacity=".55" />
      <line x1="0" y1={groundY + 2} x2="410" y2={groundY + 2} stroke="#2a2a35" />
      {/* headlight beam */}
      <path d={`M378,${126 + lift} L410,${104 + lift} L410,${150 + lift} Z`} fill={`url(#beam${id})`} />
      <g transform={`translate(0 ${lift + (body === "suv" ? 0 : 2)})`}>
        <path d={b.shell} fill={`url(#paint${id})`} stroke="#000" strokeOpacity=".35" />
        {b.glass.map((g, i) => <path key={i} d={g} fill={`url(#glass${id})`} opacity=".95" />)}
        {/* shoulder highlight */}
        <path d={b.shell} fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1.5" transform="translate(0 -2)" />
        {/* lights */}
        <rect x="364" y={body === "suv" ? 102 : 114} width="14" height="6" rx="3" fill={style.accent} />
        <rect x="32" y={body === "suv" ? 104 : 118} width="8" height="10" rx="2" fill="#ff3b2f" />
        {style.offroad && (
          <>
            <rect x="150" y="44" width="150" height="5" rx="2" fill="#111" />
            {[170, 200, 230, 260].map((x) => <circle key={x} cx={x} cy="42" r="4" fill={style.accent} />)}
            <rect x="366" y="128" width="16" height="22" rx="3" fill="#1a1a1f" />
          </>
        )}
      </g>
      {b.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={wheelY} r={r} fill="#08080b" />
          {style.offroad && <circle cx={x} cy={wheelY} r={r - 2} fill="none" stroke="#1d1d22" strokeWidth="4" strokeDasharray="4 3" />}
          <circle cx={x} cy={wheelY} r={r * 0.62} fill={style.rims} stroke="#3a3a44" strokeWidth="1.5" />
          {[0, 72, 144, 216, 288].map((a) => (
            <line
              key={a}
              x1={x}
              y1={wheelY}
              x2={x + Math.cos((a * Math.PI) / 180) * r * 0.58}
              y2={wheelY + Math.sin((a * Math.PI) / 180) * r * 0.58}
              stroke="#4a4a55"
              strokeWidth="3"
            />
          ))}
          <circle cx={x} cy={wheelY} r="4" fill="#666" />
        </g>
      ))}
      <text x="14" y="220" fill="#f4f2ee" fillOpacity=".5" fontSize="10" fontFamily="var(--font-jetbrains), monospace" letterSpacing="2">
        SAMPLE RENDER · {style.label.toUpperCase()}
      </text>
    </svg>
  );
}
