"use client";

import { useState, useEffect, Suspense } from "react";
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

function SearchParamsComponent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const age = searchParams.get("age") || "N/A";
  const height = searchParams.get("height") || "N/A";
  const weight = searchParams.get("weight") || "65";
  const congenitalDiseases = searchParams.get("congenitalDiseases") || "N/A";
  const stressLevel = searchParams.get("stressLevel") || "Normal";
  const colors = searchParams.get("colors") || "bg-gray-200";

  return { name, age, height, weight, congenitalDiseases, stressLevel, colors };
}

export default function DetailsPage() {
  const router = useRouter();
  const { name, age, height, weight, congenitalDiseases, stressLevel, colors } =
    SearchParamsComponent();

  const [edaData, setEdaData] = useState([]);
  const [ppgData, setPpgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week");

  const stressManagementTips = {
    Low: "Maintain your healthy habits.",
    Moderate: "Take breaks and practice relaxation techniques.",
    High: "Managing high stress can be achieved through various strategies such as deep breathing, meditation, and regular exercise.",
  };

  useEffect(() => {
    setEdaData([]);
    setPpgData([]);
    setLoading(true);

    const subcollectionRef = collection(db, "realtimedata");

    const unsubscribe = onSnapshot(subcollectionRef, (querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        time: new Date(doc.data().timestamp * 1000).toLocaleTimeString(),
        edaValue: doc.data().EDA_mean,
        ppgValue: doc.data().PPG_mean,
      }));

      setEdaData((prev) => [...prev.slice(-10), ...newData]);
      setPpgData((prev) => [...prev.slice(-10), ...newData]);
      setLoading(false);
    });

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
    ];
    setHistoryData(simulatedHistory);
    setFilteredHistoryData(simulatedHistory);
  }, []);

  useEffect(() => {
    if (filter === "Week") {
      setFilteredHistoryData(historyData.slice(0, 7));
    } else {
      setFilteredHistoryData(historyData);
    }
  }, [filter, historyData]);

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar_DB />
      <div className="flex flex-wrap px-8 py-6">
        <div className="w-full p-4 flex">
          <button
            onClick={handleBackClick}
            className="bg-navy text-white py-2 px-4 rounded-lg shadow-md"
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>
        </div>

        {/* Prediction Section */}
        <div
          className="w-full md:w-1/2 p-4 flex flex-col justify-between"
          style={{ height: "fit-content" }}
        >
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
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/profile.png"
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full"
              />
            </div>
            <h2 className="text-xl font-bold text-navy mb-4">{name}</h2>
            <p className="text-sm text-gray-700 mb-2">
              Age: {age} | Height: {height}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Weight: {weight} | Congenital Diseases: {congenitalDiseases}
            </p>
          </div>
        </div>

        {/* History Chart Section */}
        <div className="w-full p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl text-navy font-bold">HISTORY</h3>
              <select
                className="bg-white border border-gray-300 text-gray-700 p-2 rounded-lg"
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
