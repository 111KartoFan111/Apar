type BarDatum = { label: string; value: number };
type LineDatum = { label: string; value: number };
type DonutSegment = { label: string; value: number; color: string };

export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-md bg-primary/80"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: "6px" }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-xs text-slate-600 mt-2">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data }: { data: LineDatum[] }) {
  const w = 320;
  const h = 140;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (w - 20) + 10;
    const y = h - (d.value / max) * (h - 20) - 10;
    return { x, y, label: d.label, value: d.value };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width={w} height={h} className="text-primary">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
      {points.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r={4} fill="white" stroke="currentColor" strokeWidth={2} />
      ))}
      {points.map((p) => (
        <text key={`${p.label}-label`} x={p.x} y={h - 4} fontSize="10" textAnchor="middle" fill="#64748b">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export function DonutChart({ data }: { data: DonutSegment[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let offset = 25;
  const radius = 45;
  return (
    <svg width="140" height="140" viewBox="0 0 120 120">
      {data.map((seg) => {
        const pct = (seg.value / total) * 100;
        const circle = (
          <circle
            key={seg.label}
            r={radius}
            cx="60"
            cy="60"
            fill="transparent"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
        offset += pct;
        return circle;
      })}
      <circle r="30" cx="60" cy="60" fill="#fff" />
      <text x="60" y="64" textAnchor="middle" fontSize="12" fill="#0f172a">
        {total}
      </text>
    </svg>
  );
}
