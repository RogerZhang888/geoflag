import fs from "fs";
import * as turf from "@turf/turf";

/**
 * Simplify a GeoJSON and try to keep at least ~minPoints
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {number} minPoints - Desired minimum number of coords
 * @returns {number[][]} Array of [lat, lon]
 */
function simplifyToPoints(geojson, minPoints = 50) {
  let tolerance = 0.1; // start large
  let coords = [];

  while (tolerance > 1e-6) {
    const simplified = turf.simplify(geojson, { tolerance, highQuality: false });
    const feature = simplified.features[0];

    if (feature.geometry.type === "Polygon") {
      coords = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === "MultiPolygon") {
      coords = feature.geometry.coordinates[0][0];
    } else {
      throw new Error("Unsupported geometry type: " + feature.geometry.type);
    }

    if (coords.length >= minPoints) break; // stop once we keep enough points
    tolerance /= 2; // lower tolerance → more detail
  }

  return coords.map(([lon, lat]) => [lat, lon]);
}

const place = "Florida"

// Example usage
const geojson = JSON.parse(fs.readFileSync(`${place}.geojson`, "utf8"));
const simplifiedCoords = simplifyToPoints(geojson, 50);

console.log("Simplified coordinates:", simplifiedCoords);
console.log("Number of points:", simplifiedCoords.length);

// Write to txt
fs.writeFileSync(`${place}-simplified.txt`, JSON.stringify(simplifiedCoords, null, 2));
