export default function ResumeHighlights({
  highlights,
}: {
  highlights: string[];
}) {
  return (
    <div className="p-4 border rounded-md shadow-md my-4">
      <h2 className="text-lg font-bold">Resume Highlights</h2>
      <ul className="list-disc ml-6 mt-2">
        {highlights?.length ? (
          highlights.map((item, i) => <li key={i}>{item}</li>)
        ) : (
          <li>No highlights available</li>
        )}
      </ul>
    </div>
  );
}
