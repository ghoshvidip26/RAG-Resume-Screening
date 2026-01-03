import "dotenv/config";
import express from "express";
import cors from "cors";
import { upload } from "./config/utils.js";
import { pdfParse } from "./config/pdfParse.js";
import { buildVectorStoreFromText } from "./config/vectorStore.js";
import { analyzeResume } from "./config/resumeAnalyzer.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/uploadResume", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  res.status(200).json({
    message: "File uploaded successfully",
    filePath: req.file.path,
    fileName: req.file.originalname,
  });
});

// STEP 2 — Parse Resume (TEXT ONLY)
app.post("/parseResume", async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) return res.status(400).json({ message: "filePath required" });

  try {
    const parsedResume = await pdfParse(filePath);
    res.status(200).json({ parsedResume, status: 200 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to parse resume" });
  }
});

// STEP 3 — Build Vector DB (FROM TEXT)
app.post("/buildVectorDb", async (req, res) => {
  const { parsedText } = req.body;

  if (!parsedText) {
    return res.status(400).json({ message: "parsedText is required" });
  }

  try {
    await buildVectorStoreFromText(parsedText);
    res.status(200).json({ message: "Vector DB created" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to build vector DB" });
  }
});

// STEP 4 — ANALYZE
app.post("/analyzeResume", async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription)
    return res.status(400).json({ message: "jobDescription required" });

  try {
    const result = await analyzeResume(jobDescription);
    res.status(200).json({ analysis: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Analysis failed" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
