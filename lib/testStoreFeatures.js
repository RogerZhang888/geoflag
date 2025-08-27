import { storeFeatures } from "./llm.js";

async function run() {
  try {
    // Example values
    const feature = "Data Localization";
    const description = "All user data must be stored within the country's borders.";
    const isCompliant = "no";
    const region = ["Brazil", "India"];

    const result = await storeFeatures(feature, description, isCompliant, region);
    console.log("✅ Feature stored:", result);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
}

run();
