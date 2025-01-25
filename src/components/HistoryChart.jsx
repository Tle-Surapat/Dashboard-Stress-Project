import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HistoryChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.day),
    datasets: [
      {
        label: "Normal",
        data: data.map((item) => item.normal),
        backgroundColor: "green",
      },
      {
        label: "Low",
        data: data.map((item) => item.low),
        backgroundColor: "yellow",
      },
      {
        label: "Medium",
        data: data.map((item) => item.medium),
        backgroundColor: "orange",
      },
      {
        label: "High",
        data: data.map((item) => item.high),
        backgroundColor: "red",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Stress Levels by Day" },
    },
    scales: {
      x: { title: { display: true, text: "Day" } },
      y: { title: { display: true, text: "Count" } },
    },
  };

  return <Bar data={chartData} options={options} />;
}
