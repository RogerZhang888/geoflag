import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MASTER_COORDS } from "./openstreetmap/simplified/coords";
import chroma from "chroma-js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BG_WHITE_NOISE =
  "bg-[#ffffffb8] dark:bg-[#000000b8] backdrop-filter backdrop-blur-[20px] backdrop-saturate-[180%]";

export const regionFullNames = {
  us: "United States",
  eu: "European Union",
  utah: "Utah",
  california: "California",
  florida: "Florida"
};

export function countComplianceByRegion(featureList) {
  const regionCounts = {};

  Object.keys(MASTER_COORDS).forEach((region) => {
    regionCounts[region] = {
      compliant: { num: 0, features: [] },
      nonCompliant: { num: 0, features: [] },
      unknown: { num: 0, features: [] }
    };
  });
  
  featureList.forEach((feature) => {
    let c = JSON.parse(feature.isCompliant);

    console.log(c)

    // Count per region
    Object.entries(c).forEach(([reg, comp]) => {
      if (comp === "true") {
        regionCounts[reg].compliant.num += 1;
        regionCounts[reg].compliant.features.push(feature);
      } else if (comp === "false") {
        regionCounts[reg].nonCompliant.num += 1;
        regionCounts[reg].nonCompliant.features.push(feature);
      } else if (comp === "unknown") {
        regionCounts[reg].unknown.num += 1;
        regionCounts[reg].unknown.features.push(feature);
      }
    });
  });

  return regionCounts;
}

export function interpolateColor(color1, color2, factor) {
  // Use perceptually uniform Lab interpolation
  return chroma
    .scale([color1, color2])
    .mode("lab")(
      // ensures midpoint looks natural
      factor
    )
    .hex();
}

export function getFlagEmoji(regionCode) {
  // handle EU manually since it's special
  if (regionCode.toLowerCase() === "eu") return "🇪🇺";

  // only works for 2-letter ISO codes
  if (regionCode.length !== 2) return null;

  return regionCode
    .toUpperCase()
    .split("")
    .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}