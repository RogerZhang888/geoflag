import fs from "fs";
import * as turf from "@turf/turf";

// EU country list (or global list if needed)
const countries = [
  "Austria","Belgium","Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia",
  "Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia",
  "Lithuania","Luxembourg","Malta","Netherlands","Poland","Portugal","Romania",
  "Slovakia","Slovenia","Spain","Sweden"
];

/**
 * Simplify a polygon or multipolygon geometry
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {number} minPoints - Approximate minimum number of points per polygon
 * @returns {number[][][]} - array of polygons, each polygon is [lat, lon][]
 */
function simplifyAllPolygons(geojson, minPoints = 50) {
  const simplifiedPolygons = [];

  geojson.features.forEach((feature) => {
    if (!feature.geometry) return;

    const simplifyPolygon = (coords) => {
      let tolerance = 0.01;
      let simplified = coords;

      while (tolerance > 1e-6) {
        const polyFeature = turf.polygon([coords]);
        const simplifiedGeo = turf.simplify(polyFeature, {
          tolerance,
          highQuality: false
        });
        simplified = simplifiedGeo.geometry.coordinates[0];
        if (simplified.length >= minPoints) break;
        tolerance /= 2;
      }

      return simplified.map(([lon, lat]) => [lat, lon]);
    };

    if (feature.geometry.type === "Polygon") {
      simplifiedPolygons.push(simplifyPolygon(feature.geometry.coordinates[0]));
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((poly) => {
        simplifiedPolygons.push(simplifyPolygon(poly[0]));
      });
    }
  });

  return simplifiedPolygons;
}

// ===== Main pipeline =====
async function main() {
  const results = {};

  for (const country of countries) {
    const filePath = `geojson/${country}.geojson`;
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping ${country}: file not found`);
      continue;
    }

    console.log(`Processing ${country}...`);
    const geojson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const simplifiedCoords = simplifyAllPolygons(geojson, 50);

    results[country.toLowerCase()] = simplifiedCoords;
  }

  // Ensure output folder exists
  if (!fs.existsSync("simplified")) {
    fs.mkdirSync("simplified");
  }

  fs.writeFileSync(
    "simplified/eu-simplified.json",
    JSON.stringify(results, null, 2)
  );

  console.log("✅ All countries processed into simplified/eu-simplified.json");
}

main();
