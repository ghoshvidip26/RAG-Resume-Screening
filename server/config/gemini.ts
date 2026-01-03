import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

export const geminiLLM = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  maxRetries: 3, // Built-in retry
  apiKey: process.env.GOOGLE_API_KEY!,
});

export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY!,
});
