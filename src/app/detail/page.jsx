"use client";

import { useState, useEffect } from "react";
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
  const [params, setParams] = useState({
    name: "Unknown",
    age: "N/A",
    height: "N/A",
    weight: "65",
    congenitalDiseases: "N/A",
    stressLevel: "Normal",
    colors: "bg-gray-200",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setParams({
        name: searchParams.get("name") || "Unknown",
        age: searchParams.get("age") || "N/A",
        height: searchParams.get("height") || "N/A",
        weight: searchParams.get("weight") || "65",
        congenitalDiseases: searchParams.get("congenitalDiseases") || "N/A",
        stressLevel: searchParams.get("stressLevel") || "Normal",
        colors: searchParams.get("colors") || "bg-gray-200",
      });
    }
  }, []);

  const [edaData, setEdaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const subcollectionRef = collection(db, "realtimedata");
      const unsubscribe = onSnapshot(subcollectionRef, (querySnapshot) => {
        const allEdaData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();
          allEdaData.push({ time: timestamp, value: data.EDA_mean });
        });
        setEdaData(allEdaData);
        setLoading(false);
      });
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
        <div className="w-full p-4 flex ">
          <button
            onClick={handleBackClick}
            className="bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md"
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-navy">
            <h3 className="text-lg font-bold text-navy mb-4">PREDICTION</h3>
            <div className="flex flex-row items-center gap-4">
              <div className={`${params.colors} rounded-lg shadow-md p-4 w-30 h-30 flex items-center justify-center text-lg font-bold`}>
                {params.stressLevel}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">EDA Signal</h3>
            {loading ? (
              <div className="text-center">Loading EDA data...</div>
            ) : edaData.length > 0 ? (
              <EDAChart edaData={edaData.slice(-10)} />
            ) : (
              <div className="text-center text-gray-500">No EDA data available.</div>
            )}
          </div>
        </div>

        <div className="w-full p-4 flex flex-col justify-between">
          <div className="bg-gray-200 rounded-lg shadow-md p-8">
            <h3 className="text-2xl text-navy font-bold">HISTORY</h3>
            <select
              className="bg-white border border-gray-300 text-gray-700 p-2 rounded-lg shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Week">Week</option>
              <option value="Month">Month</option>
            </select>
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
