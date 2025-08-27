import { generateEmbedding, queryEmbedding } from "./llm.js";

async function test() {
  const text = "Regulations for website accessibility in Singapore";

  // Generate embedding
  const embedding = await generateEmbedding(text);

  // Query similar documents
  const results = await queryEmbedding(embedding, 3);

  console.log("Top matches:", results);
}

test().catch(err => console.error(err));
