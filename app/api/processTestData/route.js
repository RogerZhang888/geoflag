// app/api/processTestData/route.js
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

/**
 * Accepts a CSV file in the request body (as text),
 * loops through each row, and calls /api/feature
 */
export async function POST(req) {
  try {
    const text = await req.text(); // CSV as text
    if (!text) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    // Parse CSV
    const records = parse(text, {
      columns: true, // Use first row as header
      skip_empty_lines: true
    });

    // Iterate rows and call /api/feature
    const results = [];
    for (const row of records) {
      const title = row.feature_name;
      const description = row.feature_description;

      if (!title || !description) {
        results.push({ row, error: "Missing title or description" });
        continue;
      }

      try {
        // Call your existing /api/feature endpoint
        const response = await fetch('http://localhost:3000/api/feature', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description })
        });

        const data = await response.json();
        results.push({ row, data });
      } catch (err) {
        results.push({ row, error: err.message });
      }
    }

    return NextResponse.json({ results });

  } catch (err) {
    console.error("Error processing CSV:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
