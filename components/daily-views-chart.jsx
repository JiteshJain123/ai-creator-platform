"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const DailyViewsChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="space-y-3 w-full px-2">
          {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-slate-700/60 animate-pulse"
              style={{ width: `${h}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No view data yet — publish your first post!</p>
      </div>
    );
  }

  const getGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "rgba(139, 92, 246, 0.35)");
    gradient.addColorStop(0.6, "rgba(59, 130, 246, 0.10)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    return gradient;
  };

  const chartData = {
    labels: data.map((item) => item.day),
    datasets: [
      {
        data: data.map((item) => item.views),
        borderColor: "#8b5cf6",
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          if (!chart.ctx) return "transparent";
          return getGradient(chart.ctx);
        },
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#1e293b",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#c4b5fd",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(139, 92, 246, 0.4)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (items) => `Day: ${items[0].label}`,
          label: (item) => ` ${item.raw.toLocaleString()} views`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(71, 85, 105, 0.2)", drawBorder: false },
        ticks: { color: "#64748b", font: { size: 11 } },
        border: { dash: [4, 4] },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(71, 85, 105, 0.2)", drawBorder: false },
        ticks: { color: "#64748b", font: { size: 11 } },
        border: { dash: [4, 4] },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DailyViewsChart;
