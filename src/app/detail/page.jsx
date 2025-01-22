"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/components/firebase";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import EDAChart from "@/components/Chart";
import HistoryChart from "@/components/HistoryChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function DetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const queryParams = {
    name: searchParams.get("name") || "Unknown",
    age: searchParams.get("age") || "N/A",
    height: searchParams.get("height") || "N/A",
    weight: searchParams.get("weight") || "65",
    congenitalDiseases: searchParams.get("congenitalDiseases") || "N/A",
    stressLevel: searchParams.get("stressLevel") || "Normal",
    colors: searchParams.get("colors") || "bg-gray-200",
  };

  // State management
  const [edaData, setEdaData] = useState([]);
  const [ppgData, setPpgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week");

  // Stress management tips
  const stressManagementTips = {
    Low: "Maintain your healthy habits.",
    Moderate: "Take breaks and practice relaxation techniques.",
    High: "Managing high stress can be achieved through relaxation, deep breathing, exercise, meditation, and emotional support.",
  };

  // Fetch real-time data from Firestore
  useEffect(() => {
    const subcollectionRef = collection(db, "realtimedata");

    const unsubscribe = onSnapshot(subcollectionRef, (querySnapshot) => {
      const allEdaData = [];
      const allPpgData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

        allEdaData.push({ time: timestamp, value: data.EDA_mean });
        allPpgData.push({ time: timestamp, value: data.PPG_mean });
      });

      setEdaData(allEdaData.slice(-10));
      setPpgData(allPpgData.slice(-10));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Simulated history data
  useEffect(() => {
    const simulatedHistory = Array.from({ length: 14 }, (_, index) => ({
      day: `Day ${index + 1}`,
      low: Math.floor(Math.random() * 15),
      medium: Math.floor(Math.random() * 10),
      high: Math.floor(Math.random() * 7),
    }));
    setHistoryData(simulatedHistory);
    setFilteredHistoryData(simulatedHistory.slice(0, 7)); // Default to last 7 days
  }, []);

  // Handle filter change (Week/Month)
  useEffect(() => {
    setFilteredHistoryData(filter === "Week" ? historyData.slice(0, 7) : historyData);
  }, [filter, historyData]);

  // Handle back button click
  const handleBackClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar_DB />
      <div className="flex flex-wrap px-8 py-6">
        {/* Back button */}
        <div className="w-full p-4 flex">
          <button onClick={handleBackClick} className="bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md">
            <FontAwesomeIcon icon={faBackward} /> Back
          </button>
        </div>

        {/* Prediction Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-navy">
            <h3 className="text-lg font-bold text-navy mb-4">PREDICTION</h3>
            <div className="flex flex-row items-center gap-4">
              <div className={`${queryParams.colors} rounded-lg shadow-md p-6 flex items-center justify-center text-lg font-bold`}>
                {queryParams.stressLevel}
              </div>
              <div className="flex-grow">
                <p className="text-gray-700 text-sm leading-relaxed px-4">
                  {stressManagementTips[queryParams.stressLevel] || "Stay calm and focus on self-care."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EDA Signal Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">EDA Signal</h3>
            {loading ? (
              <div className="text-center">Loading EDA data...</div>
            ) : edaData.length > 0 ? (
              <EDAChart edaData={edaData} />
            ) : (
              <div className="text-center text-gray-500">No EDA data available.</div>
            )}
          </div>
        </div>

        {/* User Info Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-center flex flex-col justify-between">
            <div className="flex justify-center mb-4">
              <Image src="/profile.png" alt="Profile" width={96} height={96} className="rounded-full" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy mb-4">{queryParams.name}</h2>
              <p className="text-sm text-gray-700 mb-2">Age: {queryParams.age} | Height: {queryParams.height}</p>
              <p className="text-sm text-gray-700 mb-2">Weight: {queryParams.weight} | Diseases: {queryParams.congenitalDiseases}</p>
            </div>
          </div>
        </div>

        {/* PPG Signal Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">PPG Signal</h3>
            {loading ? (
              <div className="text-center">Loading PPG data...</div>
            ) : ppgData.length > 0 ? (
              <EDAChart edaData={ppgData} />
            ) : (
              <div className="text-center text-gray-500">No PPG data available.</div>
            )}
          </div>
        </div>

        {/* History Chart Section */}
        <div className="w-full p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl text-navy font-bold">HISTORY</h3>
              <select
                className="bg-white border border-gray-300 text-gray-700 p-2 rounded-lg shadow-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="Week">Week</option>
                <option value="Month">Month</option>
              </select>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <HistoryChart data={filteredHistoryData} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
