export default function MatchScore({ score }: { score: number }) {
  return (
    <div className="p-4 border rounded-md shadow-md my-4">
      <h2 className="text-lg font-bold">Match Score</h2>
      <div className="mt-2 text-2xl font-bold text-green-600">
        {score ?? "N/A"}%
      </div>
    </div>
  );
}
