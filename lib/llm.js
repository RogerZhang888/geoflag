import dotenv from 'dotenv/config';
import fs from "fs";
import fetch from "node-fetch";
import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate embeddings for a text using Ollama's nomic-embed-text
 */
async function generateEmbedding(text) {
  const response = await fetch("http://localhost:11434/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: text
    })
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Store embedding + metadata in the features table
 */
export async function storeEmbedding(doc) {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        text: doc.text,
        embedding: doc.embedding,
        metadata: doc.metadata,
      },
    ]);

  if (error) {
    console.error("Error inserting into Supabase:", error);
  } else {
    console.log("Inserted document:", data);
  }
}

/**
 * Main pipeline
 */
async function main() {
  // Load JSON file
  const file = process.argv[2];
  const raw = fs.readFileSync(file, "utf8");
  const jsonData = JSON.parse(raw);

  // Extract metadata (everything except text)
  const { text, ...metadata } = jsonData;


  const embedding = await generateEmbedding(text);
  await storeEmbedding({
    text: text,
    embedding,
    metadata
  });
  console.log(`Stored file with length ${text.length}`);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});


/**
 * Query the documents table for similarity to a given embedding vector
 * @param {number[]} query - the embedding vector
 * @param {number} matchCount - optional, number of top matches to return
 * @returns {Array} array of objects {id, text, metadata, similarity}
 */
export async function queryEmbedding(query, matchCount = 5) {
  try {
    // Supabase SQL RPC query for cosine similarity
    const { data, error } = await supabase
      .from('documents')
      .select('id, text, metadata, embedding')
      .order(`embedding <=> ${JSON.stringify(query)}`, { ascending: true })
      .limit(matchCount);

    if (error) {
      console.error("❌ Supabase query error:", error);
      return [];
    }

    // Calculate similarity as 1 - cosine_distance if you want actual similarity score
    const results = data.map(doc => ({
      id: doc.id,
      text: doc.text,
      metadata: doc.metadata,
      similarity: 1 - cosineDistance(doc.embedding, query)
    }));

    return results;

  } catch (err) {
    console.error("❌ Error querying embeddings:", err);
    return [];
  }
}

/**
 * Compute cosine distance (for reference) if needed
 */
function cosineDistance(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return 1 - dot / (magA * magB);
}

