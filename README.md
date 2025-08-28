# NAME

**NAME** is a private LLM-powered compliance dashboard that helps global apps navigate complex region-specific regulations. With an interactive world map, polygon-based compliance visualization, and feature management, GeoComply ensures that legal obligations are visible, auditable, and actionable in real-time.

We are a group of CS students from NUS RC4 LEO and this is our submission for TikTok TechJam 2025.

---

## 🚀 Inspiration

Global apps like TikTok must comply with dozens of regional regulations—from GDPR in Europe to Brazil’s data localization rules. Manual tracking of features and compliance logic is tedious and error-prone. GeoComply was born to **turn regulatory uncertainty into a clear, visual, and traceable process**, using AI to detect and flag compliance requirements automatically.

---

## 🎯 What It Does

GeoComply allows users to:

- **Visualize Global Compliance**: World map with green/red polygons to indicate feature compliance per region.
- **CRUD Features & Descriptions**: Track every feature and its regulatory requirements.
- **AI-Powered Compliance Detection**: LLM flags features that may need region-specific logic.
- **Audit-Ready Output**: Generate traceable, documented compliance insights automatically.

---

## 🛠️ How We Built It

GeoComply combines cutting-edge AI with modern web tech:

- **LLM Intelligence**: Uses Ollama LLM for analyzing feature compliance. 🤖
- **RAG (Retrieval-Augmented Generation)**: Incorporates policies stored in Supabase and vector DB to provide precise regulatory context.
- **OCR**: Tesseract extracts regulatory information from uploaded documents. 📄
- **Interactive Frontend**: Built with Next.js and ShadCN UI for a smooth, responsive dashboard.
- **Global Visualization**: Polygon-based world map shows compliant/non-compliant regions in real-time. 🌐

## 👨‍💻 Technologies Used

- **Languages**: JavaScript, TypeScript, Python
- **Frontend**: Next.js, ShadCN UI
- **Backend / Storage**: Supabase, Vector DB
- **AI / LLM**: Ollama, Tesseract OCR

---

## 🤔 Challenges We Faced

- **Geo-Specific Complexity**: Mapping dozens of regional regulations accurately.
- **Server vs Client Rendering**: Leaflet maps required careful handling to avoid SSR issues.
- **AI Accuracy**: Ensuring the LLM correctly flags compliance without false positives.
- **Feature Management**: Designing CRUD functionality that is intuitive yet audit-ready.

---

## 🏆 Accomplishments We're Proud Of

- Built a fully functional **interactive global compliance dashboard**.
- Integrated **LLM + OCR + vector search** for automated regulatory detection.
- Designed a **clean, user-friendly interface** with ShadCN UI and Next.js.
- Turned complex regulatory compliance into **traceable, actionable outputs**.

---

## 📖 What We Learned

- Handling **client-only rendering** in Next.js for Leaflet and dynamic components.
- How to combine **LLM intelligence with structured feature tracking**.
- Best practices for **visualizing global data** with polygons and color coding.
- Rapid prototyping for hackathon-ready AI + web solutions.

---

## 🚀 What's Next for GeoComply

- **Expand Regulatory Sources**: Add more policies and documents for RAG.
- **Feature Insights**: Provide recommended fixes for non-compliant features.
- **Advanced Analytics**: Track compliance trends over time.
- **Collaboration Tools**: Allow multiple users to manage features and compliance together.

---

## 🛠️ How to Run the Project

1. Clone the repository:

```bash
git clone placeholder
```

2. Install dependencies:

```bash
cd _
npm i
```

3. Setup Supabase and vector DB credentials in `.env`.
4. Run the development server:

```bash
npm run dev
```

## ☎️ Contact

- Tham Kei Lok (Lead Architect/Team Lead) - [LinkedIn](https://www.linkedin.com/in/keiloktql/)

- Wang Jia Hua (Frontend Engineer) - [LinkedIn](https://www.linkedin.com/in/jiahua-wang-74ewfb/)

- Roger Zhang (Backend Engineer) - [LinkedIn](https://www.linkedin.com/in/roger-zhang-33b98a262/)

- Gerald Fong Shao En (Data Engineer) [LinkedIn](https://www.linkedin.com/in/gerald-fong-shao-en/)
