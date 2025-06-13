'use client';

import { useEffect, useMemo, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar_DB from '@/components/Navbar_DB';
import Footer from '@/components/Footer';
import SubjectCard from '@/components/SubjectCard';
// Add toast import if using react-hot-toast
import toast from 'react-hot-toast';

const PieChart = dynamic(() => import('@/components/PieChart'), { ssr: false });

const DashboardPage = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [stressPrediction, setStressPrediction] = useState('normal');
  const [predictionHistory, setPredictionHistory] = useState([]);
  const previousStressLevelRef = useRef('');

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  const useStressNotification = (newPrediction) => {
    const prevLevelRef = useRef(null);
    const counterRef = useRef(0);

    const notify = (newPrediction) => {
      const prevLevel = prevLevelRef.current;

      // ถ้าระดับเหมือนเดิม → เพิ่ม counter
      if (newPrediction === prevLevel) {
        counterRef.current += 1;
      } else {
        // ถ้าเปลี่ยน → รีเซ็ต counter
        counterRef.current = 1;
        prevLevelRef.current = newPrediction;
      }

      // แจ้งเตือนเมื่อถึงจำนวนครั้งที่กำหนด
      if (newPrediction === 'high' && counterRef.current === 5) {
        toast.error('🚨 Stress Level: HIGH (5 times)', { duration: 5000 });
        const audio = new Audio('/alert.mp3');
        audio.play().catch(err => console.error('Audio error:', err));
      } else if (newPrediction === 'medium' && counterRef.current === 3) {
        toast('⚠️ Stress Level: MEDIUM (3 times)', { duration: 5000 });
      }

      // ไม่แจ้งเตือนเมื่อเป็น low
    };
    return notify;
  };

  const notify = useStressNotification();

  // Function to perform stress prediction (moved outside useEffect)
  const performStressPrediction = async (personalData, deviceId) => {
    try {
      if (!personalData.weight || !personalData.height) {
        console.warn("Missing weight or height data for BMI calculation");
        return 'normal'; // Return default value
      }

      const heightInMeters = personalData.height / 100;
      const bmi = personalData.weight / (heightInMeters * heightInMeters);

      const payload = {
        deviceId: personalData.device_id || deviceId,
        gender: personalData.gender?.toLowerCase() || "",
        bmi: parseFloat(bmi.toFixed(2)),
        sleep: personalData.timeToSleep || personalData.sleep || null,
        skinType: personalData.skinType || personalData.skintype || "",
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

      if (predictionJson.predicted_class <= 2 && predictionJson.predicted_class >= 0) {
        const newPrediction = predictionJson.predicted_label.toLowerCase();
        
        // Only add to history if stress level changed
        const prevLevel = previousStressLevelRef.current;
        if (newPrediction !== prevLevel) {
          setStressPrediction(newPrediction);
          console.log("New stress prediction:", newPrediction);
          
          // Add to prediction history only when level changes
          const newHistoryEntry = {
            prediction: newPrediction,
            timestamp: new Date().toISOString(),
            bmi: payload.bmi,
            device_id: payload.deviceId
          };
          
          setPredictionHistory(prev => [...prev, newHistoryEntry]);

          notify(newPrediction);
          
          previousStressLevelRef.current = newPrediction;
        }
        
        return newPrediction;
      } else {
        console.warn("No prediction in response");
        return 'normal';
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Prediction fetch error:", error);
        toast.error("Failed to get stress prediction");
      }
      return 'normal';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API;
        const fastUrl = process.env.NEXT_PUBLIC_FASTAPI;

        const activeRes = await fetch(`${baseUrl}sensors/active`);
        const activeData = await activeRes.json();
        if (!activeData || activeData.length === 0) {
          console.log('No devices found');
          setSubjects([]);
          setLoading(false);
          return;
        }

        const subjectsList = [];

        for (const device of activeData) {
          const device_id = device.device_id;

          // Fetch personal data
          const personalRes = await fetch(`${baseUrl}personal-data/${device_id}`);
          const personalData = await personalRes.json();
          const personal = personalData[0];
          if (!personal) continue;

          // Fetch sensor data
          const sensorsRes = await fetch(`${baseUrl}sensors/${device_id}`);
          const sensorsData = await sensorsRes.json();
          const sensors = sensorsData[0]?.sensors || {};

          const eda = sensors.eda || [];
          const ppg = sensors.ppg || [];
          const skintemp = sensors.skintemp || [];

          // Fetch heart rate from fastapi
          const hrRes = await fetch(`${fastUrl}predict/getHrByDevice_id/${device_id}`);
          const hrJson = await hrRes.json();

          // คำนวณ BMI
          const heightM = personal.height ? personal.height / 100 : 0; // cm to m
          const weightKg = personal.weight || 0;
          const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;

          // ดึงข้อมูลเพิ่มเติม
          const gender = personal.gender || '-';
          const sleep = personal.sleep || 0;
          const skintype = personal.skintype || '-';

          // ฟังก์ชันคำนวณ mean
          const mean = (arr) => Array.isArray(arr) && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

          // Get stress prediction for this subject
          const predictedStress = await performStressPrediction(personal, device_id);
          
          // Convert to display format
          const stressLevelDisplay = predictedStress.charAt(0).toUpperCase() + predictedStress.slice(1);
          
          const subject = {
            name: personal.name || 'User',
            surname: personal.surname || 'Surname',
            age: personal.age || 0,
            weight: weightKg,
            height: personal.height || 0,
            device_id: personal.device_id || device_id,
            gender,
            bmi,
            sleep,
            skintype,
            EDA_mean: mean(eda),
            PPG_mean: mean(ppg),
            hr: hrJson.toFixed(2)|| 0,
            skintemp: skintemp,
            stressLevel: stressLevelDisplay,
          };

          subjectsList.push(subject);
        }

        setSubjects(subjectsList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setSubjects([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const summaryData = useMemo(() => ({
    normal: subjects.filter((s) => s.stressLevel === 'Normal').length,
    low: subjects.filter((s) => s.stressLevel === 'Low').length,
    medium: subjects.filter((s) => s.stressLevel === 'Medium').length,
    high: subjects.filter((s) => s.stressLevel === 'High').length,
  }), [subjects]);

  const stressLevelColors = {
    High: 'bg-red text-white',
    Medium: 'bg-orange text-black',
    Low: 'bg-yellow text-black',
    Normal: 'bg-green text-white',
  };

  const deviceImageMap = {
    "Emotibit-001": "/profiles/Emotibit-001.png",
    "MD-V5-0001071": "/profiles/MD-V5-0001071.png",
    "MD-V5-0000560": "/profiles/MD-V5-0000560.png",
  };

  const handleMoreClick = (subject) => {
    router.push(
      `/detail?name=${encodeURIComponent(subject.name)}&device_id=${subject.device_id}&stressLevel=${subject.stressLevel}&colors=${encodeURIComponent(
        stressLevelColors[subject.stressLevel]
      )}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar_DB />
      <div className="flex flex-wrap px-6 py-6">
        {/* Summary Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-white rounded-lg p-10 shadow-md">
            <h2 className="text-3xl text-navy mb-4">Summary</h2>
            <div className="mt-8 w-full h-auto">
              {isClient ? <PieChart data={summaryData} /> : <div>Loading chart...</div>}
            </div>
            <div className="mt-14 grid grid-cols-2 gap-2">
              <div className="bg-green text-white p-2 text-center rounded-lg">
                NORMAL: {summaryData.normal} Person
              </div>
              <div className="bg-yellow text-black p-2 text-center rounded-lg">
                LOW: {summaryData.low} Person
              </div>
              <div className="bg-orange text-white p-2 text-center rounded-lg">
                MEDIUM: {summaryData.medium} Person
              </div>
              <div className="bg-red text-black p-2 text-center rounded-lg">
                HIGH: {summaryData.high} Person
              </div>
            </div>
          </div>
        </div>

        {/* Stress Levels Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-white rounded-lg p-10 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl text-navy font-bold mb-4">Stress Levels</h2>
              <Link href="/newpatient">
                <button className="bg-blue text-white font-bold px-4 py-2 rounded-lg hover:bg-navy hover:text-white transition-all duration-200 text-sm md:text-base">
                  New Patient
                </button>
              </Link>
            </div>
            {loading ? (
              <p>Loading subjects...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 overflow-y-auto" style={{ maxHeight: '510px' }}>
                {subjects
                  .sort((a, b) => {
                    const stressOrder = { High: 1, Medium: 2, Low: 3, Normal: 4 };
                    return stressOrder[a.stressLevel] - stressOrder[b.stressLevel];
                  })
                  .map((subject, index) => (
                    <SubjectCard
                      key={index}
                      subject={subject}
                      color={stressLevelColors[subject.stressLevel]}
                      onMoreClick={handleMoreClick}
                      imageSrc={deviceImageMap[subject.device_id] || "/profiles/default.png"}
                    />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;