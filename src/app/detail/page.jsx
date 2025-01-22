"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic'; // Import for dynamic component loading
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/components/firebase";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import Image from 'next/image';

// Dynamically import components to avoid SSR issues
const EDAChart = dynamic(() => import("@/components/Chart"), { ssr: false });
const HistoryChart = dynamic(() => import("@/components/HistoryChart"), { ssr: false });

function DetailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const age = searchParams.get("age") || "N/A";
  const height = searchParams.get("height") || "N/A";
  const weight = searchParams.get("weight") || "65";
  const congenitalDiseases = searchParams.get("congenitalDiseases") || "N/A";
  const stressLevel = searchParams.get("stressLevel") || "Normal";
  const colors = searchParams.get("colors") || "bg-gray-200";

  const [edaData, setEdaData] = useState([]);
  const [ppgData, setPpgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week");

  const stressManagementTips = {
    Low: "Maintain your healthy habits.",
    Moderate: "Take breaks and practice relaxation techniques.",
    High: "Deep breathing exercises, physical activity, meditation, and proper sleep can help reduce high stress levels.",
  };

  useEffect(() => {
    setEdaData([]);
    setPpgData([]);
    setLoading(true);

    if (typeof window !== "undefined") {
      const subcollectionRef = collection(db, "realtimedata");

      const unsubscribe = onSnapshot(
        subcollectionRef,
        (querySnapshot) => {
          const allEdaData = [];
          const allPpgData = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

            allEdaData.push({ time: timestamp, value: data.EDA_mean });
            allPpgData.push({ time: timestamp, value: data.PPG_mean });
          });

          setEdaData(allEdaData);
          setPpgData(allPpgData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const simulatedHistory = [
      { day: "Day 1", low: 12, medium: 6, high: 4 },
      { day: "Day 2", low: 10, medium: 8, high: 5 },
      { day: "Day 3", low: 14, medium: 4, high: 6 },
      { day: "Day 4", low: 8, medium: 7, high: 3 },
      { day: "Day 5", low: 13, medium: 5, high: 2 },
      { day: "Day 6", low: 9, medium: 6, high: 5 },
      { day: "Day 7", low: 11, medium: 7, high: 3 },
    ];
    setHistoryData(simulatedHistory);
  }, []);

  const filteredHistoryData = useMemo(() => {
    return filter === "Week" ? historyData.slice(0, 7) : historyData;
  }, [filter, historyData]);

  const filteredEdaData = useMemo(() => edaData.slice(-10), [edaData]);
  const filteredPpgData = useMemo(() => ppgData.slice(-10), [ppgData]);

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar_DB />
      <div className="flex flex-wrap px-8 py-6">
        {/* Back button */}
        <div className="w-full p-4 flex">
          <button
            onClick={handleBackClick}
            className="bg-navy text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
            aria-label="Go back to dashboard"
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>
        </div>

        {/* Prediction Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-navy">
            <h3 className="text-lg font-bold text-navy mb-4">PREDICTION</h3>
            <div className="flex flex-row items-center gap-4">
              <div
                className={`${colors} rounded-lg shadow-md p-4 w-30 h-30 flex items-center justify-center text-lg font-bold`}
                aria-label={`Stress Level: ${stressLevel}`}
              >
                {stressLevel}
              </div>
              <div className="flex-grow">
                <p className="text-gray-700 text-sm leading-relaxed px-4">
                  {stressManagementTips[stressLevel] || "Stay calm and focus on self-care."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EDA Signal Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">EDA Signal</h3>
            {loading ? (
              <div className="text-center">Loading EDA data...</div>
            ) : filteredEdaData.length > 0 ? (
              <EDAChart edaData={filteredEdaData} />
            ) : (
              <div className="text-center text-gray-500">No EDA data available.</div>
            )}
          </div>
        </div>

        {/* User Info Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <Image src="/profile.png" alt="Profile" width={96} height={96} className="rounded-full" priority />
            </div>
            <h2 className="text-xl font-bold text-navy mb-4">{name}</h2>
            <p className="text-sm text-gray-700 mb-2">Age: {age} | Height: {height}</p>
            <p className="text-sm text-gray-700 mb-2">Weight: {weight} | Congenital Diseases: {congenitalDiseases}</p>
          </div>
        </div>

        {/* History Chart Section */}
        <div className="w-full p-4 flex flex-col justify-between">
          <div className="bg-gray-200 rounded-lg shadow-md p-8">
            <HistoryChart data={filteredHistoryData} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailsPageContent />
    </Suspense>
  );
}
