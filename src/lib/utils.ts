import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidImageSrc(src?: string): boolean {
  if (!src || typeof src !== "string") return false;
  if (src.startsWith("/") || src.startsWith("data:")) return true;

  try {
    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!url.hostname) return false;
    if (url.hostname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|bmp)$/i)) return false;
    return true;
  } catch {
    return false;
  }
}
