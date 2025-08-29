import { readFile } from "fs/promises";
import path from "path";
import { generateEmbedding, storeEmbedding } from "../llm.js";

export async function processDocuments() {
  // Resolve path relative to project root
  const filePath = path.join(process.cwd(), "lib/laws_json_file/California_state_law.json");
  const fileContent = await readFile(filePath, "utf-8");
  const docs = JSON.parse(fileContent);

  for (const doc of docs) {
    try {
      const embedding = await generateEmbedding(doc.text);

      const metadata = {
        kb: doc.kb,
        article_number: doc["article number"] || null,
        type: doc.type,
        section: doc.section || null,
        word_count: doc["word count"] || null,
      };

      await storeEmbedding({ text: doc.text, embedding, metadata });
    } catch (err) {
      console.error("❌ Error processing document:", doc, err);
    }
  }

  console.log("✅ All documents processed");
}

// Call this function somewhere in your server-side code
processDocuments();
