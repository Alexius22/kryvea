type ScoreBarProps = {
  /** Must be a value between 0 - 10 */
  score: number;
};
export default function ScoreBar({ score }: ScoreBarProps) {
  if (score < 0) {
    score = 0;
  }
  if (score > 10) {
    score = 10;
  }

  const getScoreColor = (score: number) => {
    if (score < 4) return "bg-green-500";
    if (score < 7) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="h-3 w-full rounded-full bg-neutral-500/25">
      <div
        className={`${getScoreColor(score)} h-3 rounded-full`}
        style={{
          width: `${score * 10}%`,
        }}
      />
    </div>
  );
}
