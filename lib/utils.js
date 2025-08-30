import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MASTER_COORDS } from "./openstreetmap/simplified/coords";
import chroma from "chroma-js"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BG_WHITE_NOISE =
  "bg-[#ffffffb8] dark:bg-[#000000b8] backdrop-filter backdrop-blur-[20px] backdrop-saturate-[180%]";

export function countComplianceByRegion(featureList) {
  const regionCounts = {};

  // Initialize counts for all known regions (from MASTER_COORDS)
  Object.keys(MASTER_COORDS).forEach((region) => {
    regionCounts[region] = 0;
  });

  featureList.forEach((feature) => {
    let compliance = feature.isCompliant;

    try {
      if (compliance === "true") {
        // Fully compliant in all regions
        Object.keys(regionCounts).forEach((r) => (regionCounts[r] += 1));
        return; // done with this feature
      } else if (compliance === "false") {
        // Fully non-compliant, do nothing
        return;
      } else {
        // Parse JSON per-region compliance
        compliance = JSON.parse(compliance);
      }
    } catch (e) {
      // Invalid JSON → treat as non-compliant
      return;
    }

    // Count per region
    Object.entries(compliance).forEach(([region, value]) => {
      const isCompliant = value === true || value === "true";
      if (region in regionCounts && isCompliant) {
        regionCounts[region] += 1;
      }
    });
  });

  return regionCounts;
}



export function interpolateColor(color1, color2, factor) {
  // Use perceptually uniform Lab interpolation
  return chroma.scale([color1, color2])
               .mode("lab") // ensures midpoint looks natural
               (factor)
               .hex();
}