import fetch from "node-fetch";
import osmtogeojson from "osmtogeojson";
import { DOMParser } from "xmldom";
import fs from "fs";

const place = "US";

const query = `
[out:xml];
relation["ISO3166-1"="${place}"]["boundary"="administrative"]["admin_level"="2"];
out body;
>;
out skel qt;
`;

async function getRegionGeoJSON() {
  const url =
    "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const response = await fetch(url);
  const xmlText = await response.text();

  // Parse XML into DOM
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");

  // Convert OSM XML → GeoJSON
  const geojson = osmtogeojson(doc);

  // Stringify full GeoJSON
  const geojsonString = JSON.stringify(geojson, null, 2);

  // Save as .geojson file
  fs.writeFile(`geojson/${place}.geojson`, geojsonString, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log(`GeoJSON for ${place} saved as ${place}.geojson`);
    }
  });
}

getRegionGeoJSON();
