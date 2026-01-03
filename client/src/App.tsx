import { useState } from "react";
import MatchScore from "./components/MatchScore";
import ResumeHighlights from "./components/ResumeHighlights";
import ResumeApp from "./components/ResumeApp";

function App() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  return (
    <main className="min-h-screen w-full bg-slate-950 flex justify-center items-start py-10 px-4">
      <div className="max-w-4xl w-full text-white space-y-8">
        <header className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            AI Talent Ops
          </p>
          <h1 className="text-4xl font-bold">Interactive Resume Screening</h1>
          <p className="text-slate-300">
            Upload a resume, extract key signals, compare against your JD, then
            keep iterating through chat.
          </p>
        </header>

        <ResumeApp onAnalysisComplete={setAnalysisResult} />

        {analysisResult && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MatchScore score={analysisResult.matchScore} />
            <ResumeHighlights highlights={analysisResult.highlights} />
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
