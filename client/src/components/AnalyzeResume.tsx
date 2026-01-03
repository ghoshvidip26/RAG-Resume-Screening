import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Props {
  parsedResume?: any;
  active?: boolean;
  onAnalysisSuccess: (analysis: any) => void;
  onStepStateChange: (state: "idle" | "running" | "done" | "error") => void;
  stepState: "idle" | "running" | "done" | "error";
  lastAnalysis?: any;
}
export default function AnalyzeResume({
  parsedResume,
  active,
  onAnalysisSuccess,
  onStepStateChange,
  stepState,
  lastAnalysis,
}: Props) {
  const [jobDescription, setJobDescription] = useState("");

  const runAnalysis = async () => {
    if (!parsedResume || !jobDescription) return;
    onStepStateChange("running");
    try {
      const { data } = await axios.post("http://localhost:3000/analyzeResume", {
        parsedResume,
        jobDescription,
      });
      console.log(data.analysis);
      onAnalysisSuccess(data.analysis.kwargs.content);
    } catch (err) {
      console.error(err);
      onStepStateChange("error");
      alert("Analysis failed.");
      return;
    }
    onStepStateChange("done");
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
            Step 3
          </p>
          <h2 className="text-xl font-semibold">Analyze vs JD</h2>
        </div>
        <StatusPill state={stepState} />
      </header>

      <div className="space-y-3">
        <textarea
          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white min-h-[180px]"
          placeholder="Paste the role description…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={!active}
        />

        <button
          disabled={!active || !jobDescription || stepState === "running"}
          onClick={runAnalysis}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {stepState === "running" ? "Analyzing…" : "Run Analysis"}
        </button>
      </div>

      {lastAnalysis && (
        <div className="mt-6 w-full max-w-3xl mx-auto overflow-x-hidden">
          <h3 className="text-sm uppercase text-slate-400 mb-3 tracking-wide">
            Latest Output
          </h3>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 text-left shadow-lg">
            {/* Match Score */}
            {lastAnalysis.matchScore && (
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">
                  Match Score
                </p>
                <p className="text-lg font-semibold text-green-400">
                  {lastAnalysis.matchScore}%
                </p>
              </div>
            )}

            {/* Strengths */}
            {lastAnalysis.strengths?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                  {lastAnalysis.strengths.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {lastAnalysis.improvements?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">
                  Improvements
                </p>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {lastAnalysis.improvements.map(
                    (item: string, index: number) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {lastAnalysis.suggestions && (
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">
                  Suggestions
                </p>
                <p className="text-sm text-slate-300 whitespace-pre-line break-words">
                  {lastAnalysis.suggestions}
                </p>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
                Show raw JSON
              </summary>

              <pre
                className="
          max-h-60 overflow-y-auto 
          bg-slate-950 border border-slate-800 
          rounded-lg p-3 text-[10px] text-slate-400 mt-2
          whitespace-pre-wrap break-all
        "
              >
                <ReactMarkdown>
                  {JSON.stringify(lastAnalysis, null, 2)}
                </ReactMarkdown>
              </pre>
            </details>
          </div>
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
