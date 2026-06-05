interface ScoreGaugeProps {
  score: number; // 0-100
  grade: string;
  size?: number;
}

function colorForScore(score: number): string {
  if (score >= 75) return "var(--success)";
  if (score >= 45) return "var(--warning)";
  return "var(--destructive)";
}

export default function ScoreGauge({ score, grade, size = 180 }: ScoreGaugeProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorForScore(score);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-extrabold leading-none"
          style={{ color }}
        >
          {grade}
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          {score} / 100
        </span>
      </div>
    </div>
  );
}
