import React from 'react';

interface TemperatureHistoryGraphProps {
  temperatures: { time: Date; value: number }[];
  minTemp: number;
  maxTemp: number;
  unit: string;
}

const TemperatureHistoryGraph: React.FC<TemperatureHistoryGraphProps> = ({
  temperatures,
  minTemp,
  maxTemp,
  unit
}) => {
  // Use container's full width and maintain aspect ratio
  const aspectRatio = 16 / 9; // You can adjust this (e.g., 2/1 for wider graphs)
  const padding = 40;
  
  // Convert time to x position (assuming 24-hour period)
  const timeToX = (date: Date, graphWidth: number) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return padding + (totalMinutes / 1440) * (graphWidth - 2 * padding);
  };

  // Convert temperature to y position
  const tempToY = (temp: number, graphHeight: number) => {
    const tempRange = maxTemp - minTemp;
    return padding + (graphHeight - 2 * padding) - ((temp - minTemp) / tempRange) * (graphHeight - 2 * padding);
  };

  // Generate path for temperature line
  const generatePath = (width: number, height: number) => {
    if (temperatures.length === 0) return '';

    let path = `M ${timeToX(temperatures[0].time, width)} ${tempToY(temperatures[0].value, height)}`;
    
    for (let i = 1; i < temperatures.length; i++) {
      path += ` L ${timeToX(temperatures[i].time, width)} ${tempToY(temperatures[i].value, height)}`;
    }
    
    return path;
  };

  // Generate time labels (every 2 hours)
  const generateTimeLabels = (graphWidth: number) => {
    const labels = [];
    for (let i = 0; i <= 24; i += 2) {
      const hour = (6 + i) % 24; // Starting at 6:00 like your CycleGraph
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      labels.push({
        x: padding + (i * 60 / 1440) * (graphWidth - 2 * padding),
        label: timeString
      });
    }
    return labels;
  };

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      <h4 className="text-sm font-medium mb-4 text-center">Temperature History (Last 24 Hours)</h4>
      <div className="w-full" style={{ aspectRatio: aspectRatio }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${800} ${800 / aspectRatio}`} 
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto"
        >
          {/* Grid lines */}
          {({ width: 800, height: 800 / aspectRatio }).width && generateTimeLabels(800).map((label, index) => (
            <line
              key={`time-${index}`}
              x1={label.x}
              y1={padding}
              x2={label.x}
              y2={800 / aspectRatio - padding}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray={index % 12 === 0 ? "none" : "2,2"}
            />
          ))}

          {/* Temperature grid lines */}
          {Array.from({ length: Math.ceil((maxTemp - minTemp) / 5) + 1 }).map((_, i) => {
            const temp = minTemp + i * 5;
            return (
              <g key={`temp-${temp}`}>
                <line
                  x1={padding}
                  y1={tempToY(temp, 800 / aspectRatio)}
                  x2={800 - padding}
                  y2={tempToY(temp, 800 / aspectRatio)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 5}
                  y={tempToY(temp, 800 / aspectRatio)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {temp}°C
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={800 / aspectRatio - padding}
            stroke="#374151"
            strokeWidth={2}
          />
          <line
            x1={padding}
            y1={800 / aspectRatio - padding}
            x2={800 - padding}
            y2={800 / aspectRatio - padding}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Temperature line */}
          <path
            d={generatePath(800, 800 / aspectRatio)}
            stroke="#3b82f6"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />

          {/* Current temperature indicator */}
          {temperatures.length > 0 && (
            <>
              <circle
                cx={timeToX(temperatures[temperatures.length - 1].time, 800)}
                cy={tempToY(temperatures[temperatures.length - 1].value, 800 / aspectRatio)}
                r={5}
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={timeToX(temperatures[temperatures.length - 1].time, 800) + 10}
                y={tempToY(temperatures[temperatures.length - 1].value, 800 / aspectRatio) - 10}
                className="text-xs fill-foreground font-medium"
              >
                {temperatures[temperatures.length - 1].value.toFixed(1)}{unit}
              </text>
            </>
          )}

          {/* Time labels */}
          {generateTimeLabels(800).map((label, index) => (
            <text
              key={`label-${index}`}
              x={label.x}
              y={800 / aspectRatio - padding + 20}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {label.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default TemperatureHistoryGraph;