// components/StressReportPage.jsx
"use client";

import React, { useEffect, useState, useRef, Suspense }  from "react";
import dynamic from "next/dynamic";
import useDeepCompareEffect from 'use-deep-compare-effect';
import { exportPDFReport } from "@/lib/exportPDFReport";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Activity, AlertCircle, Calendar, TrendingUp } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { toast } from 'react-hot-toast';
import HistoryChart from "@/components/HistoryChart.jsx";
import EditProfileModal from "@/components/EditProfileModal";
import { useRouter } from 'next/navigation';

const SignalChart = dynamic(() => import("@/components/Chart"), { ssr: false });

// Enhanced crash storage utilities with device separation
const CRASH_STORAGE_KEY = 'stress_prediction_history';
const HR_BUFFER_STORAGE_KEY = 'hr_buffer_data';
const CRASH_RETENTION_DAYS = 14;
const MAX_SIGNAL_POINTS = 60; // Maximum points to show in signal chart
const MAX_HR_BUFFER_SIZE = 300; // Keep 5 minutes of HR data (300 seconds)

// Generate mock data for demonstration (June 7-14, 2025)
const generateMockData = (deviceId) => {
  const mockData = [];
  const startDate = new Date('2025-06-07');
  const endDate = new Date('2025-06-14');
  const stressLevels = ['normal', 'low', 'medium', 'high'];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Generate 3-8 predictions per day
    const predictionsPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < predictionsPerDay; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const timestamp = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute);
      
      // Weight the stress levels (more normal, less high)
      const weights = [0.5, 0.3, 0.15, 0.05];
      let random = Math.random();
      let stressLevel = 'normal';
      
      for (let j = 0; j < weights.length; j++) {
        if (random < weights.slice(0, j + 1).reduce((a, b) => a + b, 0)) {
          stressLevel = stressLevels[j];
          break;
        }
      }
      
      mockData.push({
        timestamp: timestamp.toISOString(),
        prediction: stressLevel,
        bmi: (Math.random() * 10 + 18).toFixed(1), // Random BMI between 18-28
        deviceId: deviceId
      });
    }
  }
  
  return mockData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Enhanced cache management functions
const STRESS_COUNTS_STORAGE_KEY = 'stress_counts_data';

const saveToCrashStorage = (data, deviceId) => {
  try {
    if (deviceId === 'Emotibit-001') {
      console.log('Mock data for Emotibit-001 - not saving to storage');
      return;
    }
   
    // Get existing data from cache
    const existingData = JSON.parse(localStorage.getItem(CRASH_STORAGE_KEY) || '{}');
   
    // Update data for specific device
    existingData[deviceId] = data;
   
    // Clean old data (older than retention days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CRASH_RETENTION_DAYS);
   
    Object.keys(existingData).forEach(deviceKey => {
      if (Array.isArray(existingData[deviceKey])) {
        existingData[deviceKey] = existingData[deviceKey].filter(item =>
          new Date(item.timestamp) > cutoffDate
        );
      }
    });
   
    localStorage.setItem(CRASH_STORAGE_KEY, JSON.stringify(existingData));
    
    // Also save stress level counts
    saveStressLevelCounts(data, deviceId);
    
    console.log(`Data saved for device: ${deviceId}, total items: ${data.length}`);
  } catch (error) {
    console.error('Failed to save to crash storage:', error);
  }
};

const loadFromCrashStorage = (deviceId) => {
  try {
    // Generate mock data only for Emotibit-001
    if (deviceId === 'Emotibit-001') {
      return generateMockData(deviceId);
    }
   
    const existingData = JSON.parse(localStorage.getItem(CRASH_STORAGE_KEY) || '{}');
    return existingData[deviceId] || [];
  } catch (error) {
    console.error('Failed to load from crash storage:', error);
    return [];
  }
};

const clearDeviceData = (deviceId) => {
  try {
    if (deviceId === 'Emotibit-001') {
      console.log('Cannot clear mock data for Emotibit-001');
      return;
    }
   
    const existingData = JSON.parse(localStorage.getItem(CRASH_STORAGE_KEY) || '{}');
    delete existingData[deviceId];
    localStorage.setItem(CRASH_STORAGE_KEY, JSON.stringify(existingData));
   
    // Also clear HR buffer data
    const hrBufferData = JSON.parse(localStorage.getItem(HR_BUFFER_STORAGE_KEY) || '{}');
    delete hrBufferData[deviceId];
    localStorage.setItem(HR_BUFFER_STORAGE_KEY, JSON.stringify(hrBufferData));
    
    // Also clear stress counts data
    const stressCountsData = JSON.parse(localStorage.getItem(STRESS_COUNTS_STORAGE_KEY) || '{}');
    delete stressCountsData[deviceId];
    localStorage.setItem(STRESS_COUNTS_STORAGE_KEY, JSON.stringify(stressCountsData));
   
    console.log(`Data cleared for device: ${deviceId}`);
  } catch (error) {
    console.error('Failed to clear device data:', error);
  }
};

