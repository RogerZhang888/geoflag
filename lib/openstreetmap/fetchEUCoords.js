import fs from "fs";
import * as turf from "@turf/turf";

// List of EU country names exactly matching your saved filenames
const euCountries = [
  "Austria","Belgium","Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia",
  "Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia",
  "Lithuania","Luxembourg","Malta","Netherlands","Poland","Portugal","Romania",
  "Slovakia","Slovenia","Spain","Sweden"
];

async function mergeEU() {
  const allPolygons = [];

  for (const country of euCountries) {
    const filePath = `geojson/${country}.geojson`;
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Skipping ${country} (missing file)`);
      continue;
    }

    console.log(`Adding ${country}...`);
    const geo = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Flatten MultiPolygon → Polygon, keep only polygons
    turf.flattenEach(geo, (feature) => {
      if (feature.geometry && feature.geometry.type === "Polygon") {
        allPolygons.push(feature);
      }
    });
  }

  if (allPolygons.length === 0) {
    console.error("❌ No valid polygons found, check your geojson files.");
    return;
  }

  const collection = turf.featureCollection(allPolygons);

  // Dissolve all polygons into one multipolygon
  const dissolved = turf.dissolve(collection);

  const outPath = "geojson/EU.geojson";
  fs.writeFileSync(outPath, JSON.stringify(dissolved, null, 2));
  console.log(`✅ Merged EU boundary saved as ${outPath}`);
}

mergeEU();
