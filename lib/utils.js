import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BG_WHITE_NOISE =
  "bg-[#ffffffb8] dark:bg-[#000000b8] backdrop-filter backdrop-blur-[20px] backdrop-saturate-[180%]";
