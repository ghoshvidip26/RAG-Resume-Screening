import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { geminiEmbeddings } from "./gemini";

export async function buildVectorStoreFromText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);

  const store = await FaissStore.fromDocuments(docs, geminiEmbeddings);

  await store.save("./vector-store");

  return store;
}

export async function loadVectorStore() {
  return await FaissStore.load("./vector-store", geminiEmbeddings);
}
