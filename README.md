# 📄 RAG-Resume-Screening

## 🧠 Overview

**RAG-Resume-Screening** is an AI-powered resume analysis system that evaluates candidate resumes against job descriptions using **Retrieval-Augmented Generation (RAG)**. The system embeds resume content into a vector store, retrieves relevant evidence based on job requirements, and uses a Large Language Model to generate grounded, evidence-based insights — helping recruiters and candidates understand skill fit, gaps, and alignment.

---

## 🚀 Features

* 🗃️ **PDF Resume Upload**
  Extracts and chunks PDF resumes for semantic indexing.

* 🧠 **RAG-Driven Evaluation**
  Uses embeddings + vector retrieval to find relevant resume evidence.

* 💬 **LLM-Based Q&A**
  Answers job-relevant queries grounded strictly in retrieved resume context.

* 📊 **Evaluation Metrics**
  Computes quantitative scores (e.g., faithfulness, context recall/precision) using RAGAS.

* 📈 **Resume Match Score**
  Aggregates grounding metrics into a 0–100 resume-to-job alignment score.

---

## 📌 How It Works

1. **Upload Resume** → Extract text and split into semantic chunks.
2. **Vector Indexing** → Store chunks using FAISS embeddings.
3. **Job Description Input** → Accepts any JD text.
4. **Dynamic Skill Extraction** → Extracts key skills from JD.
5. **Query Generation & Retrieval** → Generates fact-based questions (e.g., “Does the resume mention FastAPI?”).
6. **LLM Grounded Responses** → Answers are generated using Gemini (Google) anchored to retrieved context.
7. **Evaluation** → RAGAS metrics quantify grounding quality.
8. **Resume Match Score** → Outputs a normalized match percentage.

---

## 🧩 Core Technologies
| Component      | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | React, TypeScript, Vite                        |
| Backend        | Node.js, TypeScript                            |
| Resume Parsing | LangChain Community Loaders (PDF)              |
| Vector Store   | FAISS                                          |
| Embeddings     | Google Gemini Embeddings                       |
| LLM            | Google Gemini                                  |
| RAG Framework  | LangChain                                      |
| RAG Evaluation | RAGAS (Faithfulness, Context Precision/Recall) |
| Evaluation UI  | Streamlit (Evaluation Module)                  |

---

## 📥 Usage

1️⃣ Clone the repository

   ```bash
    git clone https://github.com/ghoshvidip26/RAG-Resume-Screening
    cd RAG-Resume-Screening
   ```

2️⃣ Frontend Setup (React)
   ```bash
    cd client
    npm install
    npm run dev
   ```
Runs the resume screening UI.

3️⃣ Backend Setup (Node.js)

   ```bash
    cd server
    npm install
    npm run dev
   ```
Handles:
- Resume upload
- Vector indexing
- RAG query execution
  
4️⃣ Evaluation Module
   ```bash
    cd server/evaluation
    pip install -r requirements.txt
    export GOOGLE_API_KEY="<YOUR_API_KEY>"
    streamlit run eval.py
   ```
Used for:
- Faithfulness measurement
- Retrieval quality analysis
- JD–Resume alignment scoring
  
5️⃣ How to Use
1. Upload a resume PDF
2. Paste a job description
3. View:
   - RAG-based answers
   - Skill gaps
   - Resume–JD alignment
   - Evaluation metrics

---

## 🧪 Evaluation

This project demonstrates:

* Practical RAG pipelines
* Hallucination-aware, evidence-grounded responses
* Quantitative metric reporting
* JD-driven evaluation automation
* Real-world applicability in hiring systems

---

## 📁 Folder Structure (example)

```
├── client/                    # React frontend
│   ├── src/
│   ├── public/
│   └── vite.config.ts
│
├── server/                    # Node.js backend
│   ├── uploads/
│   ├── vector-store/
│   ├── app.ts
│   └── evaluation/            # RAG evaluation module
│       ├── eval.py
│       └── requirements.txt
│
├── README.md
└── .env

```
