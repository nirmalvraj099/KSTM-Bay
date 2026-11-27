/**
 * A set of frames shot (or rendered) around a vehicle for the 360° spin viewer.
 *
 * Frame order: frame 0 is the front, then the car turns so the front swings to the
 * viewer's right (front-right ¾, right side, rear-right ¾, rear, ...), evenly spaced.
 * Phase 1 (AI multi-angle renders) produces 8 views at 45° steps.
 * Phase 2 (shop turntable photos or video frames) produces 24 to 36 at 10-15° steps.
 */
export type SpinSet = {
  id: string;
  title: string;
  /** Describes the vehicle for screen readers; the angle is appended per frame. */
  alt: string;
  /** "ai" for generated renders, "photo" for real shop photos. */
  source: "ai" | "photo";
  /** Image URLs in turn order. */
  frames: string[];
  /** CSS aspect-ratio of the frames. Default "16 / 10". */
  aspect?: string;
  /** Frame to show first. Default 0 (front). */
  start?: number;
  /** Photos of a finished, approved build. */
  verified?: boolean;
};

/** Human label for a heading in degrees (0 = front, 90 = right side). */
export function angleLabel(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  const names = ["Front", "Front-right ¾", "Right side", "Rear-right ¾", "Rear", "Rear-left ¾", "Left side", "Front-left ¾"];
  return names[Math.round(d / 45) % 8];
}

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Builds frame URLs like `/spin/demo/shop-photo/01.webp` ... `/36.webp`. */
export const frameUrls = (base: string, count: number, ext = "webp") =>
  Array.from({ length: count }, (_, i) => `${base}/${pad(i)}.${ext}`);
