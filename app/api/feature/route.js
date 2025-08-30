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

// Map kb to isCompliant keys
const kbToRegion = {
  California_state_law: "california",
  EU_Digital_Service_Act: "eu",
  US_reporting_requirements_of_providers: "us",
  The_Florida_Senate: "florida",
  Utah_Social_Media_Regulation_Act: "utah"
};

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

    // Step 0: Validate feature
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

    // Step 2: Loop through laws, query embedding per kb
    const allDocuments = [];
    const complianceStatus = {
      us: "unknown",
      utah: "unknown",
      florida: "unknown",
      california: "unknown",
      eu: "unknown"
    };

    for (const kb of Object.keys(kbToRegion)) {
      const docs = await queryEmbedding(embedding, 3, kb); // 3 docs per law
      if (docs && docs.length > 0) {
        allDocuments.push(...docs);
      } else {
        // No docs found → set unknown for that law
        complianceStatus[kbToRegion[kb]] = "unknown";
        console.warn(`No related documents found for ${kb}`);
      }
    }

    // Step 3: If all documents are missing → bypass LLM entirely
    if (allDocuments.length === 0) {
      const reason = "No related documents found for any law";
      const feature = await storeFeatures(title, description, complianceStatus, reason);
      return NextResponse.json({ feature, reason });
    }

    // Step 4: Normal flow → Query LLM with all found documents
    const llmResult = await queryLLM(title, description, allDocuments);
    if (!llmResult || !llmResult.isCompliant) {
      return NextResponse.json(
        { error: "LLM did not return compliance data" },
        { status: 500 }
      );
    }

    // Step 5: Merge LLM results with unknowns for missing laws
    const finalCompliance = { ...complianceStatus, ...llmResult.isCompliant };
    const feature = await storeFeatures(title, description, finalCompliance, llmResult.reason);

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
