import React, { useMemo } from 'react';

interface CycleGraphProps {
  freezingTime: number; // minutes
  defrostTime: number; // minutes
  targetTempFreezing: number;
  targetTempDefrost: number;
  currentTime: number; // current time in minutes from 6:00
  currentTemp: number;
  currentMode: 'freezing' | 'defrost' | 'idle';
}

const CycleGraph: React.FC<CycleGraphProps> = ({
  freezingTime,
  defrostTime,
  targetTempFreezing,
  targetTempDefrost,
  currentTime,
  currentTemp,
  currentMode
}) => {
  const width = 800;
  const height = 300;
  const padding = 40;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  // Generate cycles for 24 hours (1440 minutes)
  const cycles = useMemo(() => {
    const totalCycleTime = freezingTime + defrostTime;
    const cycleData = [];
    let currentMinute = 0;

    while (currentMinute < 1440) { // 24 hours
      // Freezing period
      const freezingEnd = Math.min(currentMinute + freezingTime, 1440);
      cycleData.push({
        start: currentMinute,
        end: freezingEnd,
        mode: 'freezing',
        temp: targetTempFreezing
      });
      
      currentMinute = freezingEnd;
      
      if (currentMinute >= 1440) break;
      
      // Defrost period
      const defrostEnd = Math.min(currentMinute + defrostTime, 1440);
      cycleData.push({
        start: currentMinute,
        end: defrostEnd,
        mode: 'defrost',
        temp: targetTempDefrost
      });
      
      currentMinute = defrostEnd;
    }

    return cycleData;
  }, [freezingTime, defrostTime, targetTempFreezing, targetTempDefrost]);

  // Convert time to x position
  const timeToX = (minutes: number) => padding + (minutes / 1440) * graphWidth;
  
  // Convert temperature to y position
  const tempToY = (temp: number) => {
    const minTemp = Math.min(targetTempFreezing, targetTempDefrost) - 5;
    const maxTemp = Math.max(targetTempFreezing, targetTempDefrost) + 5;
    const tempRange = maxTemp - minTemp;
    return padding + graphHeight - ((temp - minTemp) / tempRange) * graphHeight;
  };

  // Generate target temperature line path
  const targetTempPath = useMemo(() => {
    let path = '';
    cycles.forEach((cycle, index) => {
      const startX = timeToX(cycle.start);
      const endX = timeToX(cycle.end);
      const y = tempToY(cycle.temp);
      
      if (index === 0) {
        path += `M ${startX} ${y}`;
      } else {
        path += ` L ${startX} ${y}`;
      }
      path += ` L ${endX} ${y}`;
    });
    return path;
  }, [cycles]);

  // Generate time labels (every 2 hours)
  const timeLabels = [];
  for (let i = 0; i <= 24; i += 2) {
    const minutes = i * 60;
    const hour = (6 + i) % 24;
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    timeLabels.push({
      x: timeToX(minutes),
      label: timeString
    });
  }

  // Current position
  const currentX = timeToX(currentTime);
  const currentY = tempToY(currentTemp);

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      <h4 className="text-sm font-medium mb-4 text-center">24-Hour Temperature Cycle (06:00 - 06:00)</h4>
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Background regions for modes */}
          {cycles.map((cycle, index) => (
            <rect
              key={index}
              x={timeToX(cycle.start)}
              y={padding}
              width={timeToX(cycle.end) - timeToX(cycle.start)}
              height={graphHeight}
              fill={cycle.mode === 'freezing' ? '#3b82f6' : '#ec4899'}
              fillOpacity={0.1}
            />
          ))}

          {/* Grid lines */}
          {timeLabels.map((label, index) => (
            <line
              key={index}
              x1={label.x}
              y1={padding}
              x2={label.x}
              y2={padding + graphHeight}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray={index % 12 === 0 ? "none" : "2,2"}
            />
          ))}

          {/* Temperature grid lines */}
          {[-30, -20, -10, 0, 10, 20].map((temp) => (
            <g key={temp}>
              <line
                x1={padding}
                y1={tempToY(temp)}
                x2={padding + graphWidth}
                y2={tempToY(temp)}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
              <text
                x={padding - 5}
                y={tempToY(temp)}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {temp}°C
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + graphHeight}
            stroke="#374151"
            strokeWidth={2}
          />
          <line
            x1={padding}
            y1={padding + graphHeight}
            x2={padding + graphWidth}
            y2={padding + graphHeight}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Target temperature line */}
          <path
            d={targetTempPath}
            stroke="#10b981"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current temperature line (simplified as horizontal line at current temp) */}
          <line
            x1={padding}
            y1={currentY}
            x2={padding + graphWidth}
            y2={currentY}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5,5"
          />

          {/* Current time indicator */}
          <line
            x1={currentX}
            y1={padding}
            x2={currentX}
            y2={padding + graphHeight}
            stroke="#dc2626"
            strokeWidth={3}
          />
          
          {/* Current position dot */}
          <circle
            cx={currentX}
            cy={currentY}
            r={6}
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth={2}
          />

          {/* Time labels */}
          {timeLabels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={padding + graphHeight + 20}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {label.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 opacity-20 rounded"></div>
          <span>Freezing Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-500 opacity-20 rounded"></div>
          <span>Defrost Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded"></div>
          <span>Target Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-amber-500 rounded border-dashed border border-amber-500"></div>
          <span>Current Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-red-600 rounded"></div>
          <span>Current Time</span>
        </div>
      </div>
    </div>
  );
};

export default CycleGraph;