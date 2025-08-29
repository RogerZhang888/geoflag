// pages/api/post-feature.js
import { generateEmbedding, queryEmbedding, queryLLM, storeFeatures } from "@/lib/llm";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Missing required fields: title, description" });
    }

    // Step 1: Generate embedding
    const embedding = await generateEmbedding(`${title} ${description}`);

    if (!embedding) {
      return res.status(500).json({ error: "Failed to generate embedding" });
    }

    // Step 2: Query embedding → retrieve array of JSON docs
    const documents = await queryEmbedding(embedding);

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(500).json({ error: "No related documents found" });
    }

    // Step 3: Query LLM with title, description, and documents
    const llmResult = await queryLLM(title, description, documents);

    // Expected shape:
    // {
    //   isCompliant: { us: true/false, utah: true/false, ... },
    //   reason: "short explanation"
    // }

    if (!llmResult || !llmResult.isCompliant) {
      return res.status(500).json({ error: "LLM did not return compliance data" });
    }

    // Step 4: Store in Supabase
    const feature = await storeFeatures(
      title,
      description,
      llmResult.isCompliant
    );

    // Step 5: Return feature + reasoning
    return res.status(200).json({
      feature,
      reason: llmResult.reason,
    });

  } catch (err) {
    console.error("Error in /api/post-feature:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
