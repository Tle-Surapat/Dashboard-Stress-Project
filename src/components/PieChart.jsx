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
    colors: ["#8FD14F", "#ffd664", "#FA812F", "#FF2929"],
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
