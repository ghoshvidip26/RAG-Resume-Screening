import { useState } from "react";
import axios from "axios";

interface Props {
  onUploadSuccess: (payload: { filePath: string; fileName: string }) => void;
  onStepStateChange: (state: "idle" | "running" | "done" | "error") => void;
  stepState: "idle" | "running" | "done" | "error";
  active?: boolean;
  fileMeta?: { path: string; name: string } | null;
}

export default function UploadResume({
  onUploadSuccess,
  onStepStateChange,
  stepState,
  fileMeta,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF resume.");
    onStepStateChange("running");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(
        "http://localhost:3000/uploadResume",
        formData
      );
      console.log("Upload Data: ", data);
      onUploadSuccess({ filePath: data.filePath, fileName: file.name }); // Use file.name since the server doesn't return fileName anymore
    } catch (err) {
      console.error(err);
      onStepStateChange("error");
      alert("Upload failed. Try again.");
      return;
    }
    onStepStateChange("done");
  };

  return (
    <article className="rounded-xl border border-slate-800 p-5 bg-gradient-to-br from-slate-900 to-slate-950">
      <header className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-400">
            Step 1
          </p>
          <h2 className="text-xl font-semibold">Upload resume</h2>
        </div>
        <StatusPill state={stepState} />
      </header>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
      />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500"
      >
        {stepState === "running" ? "Uploading…" : "Upload PDF"}
      </button>
      {fileMeta && (
        <p className="mt-3 text-sm text-slate-400">
          Current file: <span className="text-white">{fileMeta.name}</span>
        </p>
      )}
    </article>
  );
}

const pillCopy: Record<string, string> = {
  idle: "Waiting",
  running: "In progress",
  done: "Done",
  error: "Error",
};

function StatusPill({ state }: { state: keyof typeof pillCopy }) {
  const colors: Record<string, string> = {
    idle: "bg-slate-800 text-slate-300",
    running: "bg-amber-500/20 text-amber-300",
    done: "bg-emerald-500/20 text-emerald-300",
    error: "bg-rose-500/20 text-rose-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[state]}`}
    >
      {pillCopy[state]}
    </span>
  );
}
