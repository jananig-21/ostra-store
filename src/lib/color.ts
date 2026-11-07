function parse(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

/** Linear blend of `hex` toward `target` by `t` (0..1). */
export function mix(hex: string, target: string, t: number): string {
  const a = parse(hex);
  const b = parse(target);
  return toHex(a.map((v, i) => v + (b[i]! - v) * t));
}

export const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t);
export const darken = (hex: string, t: number) => mix(hex, "#000000", t);
