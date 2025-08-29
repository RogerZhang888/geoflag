// app/api/post-feature/route.js
import { NextResponse } from "next/server";
import {
  generateEmbedding,
  queryEmbedding,
  queryLLM,
  storeFeatures
} from "@/lib/llm";

/**
 * Lightweight feature validation.
 * Uses the same LLM to classify if input is a meaningful feature for compliance.
 */
async function isValidFeature(title, description) {
  try {
    const result = await queryLLM(title, description, "validate");
    if (!result || typeof result !== "string") return false;
    const normalized = result.trim().toLowerCase();
    return normalized === "yes";
  } catch (err) {
    console.warn("Feature validation failed, treating as invalid:", err);
    return false;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: title, description" },
        { status: 400 }
      );
    }

    // Step 0: Check if input is a valid feature
    const validFeature = await isValidFeature(title, description);
    if (!validFeature) {
      return NextResponse.json(
        { error: "Input does not appear to be a meaningful feature" },
        { status: 400 }
      );
    }

    // Step 1: Generate embedding
    const embedding = await generateEmbedding(`${title} ${description}`);
    if (!embedding) {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 }
      );
    }

    // Step 2: Query embedding → retrieve array of JSON docs
    const documents = await queryEmbedding(embedding);
    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "No related documents found" },
        { status: 500 }
      );
    }

    // Step 3: Query LLM with title, description, and documents
    const llmResult = await queryLLM(title, description, documents);
    if (!llmResult || !llmResult.isCompliant) {
      return NextResponse.json(
        { error: "LLM did not return compliance data" },
        { status: 500 }
      );
    }

    // Step 4: Store in Supabase
    const feature = await storeFeatures(
      title,
      description,
      llmResult.isCompliant
    );

    // Step 5: Return feature + reasoning
    return NextResponse.json({
      feature,
      reason: llmResult.reason
    });

  } catch (err) {
    console.error("Error in /api/post-feature:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
