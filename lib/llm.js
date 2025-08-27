import 'dotenv/config';
import fs from "fs";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

/** Generate embeddings */
export async function generateEmbedding(text) {
  const response = await fetch("http://localhost:11434/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: text
    })
  });

  if (!response.ok) throw new Error(`Embedding request failed: ${response.statusText}`);

  const data = await response.json();
  return data.data[0].embedding;
}

/** Store one document in Supabase */
export async function storeEmbedding(doc) {
  const { data, error } = await supabase
    .from("documents")
    .insert([{ text: doc.text, embedding: doc.embedding, metadata: doc.metadata }]);

  if (error) console.error("❌ Error inserting:", error);
  else console.log("✅ Inserted document:", data);
}

/** Query Supabase for similar embeddings */
export async function queryEmbedding(queryVector, matchCount = 3) {
  try {
    // Ensure vector is passed as an array of numbers
    if (!Array.isArray(queryVector)) {
      throw new Error("queryEmbedding expects queryVector to be an array of numbers");
    }

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryVector,
      match_count: matchCount,
    });

    if (error) {
      console.error("❌ Supabase query error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("❌ Error in queryEmbedding:", err);
    return [];
  }
}

function cosineDistance(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return 1 - dot / (magA * magB);
}


/**
 * Store a feature in the `features` table
 * @param {string} feature
 * @param {string} description
 * @param {string} isCompliant
 * @param {string[]} region
 */
export async function storeFeatures(feature, description, isCompliant, region) {
  try {
    if (!feature || !description || !isCompliant || !region) {
      throw new Error("All four fields (feature, description, isCompliant, region) are required.");
    }
    if (!Array.isArray(region)) {
      throw new Error(`"region" must be an array of strings`);
    }

    const { data, error } = await supabase
      .from("features")
      .insert([{
        feature,
        description,
        isCompliant,
        region
      }])
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("❌ storeFeatures error:", err.message || err);
    throw err;
  }
}
