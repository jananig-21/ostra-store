import { memo, useId, type ReactNode } from "react";
import type { Shape } from "../data/products";
import { darken, lighten } from "../lib/color";

interface Props {
  shape: Shape;
  color: string;
  label: string;
  /** "card" adds a tinted backdrop; "plain" is transparent for compositions */
  variant?: "card" | "plain";
  className?: string;
}

/**
 * Product imagery drawn as SVG: every colourway renders instantly, stays sharp at any size,
 * and adds no image requests. Shading uses gradients built from the product colour.
 */
export const ProductArt = memo(function ProductArt({ shape, color, label, variant = "card", className }: Props) {
  const id = useId().replace(/:/g, "");
  const body = `url(#${id}-body)`;
  const g = { body, id, color };

  return (
    <svg className={className} viewBox="0 0 400 500" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={darken(color, 0.28)} />
          <stop offset="0.32" stopColor={lighten(color, 0.18)} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={darken(color, 0.32)} />
        </linearGradient>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor={lighten(color, 0.82)} />
          <stop offset="1" stopColor={lighten(color, 0.6)} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <pattern id={`${id}-dots`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" fill={lighten(color, 0.35)} opacity="0.55" />
          <circle cx="8" cy="8" r="1.3" fill={darken(color, 0.2)} opacity="0.45" />
        </pattern>
      </defs>
      {variant === "card" && <rect width="400" height="500" fill={`url(#${id}-bg)`} />}
      <ellipse cx="200" cy="414" rx="118" ry="13" fill={darken(color, 0.55)} opacity="0.28" filter={`url(#${id}-blur)`} />
      {SHAPES[shape](g)}
    </svg>
  );
});

type Draw = (g: { body: string; id: string; color: string }) => ReactNode;

const highlight = (d: string) => <path d={d} fill="#fff" opacity="0.22" />;

const SHAPES: Record<Shape, Draw> = {
  vase: ({ body, color }) => (
    <g>
      <path d="M152 410C138 378 118 330 124 272C130 222 166 202 172 172C176 152 168 136 170 120H230C232 136 224 152 228 172C234 202 270 222 276 272C282 330 262 378 248 410Z" fill={body} />
      <ellipse cx="200" cy="120" rx="30" ry="6" fill={darken(color, 0.45)} />
      {highlight("M150 280C152 240 170 222 178 206C172 236 160 262 162 330C158 312 150 300 150 280Z")}
    </g>
  ),
  bud: ({ body, color }) => (
    <g>
      <path d="M166 410C138 396 132 352 148 326C160 306 186 300 188 284V266H212V284C214 300 240 306 252 326C268 352 262 396 234 410Z" fill={body} />
      <ellipse cx="200" cy="266" rx="12" ry="3.5" fill={darken(color, 0.45)} />
      <path d="M200 266C198 220 186 190 168 168M200 266C204 214 222 186 244 176" stroke="#5f6f52" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="166" cy="164" rx="14" ry="7" fill="#9caf88" transform="rotate(-30 166 164)" />
      <circle cx="246" cy="172" r="10" fill="#e3b5a4" />
      {highlight("M158 340C160 318 172 310 182 304C174 322 170 344 172 372C164 362 158 352 158 340Z")}
    </g>
  ),
  bowl: ({ body, color }) => (
    <g>
      <path d="M88 330H312C306 382 262 410 200 410C138 410 94 382 88 330Z" fill={body} />
      <ellipse cx="200" cy="330" rx="112" ry="16" fill={darken(color, 0.18)} />
      <ellipse cx="200" cy="333" rx="100" ry="11" fill={darken(color, 0.32)} />
      <circle cx="176" cy="324" r="16" fill="#d4a24c" />
      <circle cx="206" cy="320" r="18" fill="#c0714f" />
      <circle cx="232" cy="326" r="14" fill="#9caf88" />
      {highlight("M112 344C130 376 152 390 176 396C148 394 118 378 112 344Z")}
    </g>
  ),
  mug: ({ body, color }) => (
    <g>
      <path d="M258 284C308 284 308 372 256 372" stroke={darken(color, 0.15)} strokeWidth="17" fill="none" strokeLinecap="round" />
      <path d="M140 250H260L256 396C255 405 248 410 238 410H162C152 410 145 405 144 396Z" fill={body} />
      <ellipse cx="200" cy="250" rx="60" ry="9" fill={darken(color, 0.4)} />
      <ellipse cx="200" cy="252" rx="52" ry="6" fill="#4a3426" />
      <path d="M186 232C180 214 196 206 190 188M208 232C202 216 218 208 212 192" stroke={lighten(color, 0.5)} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      {highlight("M156 266H170L168 392H160Z")}
    </g>
  ),
  carafe: ({ body, color }) => (
    <g opacity="0.95">
      <path d="M176 410C150 410 140 396 140 370C140 320 180 302 186 252L188 172H212L214 252C220 302 260 320 260 370C260 396 250 410 224 410Z" fill={body} opacity="0.85" />
      <path d="M150 352C150 330 170 318 182 306L218 306C230 318 250 330 250 352C250 382 246 400 224 404H176C154 400 150 382 150 352Z" fill={lighten(color, 0.55)} opacity="0.45" />
      <rect x="182" y="132" width="36" height="34" rx="6" fill={body} opacity="0.9" />
      <ellipse cx="200" cy="132" rx="18" ry="4" fill={darken(color, 0.3)} />
      {highlight("M160 372C158 346 172 330 184 318C178 340 172 360 174 396C166 390 160 384 160 372Z")}
    </g>
  ),
  tumbler: ({ body, color }) => (
    <g>
      <g transform="translate(-58 18) scale(0.92)" opacity="0.7">
        <path d="M150 262H250L242 404C241 410 238 412 232 412H168C162 412 159 410 158 404Z" fill={body} />
      </g>
      <path d="M156 252H262L253 404C252 410 248 412 242 412H176C170 412 166 410 165 404Z" fill={body} opacity="0.9" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${170 + i * 16} 258L${176 + i * 13.5} 404`} stroke={lighten(color, 0.45)} strokeWidth="3" opacity="0.5" />
      ))}
      <ellipse cx="209" cy="252" rx="53" ry="7" fill={lighten(color, 0.3)} opacity="0.8" />
    </g>
  ),
  lamp: ({ body, color, id }) => (
    <g>
      <circle cx="200" cy="250" r="150" fill={`url(#${id}-glow)`} />
      <path d="M170 410C160 382 160 352 174 332C184 318 190 312 192 300H208C210 312 216 318 226 332C240 352 240 382 230 410Z" fill={body} />
      <path d="M138 302H262L236 188H164Z" fill="#f4ecdc" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${164 + i * 10.3} 190L${140 + i * 17.3} 300`} stroke="#d9cdb6" strokeWidth="1.5" />
      ))}
      <path d="M138 302H262" stroke={darken(color, 0.2)} strokeWidth="3" />
      {highlight("M178 400C172 380 172 356 182 340C180 364 182 384 186 404Z")}
    </g>
  ),
  pendant: ({ body, color, id }) => (
    <g>
      <line x1="200" y1="0" x2="200" y2="190" stroke={darken(color, 0.4)} strokeWidth="3" />
      <ellipse cx="200" cy="350" rx="150" ry="70" fill={`url(#${id}-glow)`} />
      <rect x="188" y="182" width="24" height="16" rx="4" fill={darken(color, 0.3)} />
      <path d="M106 306C106 236 148 196 200 196C252 196 294 236 294 306Z" fill={body} />
      <ellipse cx="200" cy="306" rx="94" ry="10" fill="#fff9e8" />
      {highlight("M126 296C128 256 150 226 178 214C158 236 144 262 142 296Z")}
    </g>
  ),
  throw: ({ body, color }) => (
    <g>
      <rect x="96" y="334" width="208" height="76" rx="18" fill={body} />
      <rect x="108" y="282" width="184" height="62" rx="16" fill={body} />
      <rect x="120" y="236" width="160" height="56" rx="14" fill={body} />
      {[248, 300, 352].map((y, i) => (
        <path key={y} d={`M${132 - i * 12} ${y + 12}H${268 + i * 12}`} stroke={darken(color, 0.25)} strokeWidth="4" strokeDasharray="10 6" opacity="0.55" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={304} y1={344 + i * 7} x2={318} y2={346 + i * 7} stroke={darken(color, 0.2)} strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </g>
  ),
  pillow: ({ body, color, id }) => (
    <g>
      <path d="M108 262Q200 236 292 262Q308 336 292 410Q200 386 108 410Q92 336 108 262Z" fill={body} />
      <path d="M108 262Q200 236 292 262Q308 336 292 410Q200 386 108 410Q92 336 108 262Z" fill={`url(#${id}-dots)`} />
      <path d="M150 300Q200 290 250 300" stroke={darken(color, 0.25)} strokeWidth="3" fill="none" opacity="0.35" />
    </g>
  ),
  candle: ({ body, color, id }) => (
    <g>
      <circle cx="200" cy="250" r="90" fill={`url(#${id}-glow)`} />
      <path d="M145 300H255V398C255 405 250 410 243 410H157C150 410 145 405 145 398Z" fill={body} />
      <ellipse cx="200" cy="300" rx="55" ry="9" fill={darken(color, 0.35)} />
      <ellipse cx="200" cy="302" rx="48" ry="6" fill="#f3ead6" />
      <line x1="200" y1="300" x2="200" y2="284" stroke="#2d2a26" strokeWidth="2.5" />
      <path d="M200 238C214 256 214 272 200 284C186 272 186 256 200 238Z" fill="#f2b84b" />
      <path d="M200 258C206 266 206 274 200 280C194 274 194 266 200 258Z" fill="#fff4cf" />
      <rect x="170" y="340" width="60" height="30" rx="3" fill={lighten(color, 0.7)} opacity="0.9" />
      {highlight("M156 312H168V400H160C157 400 156 398 156 396Z")}
    </g>
  ),
  diffuser: ({ body, color }) => (
    <g>
      {[-38, -20, -6, 8, 22, 40].map((dx, i) => (
        <line key={i} x1={196 + i * 1.6} y1="262" x2={200 + dx} y2={110 + Math.abs(dx)} stroke="#b08a5a" strokeWidth="3" strokeLinecap="round" />
      ))}
      <path d="M160 410V302Q160 282 180 276L190 272V252H210V272L220 276Q240 282 240 302V410Z" fill={body} opacity="0.92" />
      <rect x="170" y="330" width="60" height="40" rx="3" fill={lighten(color, 0.75)} />
      <rect x="186" y="246" width="28" height="12" rx="3" fill={darken(color, 0.4)} />
      {highlight("M168 300Q170 288 180 284V404H170Z")}
    </g>
  ),
};
