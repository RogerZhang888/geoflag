import "dotenv/config";
import fs from "fs";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
console.log(supabaseUrl)
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Query Ollama (llama3.2) for compliance evaluation or feature validation
 * @param {string} title - The feature title
 * @param {string} description - The feature description
 * @param {string} mode - "validate" | "compliance" (default "compliance")
 * @returns {Promise<Object|string>} JSON with compliance booleans & reason OR "yes"/"no" string
 */
export async function queryLLM(title, description, mode = "compliance") {
  try {
    let prompt;

    if (mode === "validate") {
      // Lightweight validation prompt
      prompt = `
You are an assistant that evaluates whether a product input describes a valid, specific feature that could be checked for compliance. 
Do NOT judge whether the feature is legal, correct, or ethical. Only determine if it describes a tangible, non-trivial feature.

Title: "${title}"
Description: "${description}"

Answer only "yes" if this is a real feature suitable for compliance evaluation, or "no" if it is too vague, empty, or meaningless. 
Respond strictly with "yes" or "no", nothing else.
`;
    } else {
      // Full compliance evaluation prompt
      prompt = `
You are a compliance expert. Given a product feature, evaluate if it is legally compliant 
in different regions. Respond STRICTLY in valid JSON with double quotes around all property names.

Feature Title: "${title}"
Feature Description: "${description}"

Return JSON with this exact structure:

{
  "isCompliant": {
    "us": true/false,
    "utah": true/false,
    "florida": true/false,
    "california": true/false,
    "eu": true/false
  },
  "reason": "short explanation why you marked them as true/false"
}
`;
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: false
      })
    });

    if (!response.ok) throw new Error(`❌ Ollama request failed: ${response.statusText}`);

    const data = await response.json();
    const rawOutput = data?.response || data?.choices?.[0]?.message?.content;
    console.log(rawOutput);

    if (mode === "validate") {
      const match = rawOutput?.match(/\b(yes|no)\b/i); // match whole word "yes" or "no", case-insensitive
      if (match) return match[1].toLowerCase();
      console.warn("⚠️ Unexpected validation output:", rawOutput);
      return "no"; // fallback
    }

    // compliance mode: parse JSON
    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (e) {
      console.warn("⚠️ Model did not return clean JSON, attempting to fix...");
      const fixed = rawOutput.match(/\{[\s\S]*\}/); // try to extract JSON
      parsed = fixed
        ? JSON.parse(fixed[0])
        : { error: "Invalid JSON from model", rawOutput };
    }

    return parsed;
  } catch (err) {
    console.error("❌ queryLLM error:", err.message || err);
    throw err;
  }
}


/** Generate embeddings */
export async function generateEmbedding(text) {
  try {
    const response = await fetch("http://localhost:11434/api/embed", {
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
    console.log("Embedding response:", data);

    return data.embeddings[0];
  } catch (err) {
    console.error("❌ generateEmbedding error:", err.message || err);
    throw err;
  }
}

/** Store one document in Supabase */
export async function storeEmbedding(doc) {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      { text: doc.text, embedding: doc.embedding, metadata: doc.metadata }
    ]);

  if (error) console.error("❌ Error inserting:", error);
  else console.log("✅ Inserted document:", data);
}

/**
 * Query Supabase for similar embeddings, optionally filtered by kb (law)
 * @param {number[]} queryVector - Embedding vector
 * @param {number} matchCount - Max number of matches to return
 * @param {string|null} kbFilter - Optional kb to filter documents (e.g., "California_state_law")
 * @returns {Promise<Array>} Array of matched documents
 */
export async function queryEmbedding(queryVector, matchCount = 3, kbFilter = null) {
  try {
    if (!Array.isArray(queryVector)) {
      throw new Error("queryEmbedding expects queryVector to be an array of numbers");
    }

    const rpcParams = {
      query_embedding: queryVector,
      match_count: matchCount,
      kb_filter: kbFilter // Pass kbFilter to Supabase RPC
    };

    const { data, error } = await supabase.rpc("match_documents", rpcParams);

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

/**
 * Store a feature in the `features` table
 * @param {string} feature
 * @param {string} description
 * @param {string} isCompliant
 * @param {string[]} region
 */
export async function storeFeatures(feature, description, isCompliant, reason) {
  try {
    if (!feature || !description || !isCompliant || !reason) {
      throw new Error(
        "All four fields (feature, description, isCompliant, reason) are required."
      );
    }

    const { data, error } = await supabase
      .from("features")
      .insert([
        {
          feature,
          description,
          isCompliant,
          reason
        }
      ])
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("❌ storeFeatures error:", err.message || err);
    throw err;
  }
}
