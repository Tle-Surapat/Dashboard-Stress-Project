"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"; // Correct import for Next.js 13+
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/components/firebase";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import EDAChart from "@/components/Chart";
import HistoryChart from "@/components/HistoryChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faBackward } from "@fortawesome/free-solid-svg-icons"; // Import the backward icon

export default function DetailsPage() {
  const router = useRouter(); // Correct use of useRouter in Next.js 13+
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
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week"); // Default filter

  const stressManagementTips = {
    Low: "Maintain your healthy habits.",
    Moderate: "Take breaks and practice relaxation techniques.",
    High: "Managing high stress can be achieved through various strategies that promote relaxation and well-being. Deep breathing exercises can help calm the mind and reduce tension in the body. Regular physical activity, such as exercise, releases endorphins, which act as natural stress relievers. Meditation and mindfulness also help to focus the mind and foster inner peace. Talking to trusted individuals or engaging in hobbies can provide emotional support and distraction from stressors. Setting small, achievable goals creates a sense of accomplishment, while adequate sleep allows the body and mind to recharge, reducing stress and improving overall performance and well-being.",
  };

  useEffect(() => {
    // Clear the data before fetching new data
    setEdaData([]);
    setPpgData([]);
    setLoading(true);

    const subcollectionRef = collection(db, "realtimedata");

    const unsubscribe = onSnapshot(subcollectionRef, (querySnapshot) => {
      const allEdaData = [];
      const allPpgData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString(); // Convert UNIX timestamp to readable time

        // Push individual values to respective arrays
        allEdaData.push({ time: timestamp, value: data.EDA_mean });
        allPpgData.push({ time: timestamp, value: data.PPG_mean });
      });

      setEdaData(allEdaData);
      setPpgData(allPpgData);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();
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
      { day: "Day 8", low: 12, medium: 6, high: 4 },
      { day: "Day 9", low: 10, medium: 8, high: 5 },
      { day: "Day 10", low: 14, medium: 4, high: 6 },
      { day: "Day 11", low: 8, medium: 7, high: 3 },
      { day: "Day 12", low: 13, medium: 5, high: 2 },
      { day: "Day 13", low: 9, medium: 6, high: 5 },
      { day: "Day 14", low: 11, medium: 7, high: 3 },
    ];
    setHistoryData(simulatedHistory);
    setFilteredHistoryData(simulatedHistory); // Default to show all data
  }, []);

  useEffect(() => {
    if (filter === "Week") {
      setFilteredHistoryData(historyData.slice(0, 7)); // Show last 7 days
    } else if (filter === "Month") {
      setFilteredHistoryData(historyData); // Show all (simulate a month)
    }
  }, [filter, historyData]);

  const filteredEdaData = edaData.slice(-10);
  const filteredPpgData = ppgData.slice(-10);

  const handleBackClick = () => {
    router.push("/dashboard"); // Correct path for dashboard navigation
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar_DB />
      <div className="flex flex-wrap px-8 py-6">
        {/* back button */}
        <div className="w-full p-4 flex ">
          <button
            onClick={handleBackClick}
            className="bg-navy text-white py-2 px-4 rounded-lg shadow-md"
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>
        </div>

        {/* Prediction Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between" style={{ height: 'fit-content' }}>
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
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between" style={{ height: 'fit-content' }}>
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
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between" style={{ height: '100%' }}>
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-center flex flex-col justify-between h-full">
            {/* Profile photo */}
            <div className="flex justify-center mb-4">
              <img
                src="/profile.png" // Add the path to the profile photo here
                alt="Profile"
                className="w-24 h-24 rounded-full" // Adjusted size and centering
              />
            </div>
            <div>
              {/* Name, Age, Height, Weight, Congenital Diseases */}
              <h2 className="text-xl font-bold text-navy mb-4">{name}</h2>
              <p className="text-sm text-gray-700 mb-2">Age: {age} | Height: {height}</p>
              <p className="text-sm text-gray-700 mb-2">Weight: {weight} | Congenital Diseases: {congenitalDiseases}</p>
            </div>
          </div>
        </div>

        {/* PPG Signal Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between" style={{ height: 'fit-content' }}>
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">PPG Signal</h3>
            {loading ? (
              <div className="text-center">Loading PPG data...</div>
            ) : filteredPpgData.length > 0 ? (
              <EDAChart edaData={filteredPpgData} />
            ) : (
              <div className="text-center text-gray-500">No PPG data available.</div>
            )}
          </div>
        </div>

        {/* History Chart Section */}
        <div className="w-full p-4 flex flex-col justify-between" style={{ height: 'fit-content' }}>
          <div className="bg-gray-200 rounded-lg shadow-md p-8">
            {/* Title and Filter Menu */}
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

            {/* History Chart */}
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
