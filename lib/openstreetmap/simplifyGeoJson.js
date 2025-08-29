import fs from "fs";
import * as turf from "@turf/turf";

/**
 * Simplify a polygon or multipolygon geometry to reduce the number of points
 * Keeps separate polygons intact and simplifies each individually.
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {number} minPoints - Approximate minimum number of points per polygon
 * @returns {number[][][]} double[][][] — array of polygons, each polygon is [lat, lon][]
 */
function simplifyAllPolygons(geojson, minPoints = 50) {
  const simplifiedPolygons = [];

  geojson.features.forEach((feature) => {
    if (!feature.geometry) return;

    // Helper to simplify a single polygon
    const simplifyPolygon = (coords) => {
      let tolerance = 0.01; // initial tolerance
      let simplified = coords;

      while (tolerance > 1e-6) {
        const polyFeature = turf.polygon([coords]);
        const simplifiedGeo = turf.simplify(polyFeature, { tolerance, highQuality: false });
        simplified = simplifiedGeo.geometry.coordinates[0];

        if (simplified.length >= minPoints) break; // enough points
        tolerance /= 2; // reduce tolerance for more detail
      }

      return simplified.map(([lon, lat]) => [lat, lon]);
    };

    if (feature.geometry.type === "Polygon") {
      simplifiedPolygons.push(simplifyPolygon(feature.geometry.coordinates[0]));
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((poly) => {
        simplifiedPolygons.push(simplifyPolygon(poly[0]));
      });
    } else {
      console.warn("Unsupported geometry type:", feature.geometry.type);
    }
  });

  return simplifiedPolygons;
}

// ===== Example Usage =====
const place = "US";

const geojson = JSON.parse(fs.readFileSync(`geojson/${place}.geojson`, "utf8"));

const simplifiedCoords = simplifyAllPolygons(geojson, 50);

console.log("Number of polygons:", simplifiedCoords.length);
console.log("Points in first polygon:", simplifiedCoords[0].length);

fs.writeFileSync(`simplified/${place}-simplified-chunks.json`, JSON.stringify(simplifiedCoords, null, 2));
console.log(`Simplified ${place} coordinates saved as ${place}-simplified-chunks.json`);
