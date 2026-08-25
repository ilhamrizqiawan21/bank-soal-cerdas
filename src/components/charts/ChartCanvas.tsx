import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

// Selective registration keeps the bundle lean (no line/radar/pie controllers).
Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip
);

interface ChartCanvasProps {
  config: ChartConfiguration;
  ariaLabel: string;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({ config, ariaLabel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [config]);

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
};
