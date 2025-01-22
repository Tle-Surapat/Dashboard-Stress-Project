"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const EDAChart = ({ edaData, loading }) => {
  // Calculate min and max dynamically from edaData
  const dataValues = edaData.map((item) => item.value);
  const minValue = Math.min(...dataValues);
  const maxValue = Math.max(...dataValues);

  const chartData = {
    labels: edaData.map((item) => item.time),
    datasets: [
      {
        label: "Signal",
        data: dataValues,
        borderColor: "teal",
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        title: { display: true, text: "Time" },
      },
      y: {
        title: { display: true, text: "Value" },
        min: minValue - (0.1 * Math.abs(minValue)), // Add padding below the min value
        max: maxValue + (0.1 * Math.abs(maxValue)), // Add padding above the max value
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Value: ${context.raw}`,
        },
      },
    },
  };

  return loading ? (
    <p className="text-center text-gray-500">Loading data...</p>
  ) : (
    <Line data={chartData} options={options} />
  );
};

export default EDAChart;
