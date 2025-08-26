import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { NomicEmbeddings } from "@langchain/nomic";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Nomic embeddings
const nomicEmbeddings = new NomicEmbeddings({
  apiKey: process.env.NOMIC_API_KEY,
  modelName: "nomic-embed-text-v1.5", // or 'nomic-embed-text-v1'
  // Optionally specify dimension (64, 128, 256, or 512; defaults to highest—768)
  // This is supported with v1.5 model.
});

// Parse .txt file and extract metadata
function parseTxtFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const metadata = {
    kb: "",
    title: "",
    images: [],
    section: "",
    mime_type: "text/plain",
    source_url: ""
  };

  const lines = raw.split("\n");
  lines.forEach((line) => {
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (key && metadata.hasOwnProperty(key.trim())) {
      if (key.trim() === "images") {
        metadata.images = value ? value.split(",").map((s) => s.trim()) : [];
      } else {
        metadata[key.trim()] = value || "";
      }
    }
  });

  return { text: raw, metadata };
}

// Generate embedding using Nomic embedder
async function getEmbedding(text) {
  const res = await nomicEmbeddings.embedDocuments([text]);
  // Returns an array of embeddings; we only passed one text
  return res[0];
}

// Main function to generate embedding and insert into Supabase
export async function generateEmbedding(filePath) {
  try {
    const { text, metadata } = parseTxtFile(filePath);
    const embedding = await getEmbedding(text);

    // Insert into Supabase
    const { data, error } = await supabase
      .from("documents")
      .insert([{ content: text, embedding, metadata }])
      .select();

    if (error) throw error;
    console.log(`✅ Successfully inserted document from ${path.basename(filePath)}`);
    return data;
  } catch (err) {
    console.error("❌ Error in generateEmbedding:", err);
  }
}

// Allow running the script directly
if (import.meta.url === process.argv[1] || process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide a text file path, e.g., `node llm.js ./doc1.txt`");
    process.exit(1);
  }
  generateEmbedding(filePath);
}
