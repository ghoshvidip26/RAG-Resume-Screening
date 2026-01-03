import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function pdfParse(filePath: string) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // join all pages
  const raw = docs.map((d) => d.pageContent ?? "").join("\n");

  return raw.trim(); // return TEXT ONLY
}
