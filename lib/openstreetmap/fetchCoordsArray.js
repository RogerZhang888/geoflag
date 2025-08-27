import fetch from "node-fetch";
import osmtogeojson from "osmtogeojson";
import { DOMParser } from "xmldom";
import fs from "fs";

// EU country list (ISO code → name)
const euCountries = {
  BE: "Belgium",
  CY: "Cyprus",
  IE: "Ireland",
  NL: "Netherlands",
};

// Build Overpass query from ISO country code
function buildQuery(countryCode) {
  return `
  [out:xml];
  relation["ISO3166-1"="${countryCode}"]["boundary"="administrative"]["admin_level"="2"];
  out body;
  >;
  out skel qt;
  `;
}

// Fetch + save GeoJSON for one country
async function fetchGeoJSONForPlace(countryCode, place) {
  const query = buildQuery(countryCode);
  const url =
    "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  console.log(`Fetching ${place} (${countryCode})...`);

  try {
    const response = await fetch(url);
    const xmlText = await response.text();

    // Parse XML → DOM
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");

    // Convert OSM XML → GeoJSON
    const geojson = osmtogeojson(doc);

    // Ensure output folder exists
    if (!fs.existsSync("geojson")) {
      fs.mkdirSync("geojson");
    }

    // Save as .geojson file
    const geojsonString = JSON.stringify(geojson, null, 2);
    fs.writeFileSync(`geojson/${place}.geojson`, geojsonString);

    console.log(`✅ Saved ${place}.geojson`);
  } catch (err) {
    console.error(`❌ Failed for ${place}:`, err);
  }
}

// Run for all EU countries
async function main() {
  for (const [code, name] of Object.entries(euCountries)) {
    // polite delay: 10s between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await fetchGeoJSONForPlace(code, name);
  }
}

main();
