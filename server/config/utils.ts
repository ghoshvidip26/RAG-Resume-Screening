import multer from "multer";
import fs from "fs";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { geminiEmbeddings } from "./gemini.js";

const uploadDir = "./uploads";
const VECTOR_DIR = "./vector-store";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(VECTOR_DIR)) fs.mkdirSync(VECTOR_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const upload = multer({ storage });

export async function saveVectorStore(chunks: any[]) {
  const store = await FaissStore.fromDocuments(chunks, geminiEmbeddings);
  await store.save(VECTOR_DIR);
  console.log("FAISS DB saved to disk");
  return store;
}

export async function loadVectorStore() {
  return await FaissStore.load(VECTOR_DIR, geminiEmbeddings);
}