// HR Buffer management functions
const saveHRToBuffer = (hrValue, deviceId) => {
  try {
    const hrBufferData = JSON.parse(localStorage.getItem(HR_BUFFER_STORAGE_KEY) || '{}');
   
    if (!hrBufferData[deviceId]) {
      hrBufferData[deviceId] = [];
    }
   
    const timestamp = new Date();
    hrBufferData[deviceId].push({
      value: hrValue,
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    });
   
    // Keep only recent data (last 5 minutes)
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - 5);
   
    hrBufferData[deviceId] = hrBufferData[deviceId]
      .filter(item => new Date(item.timestamp) > cutoffTime)
      .slice(-MAX_HR_BUFFER_SIZE);
   
    localStorage.setItem(HR_BUFFER_STORAGE_KEY, JSON.stringify(hrBufferData));
   
    return hrBufferData[deviceId];
  } catch (error) {
    console.error('Failed to save HR to buffer:', error);
    return [];
  }
};

const loadHRFromBuffer = (deviceId) => {
  try {
    const hrBufferData = JSON.parse(localStorage.getItem(HR_BUFFER_STORAGE_KEY) || '{}');
    return hrBufferData[deviceId] || [];
  } catch (error) {
    console.error('Failed to load HR from buffer:', error);
    return [];
  }
};

