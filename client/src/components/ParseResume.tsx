import { useState } from "react";
import axios from "axios";

interface Props {
  filePath?: string;
  parsedResume?: any;
  onParseSuccess: (parsed: any) => void;
  active?: boolean;
  onStepStateChange: (state: "idle" | "running" | "done" | "error") => void;
  stepState: "idle" | "running" | "done" | "error";
}

export default function ParseResume({
  filePath,
  parsedResume,
  onParseSuccess,
  active,
  onStepStateChange,
  stepState,
}: Props) {
  const [showPreview, setShowPreview] = useState(false);

  const handleParse = async () => {
    if (!filePath) return;
    onStepStateChange("running");

    try {
      // 1️⃣ Parse resume
      const response = await axios.post("http://localhost:3000/parseResume", {
        filePath,
      });

      const parsedText = response.data.parsedResume;

      // update UI
      onParseSuccess(parsedText);

      // 2️⃣ Build Vector DB RIGHT AFTER parsing
      await axios.post("http://localhost:3000/buildVectorDb", {
        parsedText,
      });

      onStepStateChange("done");
    } catch (err) {
      console.error(err);
      onStepStateChange("error");
      alert("Parsing failed. Try again.");
    }
  };

  return (
    <article
      className={`rounded-xl border p-5 transition ${
        active
          ? "border-slate-700 bg-slate-900"
          : "border-slate-900 bg-slate-950 text-slate-500"
      }`}
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-400">
            Step 2
          </p>
          <h2 className="text-xl font-semibold">Parse resume</h2>
        </div>
        <StatusPill state={stepState} />
      </header>

      <button
        disabled={!active || stepState === "running"}
        onClick={handleParse}
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500"
      >
        {stepState === "running" ? "Parsing…" : "Parse & Extract"}
      </button>

      {parsedResume && (
        <div className="mt-4">
          <button
            className="text-sm text-blue-400 underline"
            onClick={() => setShowPreview((s) => !s)}
          >
            {showPreview ? "Hide parsed text" : "Preview parsed text"}
          </button>
          {showPreview && (
            <pre className="mt-3 max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
              {JSON.stringify(parsedResume, null, 2)}
            </pre>
          )}
        </div>
      )}
    </article>
  );
}

const StatusPill = (props: any) => <UploadStatus {...props} />;
const UploadStatus = ({
  state,
}: {
  state: "idle" | "running" | "done" | "error";
}) => {
  const color: Record<typeof state, string> = {
    idle: "bg-slate-800 text-slate-300",
    running: "bg-amber-500/20 text-amber-300",
    done: "bg-emerald-500/20 text-emerald-300",
    error: "bg-rose-500/20 text-rose-200",
  } as any;
  const label: Record<typeof state, string> = {
    idle: "Waiting",
    running: "In progress",
    done: "Done",
    error: "Error",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${color[state]}`}
    >
      {label[state]}
    </span>
  );
};
