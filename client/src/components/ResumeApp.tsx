import { useMemo, useState } from "react";
import UploadResume from "./UploadResume";
import ParseResume from "./ParseResume";
import AnalyzeResume from "./AnalyzeResume";

type StepState = "idle" | "running" | "done" | "error";

interface Props {
  onAnalysisComplete: (analysis: any) => void;
}

export default function ResumeApp({ onAnalysisComplete }: Props) {
  const [fileMeta, setFileMeta] = useState<{
    path: string;
    name: string;
  } | null>(null);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({
    upload: "idle",
    parse: "idle",
    analyze: "idle",
  });

  const progress = useMemo(() => {
    const values = Object.values(steps);
    const completed = values.filter((state) => state === "done").length;
    return (completed / values.length) * 100;
  }, [steps]);

  const updateStep = (key: keyof typeof steps, state: StepState) =>
    setSteps((prev) => ({ ...prev, [key]: state }));

  const handleUploadSuccess = (payload: {
    filePath: string;
    fileName: string;
  }) => {
    updateStep("upload", "done");
    updateStep("parse", "idle");
    updateStep("analyze", "idle");
    setFileMeta({ path: payload.filePath, name: payload.fileName });
    setParsedResume(null);
    setAnalysis(null);
  };

  const handleParseSuccess = (parsed: any) => {
    updateStep("parse", "done");
    updateStep("analyze", "idle");
    setParsedResume(parsed);
  };

  const handleAnalysisSuccess = (result: any) => {
    updateStep("analyze", "done");
    setAnalysis(result);
    onAnalysisComplete?.(result);
  };

  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <p className="text-sm uppercase text-slate-400 mb-2">
          Pipeline progress
        </p>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <UploadResume
          stepState={steps.upload}
          onStepStateChange={(state) => updateStep("upload", state)}
          onUploadSuccess={handleUploadSuccess}
          active
          fileMeta={fileMeta}
        />
        <ParseResume
          stepState={steps.parse}
          onStepStateChange={(state) => updateStep("parse", state)}
          filePath={fileMeta?.path}
          onParseSuccess={handleParseSuccess}
          active={Boolean(fileMeta)}
          parsedResume={parsedResume}
        />
        <AnalyzeResume
          stepState={steps.analyze}
          onStepStateChange={(state) => updateStep("analyze", state)}
          parsedResume={parsedResume}
          active={Boolean(parsedResume)}
          onAnalysisSuccess={handleAnalysisSuccess}
          lastAnalysis={analysis}
        />
      </div>
    </section>
  );
}