// New stress level counts management functions
const saveStressLevelCounts = (data, deviceId) => {
  try {
    if (deviceId === 'Emotibit-001') {
      console.log('Mock data for Emotibit-001 - not saving stress counts');
      return;
    }

    // Get existing stress counts data
    const stressCountsData = JSON.parse(localStorage.getItem(STRESS_COUNTS_STORAGE_KEY) || '{}');
    
    if (!stressCountsData[deviceId]) {
      stressCountsData[deviceId] = [];
    }

    // Group data by date and count stress levels
    const dailyCounts = {};
    
    data.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const stressLevel = item.prediction?.toLowerCase() || 'unknown';
      
      if (!dailyCounts[date]) {
        dailyCounts[date] = { normal: 0, low: 0, medium: 0, high: 0 };
      }
      
      if (['normal', 'low', 'medium', 'high'].includes(stressLevel)) {
        dailyCounts[date][stressLevel]++;
      }
    });

    // Convert to array format with individual entries for each level
    const newCountsArray = [];
    Object.keys(dailyCounts).forEach(date => {
      const counts = dailyCounts[date];
      
      // Add entry for each stress level that has count > 0
      Object.keys(counts).forEach(level => {
        if (counts[level] > 0) {
          newCountsArray.push({
            date: date,
            level: level,
            count: counts[level],
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Merge with existing data, avoiding duplicates for the same date/level
    const existingCounts = stressCountsData[deviceId];
    
    // Remove existing entries for dates we're updating
    const updatedDates = Object.keys(dailyCounts);
    const filteredExisting = existingCounts.filter(item => 
      !updatedDates.includes(item.date)
    );
    
    // Combine filtered existing data with new data
    stressCountsData[deviceId] = [...filteredExisting, ...newCountsArray];
    
    // Clean old data (older than retention days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CRASH_RETENTION_DAYS);
    
    stressCountsData[deviceId] = stressCountsData[deviceId].filter(item =>
      new Date(item.date) >= cutoffDate
    );
    
    // Sort by date
    stressCountsData[deviceId].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem(STRESS_COUNTS_STORAGE_KEY, JSON.stringify(stressCountsData));
    
    console.log(`Stress counts saved for device: ${deviceId}`, {
      totalEntries: stressCountsData[deviceId].length,
      datesUpdated: updatedDates.length
    });
    
  } catch (error) {
    console.error('Failed to save stress level counts:', error);
  }
};

const loadStressLevelCounts = (deviceId) => {
  try {
    // Generate mock stress counts for Emotibit-001
    if (deviceId === 'Emotibit-001') {
      return generateMockStressCounts();
    }
    
    const stressCountsData = JSON.parse(localStorage.getItem(STRESS_COUNTS_STORAGE_KEY) || '{}');
    return stressCountsData[deviceId] || [];
  } catch (error) {
    console.error('Failed to load stress level counts:', error);
    return [];
  }
};

// Generate mock stress counts for testing
const generateMockStressCounts = () => {
  const mockData = [];
  const today = new Date();
  
  // Generate data for last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-CA');
    
    // Random counts for each stress level
    const levels = ['normal', 'low', 'medium', 'high'];
    levels.forEach(level => {
      const count = Math.floor(Math.random() * 10) + 1; // 1-10 random count
      mockData.push({
        date: dateStr,
        level: level,
        count: count,
        timestamp: new Date().toISOString()
      });
    });
  }
  
  return mockData;
};

// Updated countStressLevels function to work with current data
function countStressLevels(data) {
  const counts = { normal: 0, low: 0, medium: 0, high: 0 };
  data.forEach((item) => {
    const stressLevel = item.prediction?.toLowerCase();
    if (stressLevel === 'normal') counts.normal++;
    else if (stressLevel === 'low') counts.low++;
    else if (stressLevel === 'medium') counts.medium++;
    else if (stressLevel === 'high') counts.high++;
  });
  
  const total = counts.normal + counts.low + counts.medium + counts.high;
  const percentages = {
    normal: total ? ((counts.normal / total) * 100).toFixed(1) : 0,
    low: total ? ((counts.low / total) * 100).toFixed(1) : 0,
    medium: total ? ((counts.medium / total) * 100).toFixed(1) : 0,
    high: total ? ((counts.high / total) * 100).toFixed(1) : 0,
  };
  
  return { counts, percentages };
}

// Helper function to get stress counts for chart
const getStressCountsForChart = (deviceId, days = 7) => {
  try {
    const allCounts = loadStressLevelCounts(deviceId);
    
    // Filter for recent days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentCounts = allCounts.filter(item => 
      new Date(item.date) >= cutoffDate
    );
    
    console.log(`Stress counts for chart (${deviceId}):`, recentCounts);
    return recentCounts;
  } catch (error) {
    console.error('Failed to get stress counts for chart:', error);
    return [];
  }
};

const getStressLevelColor = (level) => {
  switch (level?.toLowerCase()) {
    case "normal":
      return { backgroundColor: "#4ade80", color: "white" }; // green-400
    case "low":
      return { backgroundColor: "#facc15", color: "white" }; // yellow-400
    case "medium":
      return { backgroundColor: "#fb923c", color: "white" }; // orange-400
    case "high":
      return { backgroundColor: "#ef4444", color: "white" }; // red-500
    default:
      return { backgroundColor: "#4ade80", color: "white" }; // green-400
  }
};

const getStressLevelBgColor = (level) => {
  switch (level?.toLowerCase()) {
    case "normal":
      return "bg-green-100 text-green-800";
    case "low":
      return "bg-yellow-100 text-yellow-800";
    case "medium":
      return "bg-orange-100 text-orange-800";
    case "high":
      return "bg-red-100 text-red-800";
    default:
      return "bg-green-100 text-green-800";
  }
};

const getStressAdvice = (level) => {
  switch (level?.toLowerCase()) {
    case "normal":
    case "low":
      return `📈 Benefit of Low Stress:
    Low to moderate stress can enhance brain function, build resilience, and even protect against depression and antisocial behavior.

🧘 Recommended Strategies:
  - Maintain a healthy lifestyle: regular exercise, balanced diet, and sufficient sleep.
  - Practice mindfulness or meditation: even brief daily sessions can improve mood.
  - Engage in hobbies and activities you enjoy.
  - Foster social connections for emotional support.
  - Spend time in green spaces to reduce stress and elevate mood.
      `;
    
    case "medium":
      return `⚠️ Risks:
    Persistent medium stress may increase risk for cardiovascular disease and chronic health issues.

🛠️ Recommended Strategies:
  - Try structured stress management: mindfulness programs, relaxation techniques, or mind-body therapies.
  - Practice breathwork like "cyclic sighing" or box breathing for fast stress relief.
  - Consider CBT or group mindfulness therapy—both effective in reducing anxiety and stress.
  - Improve time management, set boundaries, and try journaling to manage your stress load.
      `;

    case "high":
      return `🚨 Your stress level is high.

💥 Risks:
    Chronic high stress accelerates immune aging, increases mortality risk (e.g., heart disease, cancer), and severely impacts mental and physical health.

🧩 Recommended Strategies:
  - Seek professional support: CBT, mindfulness-based stress reduction, or relaxation training are highly effective.
  - Prioritize self-care: ensure regular sleep, nutritious diet, exercise, and relaxation.
  - Minimize exposure to stressors and reduce non-essential obligations.
  - Use immediate calming tools like deep breathing and grounding during acute stress.
  - Strengthen your social support system to buffer against chronic stress effects.
  - If work-related stress is a major factor, consider structured group programs to foster resilience and reduce perceived stress.
      `;

    default:
      return `Your stress level could not be determined.

🧭 **General Guidance**:
Continue monitoring your stress. Adopt daily self-care routines and seek support if you notice persistent emotional or physical stress signs.
      `;
  }
};


// Function to aggregate prediction history by time period
const aggregatePredictionHistory = (predictions, timeframe, dateRange = null) => {
  if (!predictions || predictions.length === 0) return [];
  
  let filteredPredictions = predictions;
  
  // Filter by date range if provided
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    filteredPredictions = predictions.filter(prediction => {
      const predDate = new Date(prediction.timestamp);
      return predDate >= dateRange.startDate && predDate <= dateRange.endDate;
    });
  }
  
  const grouped = {};
 
  filteredPredictions.forEach(prediction => {
    const date = new Date(prediction.timestamp);
    let key;
   
    switch (timeframe) {
      case 'hourly':
        key = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'daily':
        key = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        break;
      default:
        key = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    }
   
    if (!grouped[key]) {
      grouped[key] = { normal: 0, low: 0, medium: 0, high: 0 };
    }
   
    const stressLevel = prediction.prediction?.toLowerCase() || 'normal';
    if (grouped[key][stressLevel] !== undefined) {
      grouped[key][stressLevel]++;
    }
  });
  
  return Object.entries(grouped).map(([date, counts]) => ({
    date,
    ...counts
  })).sort((a, b) => {
    // Sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
};

export default function DetailPage({ searchParams }) {
  const deviceId = searchParams?.device_id;
  const router = useRouter();
  const [stressPrediction, setStressPrediction] = useState("normal");
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [personalData, setPersonalData] = useState({});
  const [sensorData, setSensorData] = useState({});
  const [edaData, setEdaData] = useState([]);
  const [ppgData, setPpgData] = useState([]);
  const [hrData, setHrData] = useState([]);
  const [hrBuffer, setHrBuffer] = useState([]); // New state for HR buffer
  const [currentHR, setCurrentHR] = useState(0); // Current HR value display
  const [skintemp, setSkintemp] = useState(null);
  const [stressCountsData, setStressCountsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [timeframe, setTimeframe] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date('2025-06-07'),
    endDate: new Date('2025-06-14')
  });
  const [aggregatedChartData, setAggregatedChartData] = useState([]);
  const [counts, setCounts] = useState({ normal: 0, low: 0, medium: 0, high: 0 });
  const [percentages, setPercentages] = useState({ normal: 0, low: 0, medium: 0, high: 0 });
  const [range, setRange] = useState([
    {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const previousStressLevelRef = useRef(null);
  const edaRef = useRef(null);
  const hrRef = useRef(null);
  const hrBufferRef = useRef([]);
  const historyChartRef = useRef(null);
  const predictionIntervalRef = useRef(null);
  const personalDataRef = useRef(personalData);

  // Load prediction history and HR buffer from cache on component mount
  useEffect(() => {
    if (!deviceId) return;
    
    const storedHistory = loadFromCrashStorage(deviceId);
    const storedHRBuffer = loadHRFromBuffer(deviceId);
    
    setPredictionHistory(storedHistory);
    setHrBuffer(storedHRBuffer);
    hrBufferRef.current = storedHRBuffer;
    
    // Set current HR from buffer if available
    if (storedHRBuffer.length > 0) {
      setCurrentHR(storedHRBuffer[storedHRBuffer.length - 1].value);
    }
    
    const { counts: newCounts, percentages: newPercentages } = countStressLevels(storedHistory);
    setCounts(newCounts);
    setPercentages(newPercentages);

    console.log("Loaded prediction history:", storedHistory);
    
    const chartData = aggregatePredictionHistory(
      storedHistory, 
      timeframe, 
      timeframe === 'custom' ? dateRange : null
    );
    setAggregatedChartData(chartData);
  }, [deviceId]);

  // Update counts and chart data when prediction history or timeframe changes
  useEffect(() => {
    const { counts: newCounts, percentages: newPercentages } = countStressLevels(predictionHistory);
    setCounts(newCounts);
    setPercentages(newPercentages);
    
    const chartData = aggregatePredictionHistory(
      predictionHistory, 
      timeframe, 
      timeframe === 'custom' ? dateRange : null
    );
    setAggregatedChartData(chartData);
    
    // Save to cache whenever prediction history changes
    if (predictionHistory.length > 0) {
      saveToCrashStorage(predictionHistory, deviceId);
    }
  }, [predictionHistory, timeframe, dateRange, deviceId]);

  // useEffect แยกสำหรับโหลด stress counts
  useEffect(() => {
    if (!deviceId) return;

    const loadStressCounts = () => {
      const stressCountsForChart = getStressCountsForChart(deviceId, 7);
      setStressCountsData(stressCountsForChart);
      console.log("Loaded stress counts:", stressCountsForChart);
    };

    loadStressCounts();
    
    // อัพเดททุก 30 วินาที (ไม่ต้องบ่อยเหมือน sensor data)
    const interval = setInterval(loadStressCounts, 30000);
    
    return () => clearInterval(interval);
  }, [deviceId]);

  const handleSave = (updatedData) => {
    setPersonalData(updatedData);
    toast.success("Profile updated");
  };

  const handleClearDevice = () => {
    if (deviceId === 'Emotibit-001') {
      alert('Cannot clear mock data for Emotibit-001. This is demonstration data.');
      return;
    }
    
    clearDeviceData(deviceId);
    setPredictionHistory([]);
    setHrBuffer([]);
    hrBufferRef.current = [];
    setCurrentHR(0);
    setCounts({ normal: 0, low: 0, medium: 0, high: 0 });
    setPercentages({ normal: 0, low: 0, medium: 0, high: 0 });
    setAggregatedChartData([]);
    toast.success("Device data cleared successfully");
  };

  // Function to perform stress prediction
  const performStressPrediction = async (personalData, deviceId, signal) => {
    try {
      if (!personalData.weight || !personalData.height) {
        console.warn("Missing weight or height data for BMI calculation");
        return;
      }

      const heightInMeters = personalData.height / 100;
      const bmi = personalData.weight / (heightInMeters * heightInMeters);

      const payload = {
        deviceId: personalData.device_id || deviceId,
        gender: personalData.gender?.toLowerCase() || "",
        bmi: parseFloat(bmi.toFixed(2)),
        sleep: personalData.timeToSleep || null,
        skinType: personalData.skinType || "",
      };

      console.log("Sending prediction payload:", payload);

      const fastUrl = process.env.NEXT_PUBLIC_FASTAPI;
      const predictionRes = await fetch(`${fastUrl}predict/predict-lstm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!predictionRes.ok) {
        throw new Error(`HTTP error! status: ${predictionRes.status}`);
      }

      const predictionJson = await predictionRes.json();
      console.log("Prediction response:", predictionJson);
      const newPrediction = predictionJson.predicted_label?.toLowerCase();

      if (predictionJson.predicted_class <= 3 && predictionJson.predicted_class >= 0) {
        // เก็บ prediction ทุกรอบลง history
        const newHistoryEntry = {
          prediction: newPrediction,
          timestamp: new Date().toISOString(),
          bmi: payload.bmi,
          deviceId: payload.deviceId
        };

        setPredictionHistory(prev => [...prev, newHistoryEntry]); // ✅ Always add

        // อัปเดตค่าหลัก
        setStressPrediction(newPrediction);

        // แจ้งเตือนเฉพาะตอนเปลี่ยนระดับ
        const prevLevel = previousStressLevelRef.current;
        if (newPrediction !== prevLevel) {
          if (newPrediction === 'high') {
            toast.error('🚨 Predicted Stress Level: HIGH', { duration: 5000 });
            const audio = new Audio('/alert.mp3');
            audio.play().catch(err => console.error("Audio error:", err));
          } else if (newPrediction === 'medium') {
            toast('⚠️ Predicted Stress Level: MEDIUM', { duration: 5000 });
          } else if (newPrediction === 'low') {
            toast('📊 Predicted Stress Level: LOW', { duration: 3000 });
          }

          previousStressLevelRef.current = newPrediction;
        }
      } else {
        setStressPrediction("normal");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Prediction fetch error:", error);
        toast.error("Failed to get stress prediction");
      }
    }
  };

  // Keep ref updated with latest personalData
  useEffect(() => {
    personalDataRef.current = personalData;
  }, [personalData]);

  // Fetch personal data ONCE when deviceId changes
  useEffect(() => {
    if (!deviceId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPersonalData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API;

        const personalRes = await fetch(`${baseUrl}personal-data/${deviceId}`, { signal });
        const personalJson = await personalRes.json();
        const personal = personalJson[0] || {};
        setPersonalData(personal);
        setLoading(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Fetch personal data error:", error);
          setLoading(false);
        }
      }
    };

    fetchPersonalData();

    return () => {
      controller.abort();
    };
  }, [deviceId]);

  // Fetch sensor data
  useEffect(() => {
    if (!deviceId) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const baseUrl = process.env.NEXT_PUBLIC_API;
    const fastUrl = process.env.NEXT_PUBLIC_FASTAPI;

    let intervalId;

    const fetchSensorData = async () => {
      try {
        const sensorsRes = await fetch(`${baseUrl}sensors/${deviceId}`, { signal });
        const sensorsJson = await sensorsRes.json();

        const currentSensorData = Array.isArray(sensorsJson) && sensorsJson.length > 0 ? sensorsJson[0] : null;
        if (!currentSensorData) {
          console.warn("No sensor data available");
          return;
        }

        const { sensors, received_at } = currentSensorData;
        setSensorData(currentSensorData);
        const skintemp_mean = sensors.skintemp;
        setSkintemp(skintemp_mean);

        console.log("Fetched sensor data:", currentSensorData);

        let updatedHRBuffer = [];
        // Fetch heart rate from fastapi
        try {
          const hrRes = await fetch(`${fastUrl}predict/processHRByDevice_id/${deviceId}`);
          const hrJson = await hrRes.json();
          
          if (hrJson.detail) {
            console.warn("HR prediction failed:", hrJson.detail);
            return;
          }

          const hr = hrJson.HR;
          
          if (hr && !isNaN(hr)) {
            setCurrentHR(hr);
            updatedHRBuffer = saveHRToBuffer(hr, deviceId);
            setHrBuffer(updatedHRBuffer);
            hrBufferRef.current = updatedHRBuffer;
            setSensorData(prev => ({ ...prev, hr: hr }));
          } else {
            console.warn("Invalid HR value received:", hr);
          }
        } catch (error) {
          console.error("HR fetch error:", error);
        }


        const edaArray = Array.isArray(sensors?.eda) ? sensors.eda : [];
        const ppgArray = Array.isArray(sensors?.ppg) ? sensors.ppg : [];

        const timeOptions = {
          timeZone: 'Asia/Bangkok',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        };

        // Create continuous signal data for EDA
        const edaDataMapped = edaArray.slice(-MAX_SIGNAL_POINTS).map((value, index) => ({
          value,
          time: new Date(new Date(received_at).getTime() + index * 1000).toLocaleTimeString('en-US', timeOptions),
        }));
        setEdaData(edaDataMapped);

        const ppgDataMapped = ppgArray.slice(-MAX_SIGNAL_POINTS).map((value, index) => ({
          value,
          time: new Date(new Date(received_at).getTime() + index * 1000).toLocaleTimeString('en-US', timeOptions),
        }));
        setPpgData(ppgDataMapped);

        // Use HR buffer for continuous HR signal display
        const recentHRData = updatedHRBuffer.slice(-MAX_SIGNAL_POINTS);
        setHrData(recentHRData);

        console.log("EDA Data:", edaDataMapped);
        console.log("PPG Data:", ppgDataMapped);
        console.log("HR Buffer Data:", recentHRData);

      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Fetch sensor data error:", error);
        }
      }
    };

    fetchSensorData();
    intervalId = setInterval(fetchSensorData, 1000); // Fetch every 1 seconds

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [deviceId]);

  // Set up continuous prediction interval
  useDeepCompareEffect(() => {
    if (personalData?.weight != null && personalData?.height != null && deviceId) {
      const controller = new AbortController();

      performStressPrediction(personalData, deviceId, controller.signal);

      predictionIntervalRef.current = setInterval(() => {
        console.log("Interval running");
        performStressPrediction(personalData, deviceId, controller.signal);
      }, 60000);

      return () => {
        if (predictionIntervalRef.current) {
          clearInterval(predictionIntervalRef.current);
        }
        controller.abort();
      };
    }
  }, [personalData, deviceId]);

  const waitForChartReady = async (chartRef, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;

      const check = () => {
        let canvas = null;
        
        if (chartRef?.current) {
          if (chartRef.current.canvas instanceof HTMLCanvasElement) {
            canvas = chartRef.current.canvas;
          } else if (typeof chartRef.current.getCanvas === 'function') {
            canvas = chartRef.current.getCanvas();
          } else if (chartRef.current.querySelector) {
            canvas = chartRef.current.querySelector('canvas');
          } else if (chartRef.current instanceof HTMLCanvasElement) {
            canvas = chartRef.current;
          }
        }

        if (canvas instanceof HTMLCanvasElement) {
          resolve(canvas);
        } else if (elapsed >= timeout) {
          reject(new Error("Chart canvas not ready after timeout"));
        } else {
          elapsed += interval;
          setTimeout(check, interval);
        }
      };

      check();
    });
  };

  const deviceImageMap = {
    "Emotibit-001": "/profiles/Emotibit-001.png",
    "MD-V5-0001071": "/profiles/MD-V5-0001071.png",
    "MD-V5-0000560": "/profiles/MD-V5-0000560.png",
  };

  const defaultProfileUrl = "/profiles/default.png"; // fallback

  const imageUrl = deviceImageMap[deviceId] || defaultImage;

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      let historyCanvas = null;
      try {
        historyCanvas = await waitForChartReady(historyChartRef, 2000);
        console.log("History chart canvas found:", historyCanvas);
      } catch (error) {
        console.warn("Could not get history chart canvas:", error);
      }

      const stressSummary = predictionHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= range[0].startDate && itemDate <= range[0].endDate;
      });

      const baseUrl = 'http://localhost:3000/';
      const logoUrl = `${baseUrl}logo.png`;
      const profileUrl = `${baseUrl}${deviceImageMap[personalData.device_id] || defaultProfileUrl}`;

      await preloadImage(profileUrl);
      await preloadImage(logoUrl);

      await exportPDFReport(
        personalData,
        { ...sensorData, stress_level: stressPrediction },
        stressSummary,
        logoUrl,
        profileUrl,
        historyCanvas
      );

      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };


  return (
  <div className="min-h-screen bg-[#f6f8fc] text-black">
    <Navbar_DB />
    
    <div className="p-4 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          className="bg-navy text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          onClick={() => router.back()}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> 
          Back
        </button>
        
        
      </div>

      {/* Information Cards Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex flex-col lg:flex-row gap-6 items-start relative">
            {/* Profile Image */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <Image
                src={imageUrl}
                width={180}
                height={320}
                alt="Profile"
                className="rounded-lg object-cover"
              />
            </div>

            {/* Personal Details */}
            <div className="flex-1 w-full">
              <p className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">
                {personalData.name || "Name"} {personalData.surname || "Surname"}
              </p>
              
              <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                <p>
                  <span className="font-medium">Age:</span> {personalData.age || "-"} year
                </p>
                <p>
                  <span className="font-medium">Skin Temp: </span> 
                  {skintemp ? skintemp.toFixed(2) : "-"} ℃
                </p>
                <p>
                  <span className="font-medium">Weight:</span> {personalData.weight || "-"} kg
                </p>
                <p>
                  <span className="font-medium">Height:</span> {personalData.height || "-"} cm
                </p>
                <p>
                  <span className="font-medium">BMI: </span> 
                  {personalData.weight && personalData.height 
                    ? (personalData.weight / Math.pow(personalData.height / 100, 2)).toFixed(1) 
                    : "-"
                  }
                </p>
                <p>
                  <span className="font-medium">Condition Health:</span> {personalData.CD || "-"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Device ID:</span> {personalData.device_id || "-"}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-navy text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors absolute top-0 right-0 lg:relative lg:top-auto lg:right-auto"
            >
              <FontAwesomeIcon icon={faEdit} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          personalData={personalData}
          onSave={handleSave}
        />

        {/* AI Stress Prediction Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            AI Stress Prediction
          </h2>

          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Stress Level Badge */}
            <span
              className="px-6 py-3 rounded-xl text-sm font-semibold shadow-md flex-shrink-0"
              style={getStressLevelColor(stressPrediction)}
              aria-label={`Predicted stress level: ${stressPrediction}`}
            >
              {stressPrediction.charAt(0).toUpperCase() + stressPrediction.slice(1)}
            </span>

            {/* Stress Advice */}
            <pre className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
              {getStressAdvice(stressPrediction)}
            </pre>
          </div>
        </div>
      </div>

      {/* Signal Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* EDA Signal Chart */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="text-md font-bold mb-2">EDA Signal</h3>
          <div ref={edaRef}>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <SignalChart 
                data={edaData} 
                label="EDA" 
                color="teal" 
                loading={loading}
                isSignal={true}
              />
            )}
          </div>
        </div>

        {/* HR Signal Chart */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h3 className="text-md font-bold">HR Signal</h3>
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1 rounded-lg border border-purple-300">
              <span className="text-sm font-semibold text-purple-800">
                Current HR: <span className="text-purple-900">{typeof sensorData.hr === "number" ? sensorData.hr.toFixed(0) : "00"}</span> BPM
              </span>
            </div>
          </div>
          <div ref={hrRef}>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <SignalChart 
                data={hrData} 
                label="HR" 
                color="purple" 
                loading={loading}
                isSignal={true}
                unit="BPM"
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Stress Prediction History Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Controls & Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Stress Prediction History
          </h3>

          <div className="space-y-6">
            {/* Time Period Selection */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <h4 className="text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Time Period
              </h4>
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Custom Date Range */}
              {timeframe === 'custom' && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-2 text-gray-600">Date Range</h5>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.startDate.toISOString().split('T')[0]}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        startDate: new Date(e.target.value)
                      }))}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={dateRange.endDate.toISOString().split('T')[0]}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        endDate: new Date(e.target.value)
                      }))}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Clear Data Button */}
              <div className="mt-4 pt-3 border-t">
                <button
                  onClick={handleClearDevice}
                  disabled={!deviceId}
                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Prediction History Data
                </button>
              </div>
            </div>

            {/* Prediction Results Statistics - Enhanced */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border shadow-sm">
              <h4 className="text-base font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Stress Level Statistics
              </h4>

              {/* Summary Statistics Cards - Enhanced Layout */}
              <div className="grid grid-cols-1 gap-4">
                {/* Normal Stress */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-green shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="pl-4">
                        <div className="text-green text-sm font-semibold">Normal Stress</div>
                        <div className="text-green-600 text-xs">Optimal condition</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-900 text-2xl font-bold">
                        {counts?.normal || 0}
                      </div>
                      <div className="text-green-600 text-sm font-medium">
                        {percentages?.normal || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low Stress */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-yellow shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="pl-4">
                        <div className="text-yellow text-sm font-semibold">Low Stress</div>
                        <div className="text-yellow-600 text-xs">Manageable level</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-900 text-2xl font-bold">
                        {counts?.low || 0}
                      </div>
                      <div className="text-yellow-600 text-sm font-medium">
                        {percentages?.low || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medium Stress */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-orange shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="pl-4">
                        <div className="text-orange text-sm font-semibold">Medium Stress</div>
                        <div className="text-orange-600 text-xs">Requires attention</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-900 text-2xl font-bold">
                        {counts?.medium || 0}
                      </div>
                      <div className="text-orange-600 text-sm font-medium">
                        {percentages?.medium || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Stress */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-red shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="pl-4">
                        <div className="text-red text-sm font-semibold">High Stress</div>
                        <div className="text-red-600 text-xs">Needs immediate care</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-900 text-2xl font-bold">
                        {counts?.high || 0}
                      </div>
                      <div className="text-red-600 text-sm font-medium">
                        {percentages?.high || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Predictions Info - Enhanced */}
              <div className="mt-4 p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Total Predictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-900">{predictionHistory?.length || 0}</span>
                    <span className="text-xs text-gray-500">records</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart & Table */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Data Visualization
          </h3>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Stress Level Trends Over Time
                    </h3>
                    <p className="text-sm text-gray-600">
                      Daily breakdown of stress levels by category
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                  {aggregatedChartData && aggregatedChartData.length > 0 ? (
                    <div className="h-80">
                      <HistoryChart 
                        data={stressCountsData} 
                        ref={historyChartRef}
                      />
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="p-4 bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Activity className="h-10 w-10 text-gray-300" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                          No Data Available
                        </h4>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                          No prediction data for the selected period. Try adjusting your date range or check back later.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Recent Predictions Table - Enhanced */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border shadow-sm">
              <h4 className="text-base font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Recent Predictions History
              </h4>
              
              {!predictionHistory || predictionHistory.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm border">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">No Predictions Yet</p>
                  <p className="text-sm text-gray-500 mt-1">Prediction history will appear here</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg overflow-hidden border shadow-sm">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-700 border-b">Date & Time</th>
                          <th className="text-left p-4 font-semibold text-gray-700 border-b">Stress Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {predictionHistory
                          .slice(-20)
                          .reverse()
                          .map((prediction, index) => (
                            <tr 
                              key={`${prediction.timestamp}-${index}`} 
                              className="hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="p-4 text-gray-600">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {new Date(prediction.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(prediction.timestamp).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2 py-2 rounded-full text-xs font-semibold shadow-sm ${
                                  prediction.prediction?.toLowerCase() === 'normal' 
                                    ? 'bg-green text-green-800 border border-green-200' 
                                    : prediction.prediction?.toLowerCase() === 'low' 
                                    ? 'bg-yellow text-yellow-800 border border-yellow-200'
                                    : prediction.prediction?.toLowerCase() === 'medium' 
                                    ? 'bg-orange text-orange-800 border border-orange-200'
                                    : prediction.prediction?.toLowerCase() === 'high'
                                    ? 'bg-red text-red-800 border border-red-200'
                                    : 'bg-gray text-gray-800 border border-gray-200'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    prediction.prediction?.toLowerCase() === 'normal' 
                                      ? 'bg-green-500' 
                                      : prediction.prediction?.toLowerCase() === 'low' 
                                      ? 'bg-yellow-500'
                                      : prediction.prediction?.toLowerCase() === 'medium' 
                                      ? 'bg-orange-500'
                                      : prediction.prediction?.toLowerCase() === 'high'
                                      ? 'bg-red-500 animate-pulse'
                                      : 'bg-gray-500'
                                  }`}></div>
                                  {prediction.prediction 
                                    ? prediction.prediction.charAt(0).toUpperCase() + prediction.prediction.slice(1)
                                    : 'Unknown'
                                  }
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {predictionHistory.length > 20 && (
                    <div className="bg-gray-50 px-4 py-2 text-center border-t">
                      <span className="text-xs text-gray-500">
                        Showing latest 20 of {predictionHistory.length} predictions
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
}