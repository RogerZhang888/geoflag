import fetch from "node-fetch";
import osmtogeojson from "osmtogeojson";
import { DOMParser } from "xmldom";
import fs from "fs";

const place = "Florida";

const query = `
[out:xml];
relation["name"="${place}"]["boundary"="administrative"]["admin_level"="4"];
out body;
>;
out skel qt;
`;

async function getRegionGeoJSON() {
  const url =
    "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const response = await fetch(url);
  const xmlText = await response.text();

  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const geojson = osmtogeojson(doc);

  // 🔑 Pick the largest polygon by area (the mainland)
  let largest = null;
  let maxPoints = 0;

  geojson.features.forEach((f) => {
    if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
      let coords = f.geometry.coordinates.flat(Infinity);
      if (coords.length > maxPoints) {
        maxPoints = coords.length;
        largest = f.geometry.coordinates;
      }
    }
  });

  const coords = largest; // mainland polygon coords

  const coordsString = JSON.stringify(coords, null, 2);
  fs.writeFile(`${place}-coords.json`, coordsString, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("Coordinates saved");
    }
  });
}

getRegionGeoJSON();