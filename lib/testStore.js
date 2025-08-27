import fs from "fs";
import { generateEmbedding, storeEmbedding } from "./llm.js";

async function run() {
  try {
    // Get filename from command line
    const fileName = process.argv[2];
    if (!fileName) {
      throw new Error("Usage: node test_store.js <file.json>");
    }

    // Load JSON file
    const rawData = fs.readFileSync(fileName, "utf-8");
    const doc = JSON.parse(rawData);

    // Validate required fields
    const requiredFields = ["kb", "section", "text"];
    for (const field of requiredFields) {
      if (!doc[field] || typeof doc[field] !== "string") {
        throw new Error(`Invalid or missing field: "${field}"`);
      }
    }

    console.log(`Processing: [${doc.kb}] ${doc.section}`);

    // Generate embedding
    const embedding = await generateEmbedding(doc.text);

    // Store into Supabase
    const result = await storeEmbedding({
      text: doc.text,
      embedding,
      metadata: {
        kb: doc.kb,
        section: doc.section,
      },
    });

    console.log("Stored:", result);

  } catch (err) {
    console.error("Error:", err.message || err);
  }
}

run();
