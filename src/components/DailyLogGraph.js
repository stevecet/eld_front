import React from "react";

const statusOrder = [
  "off_duty",
  "sleeper_berth",
  "driving",
  "on_duty_not_driving",
];

const statusLabels = {
  off_duty: "Off Duty",
  sleeper_berth: "Sleeper",
  driving: "Driving",
  on_duty_not_driving: "On Duty",
};

const statusColors = {
  off_duty: "#60a5fa", // blue
  sleeper_berth: "#a78bfa", // purple
  driving: "#f87171", // red
  on_duty_not_driving: "#fbbf24", // amber
};

function timeToX(timeStr, width) {
  const [h, m] = timeStr.split(":").map(Number);
  const decimal = h + m / 60;
  return (decimal / 24) * width;
}

export default function DailyLogGraph({ dayLog, width = 800, height = 200 }) {
  const rowHeight = height / statusOrder.length;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height + 30}>
        {/* X-axis hours */}
        {[...Array(25).keys()].map((h) => (
          <g key={h}>
            <line
              x1={(h / 24) * width}
              y1={0}
              x2={(h / 24) * width}
              y2={height}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={(h / 24) * width}
              y={height + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#4b5563"
            >
              {h}
            </text>
          </g>
        ))}

        {/* Y-axis rows */}
        {(statusOrder || []).map((status, i) => (
          <g key={status}>
            <line
              x1={0}
              y1={i * rowHeight}
              x2={width}
              y2={i * rowHeight}
              stroke="#d1d5db"
            />
            <text
              x={-5}
              y={i * rowHeight + rowHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="#374151"
            >
              {statusLabels[status]}
            </text>
          </g>
        ))}

        {/* Entries */}
        {(dayLog.entries || []).map((entry, idx) => {
          const y = statusOrder.indexOf(entry.duty_status) * rowHeight + 5;
          const x1 = timeToX(entry.start_time, width);
          const x2 = timeToX(entry.end_time, width);
          const barWidth = Math.max(x2 - x1, 2);

          return (
            <rect
              key={idx}
              x={x1}
              y={y}
              width={barWidth}
              height={rowHeight - 10}
              fill={statusColors[entry.duty_status]}
              rx={3}
            >
              <title>{`${entry.start_time} - ${entry.end_time} ${entry.remarks}`}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}
