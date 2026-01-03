import { loadVectorStore } from "./vectorStore.js";
import { geminiLLM } from "./gemini.js";
export async function analyzeResume(jobDescription: string) {
  const store = await loadVectorStore();

  const results = await store.similaritySearch(jobDescription, 5);

  const resumeContext = results.map((r) => r.pageContent).join("\n\n---\n\n");

  const response = await geminiLLM.invoke([
    {
      role: "system",
      content: `
You are an AI Resume Analysis Engine. 
Compare the resume context with the job description and respond ONLY in VALID JSON.
DO NOT add commentary, markdown, or code fences. 
If information is missing, set the field to null.

The JSON MUST follow this schema:

{
  "match_score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "missing_skills": string[],
  "insights": string
}
`,
    },
    {
      role: "user",
      content: `
Job Description:
${jobDescription}

Resume Context:
${resumeContext}
`,
    },
  ]);
  return response;
}
