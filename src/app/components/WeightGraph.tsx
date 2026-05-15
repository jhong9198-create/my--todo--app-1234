"use client";

interface WeightPoint {
  date: string;
  weight_kg: number;
}

interface Props {
  data: WeightPoint[];
}

export default function WeightGraph({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-stone-400 dark:text-stone-500">
        <span className="text-3xl mb-2">⚖️</span>
        <p className="text-sm">체중을 기록하면 그래프가 표시됩니다</p>
        <p className="text-xs mt-1">매일 아침 공복 측정값을 입력해보세요</p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            {data[0].weight_kg} kg
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {formatDate(data[0].date)} 기록
          </p>
          <p className="text-xs text-stone-400 mt-2">2일 이상 기록하면 그래프가 표시됩니다</p>
        </div>
      </div>
    );
  }

  const W = 560;
  const H = 140;
  const padX = 44;
  const padY = 24;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const weights = data.map((d) => d.weight_kg);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const range = rawMax - rawMin || 1;
  const minW = rawMin - range * 0.2;
  const maxW = rawMax + range * 0.2;
  const wRange = maxW - minW;

  const toX = (i: number) => padX + (i / (data.length - 1)) * chartW;
  const toY = (w: number) => padY + ((maxW - w) / wRange) * chartH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.weight_kg), ...d }));

  // SVG polyline points string
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
  // Area polygon (close at bottom)
  const areaPoints = [
    `${pts[0].x},${padY + chartH}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${padY + chartH}`,
  ].join(" ");

  // Y-axis gridlines (3 lines)
  const yGridValues = [rawMin, (rawMin + rawMax) / 2, rawMax];

  // X-axis label interval
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  // Latest weight vs first
  const diff = data[data.length - 1].weight_kg - data[0].weight_kg;
  const diffStr = diff === 0 ? "변화 없음" : diff > 0 ? `+${diff.toFixed(1)}kg` : `${diff.toFixed(1)}kg`;
  const diffColor = diff < 0 ? "text-green-600 dark:text-green-400" : diff > 0 ? "text-red-500" : "text-stone-500";

  return (
    <div className="space-y-2">
      {/* 요약 통계 */}
      <div className="flex items-center justify-between px-1 mb-1">
        <div>
          <span className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {data[data.length - 1].weight_kg}
          </span>
          <span className="text-sm text-stone-400 ml-1">kg</span>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${diffColor}`}>{diffStr}</p>
          <p className="text-xs text-stone-400">{data.length}일 기록</p>
        </div>
      </div>

      {/* SVG 그래프 */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        aria-label="체중 변화 그래프"
      >
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 배경 그리드 */}
        {yGridValues.map((val, i) => {
          const y = toY(val);
          return (
            <g key={i}>
              <line
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke="#e7e5e2"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x={padX - 4}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#a8a29e"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* 면적 */}
        <polygon points={areaPoints} fill="url(#weightGrad)" />

        {/* 선 */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 데이터 포인트 */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? 5 : 3}
                fill={isLast ? "#16a34a" : "#4ade80"}
                stroke="white"
                strokeWidth="1.5"
              />
              {/* 최초·최신 라벨 */}
              {(i === 0 || isLast || data.length <= 7) && (
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={isLast ? "bold" : "normal"}
                  fill={isLast ? "#15803d" : "#78716c"}
                >
                  {p.weight_kg}
                </text>
              )}
            </g>
          );
        })}

        {/* X축 날짜 라벨 */}
        {pts
          .filter((_, i) => i % labelEvery === 0 || i === pts.length - 1)
          .map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#a8a29e"
            >
              {p.date.slice(5).replace("-", "/")}
            </text>
          ))}
      </svg>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}
