import React from "react";
import ReactApexChart from "react-apexcharts";

const PieChart = ({ data }) => {
  const chartOptions = {
    chart: {
      type: "pie",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    labels: ["Normal", "Low", "Medium", "High"],
    colors: ["#4CAF50", "#FFC107", "#FF9800", "#F44336"],
    legend: {
      position: "bottom",
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      labels: {
        useSeriesColors: true,
      },
    },
  };

  const chartSeries = [data.normal, data.low, data.medium, data.high];

  return (
    <ReactApexChart
      options={chartOptions}
      series={chartSeries}
      type="pie"
      height={350}
    />
  );
};

export default PieChart;
