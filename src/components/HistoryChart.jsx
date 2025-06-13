// HistoryChart.jsx
import React, { forwardRef, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function aggregateStressData(flatData) {
  
  if (!flatData || flatData.length === 0) {
    console.log("No data to aggregate");
    return [];
  }

  const map = {};
  flatData.forEach(({ date, level, count }) => {
    if (!map[date]) {
      map[date] = { day: date, normal: 0, low: 0, medium: 0, high: 0 };
    }
    const lvl = level.toLowerCase();
    if (map[date][lvl] !== undefined) {
      map[date][lvl] += count;
    }
  });
  
  const result = Object.values(map).sort((a, b) => new Date(a.day) - new Date(b.day));
  console.log("Aggregated data:", result);
  return result;
}

const HistoryChart = forwardRef(({ data, groupBy = 'day' }, ref) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  console.log("Group by:", groupBy);
  
  const isFlatData = data?.length > 0 && data[0].level !== undefined;
  
  // Use sample data if no data provided
  const rawData = isFlatData ? data : (data?.length === 0);
  const aggregated = aggregateStressData(rawData);

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      const container = ref?.current?.canvas?.parentElement;
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ref]);

  // Format labels based on groupBy option
  const formatLabel = (dateStr, groupBy) => {
    const date = new Date(dateStr);
    switch (groupBy) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'long' 
        });
      default: // day
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          weekday: 'short'
        });
    }
  };

  const chartData = {
    labels: aggregated.map((item) => formatLabel(item.day, groupBy)),
    datasets: [
      {
        label: "Normal",
        data: aggregated.map((item) => item.normal ?? 0),
        backgroundColor: "#4CAF50",
        borderColor: "#388E3C",
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        hoverBackgroundColor: "#66BB6A",
        hoverBorderColor: "#2E7D32",
      },
      {
        label: "Low",
        data: aggregated.map((item) => item.low ?? 0),
        backgroundColor: "#FFEB3B",
        borderColor: "#F57F17",
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        hoverBackgroundColor: "#FFF176",
        hoverBorderColor: "#E65100",
      },
      {
        label: "Medium",
        data: aggregated.map((item) => item.medium ?? 0),
        backgroundColor: "#FF9800",
        borderColor: "#E65100",
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        hoverBackgroundColor: "#FFB74D",
        hoverBorderColor: "#BF360C",
      },
      {
        label: "High",
        data: aggregated.map((item) => item.high ?? 0),
        backgroundColor: "#F44336",
        borderColor: "#C62828",
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        hoverBackgroundColor: "#EF5350",
        hoverBorderColor: "#B71C1C",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 18,
          padding: 16,
          font: {
            size: 13,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
        onClick: function(e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          if (ci.isDatasetVisible(index)) {
            ci.hide(index);
            legendItem.hidden = true;
          } else {
            ci.show(index);
            legendItem.hidden = false;
          }
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#666',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            const total = context.chart.data.datasets
              .reduce((sum, dataset) => sum + (dataset.data[context.dataIndex] || 0), 0);
            const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
            return `${context.dataset.label}: ${context.parsed.y} times (${percentage}%)`;
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex;
            const total = context[0].chart.data.datasets
              .reduce((sum, dataset) => sum + (dataset.data[dataIndex] || 0), 0);
            return [`Total: ${total} times`];
          }
        }
      },
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: groupBy === 'week' ? "Week" : groupBy === 'month' ? "Month" : "Date",
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#333'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 12
          },
          color: '#666'
        },
        grid: {
          display: false,
        },
        // Remove stacked property to create grouped bars
        stacked: false,
      },
      y: {
        title: {
          display: true,
          text: "Count (Times)",
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#333'
        },
        beginAtZero: true,
        grid: {
          color: "#e8e8e8",
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#666',
          stepSize: 1,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        },
        // Remove stacked property to create grouped bars
        stacked: false,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    elements: {
      bar: {
        borderWidth: 1.5,
        borderRadius: 6,
      }
    }
  };

  // Show loading state if no data
  if (!aggregated || aggregated.length === 0) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        border: '2px dashed #d0d0d0',
        minHeight: '300px'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            No Stress History Data
          </h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
            Please check your data connection or select a time period with available data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: "100%", 
      height: "130%",
      minHeight: "350px",
      position: "relative",
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '2px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ height: 'calc(100% - 80px)' }}>
        <Bar 
          ref={ref} 
          data={chartData} 
          options={options}
          height={null}
          width={null}
        />
      </div>
    </div>
  );
});

HistoryChart.displayName = 'HistoryChart';

export default HistoryChart;