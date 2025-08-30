import { NextResponse } from "next/server";
import { processDocuments } from "@/lib/data/insertEmbeddings.js";

export async function POST(req) {
  try {
    // Trigger the embedding insertion
    await processDocuments();

    return NextResponse.json({
      status: "success",
      message: "All documents processed and embeddings stored",
    });
  } catch (err) {
    console.error("❌ /api/insertEmbedding error:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
