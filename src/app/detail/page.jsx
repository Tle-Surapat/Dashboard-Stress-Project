"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/components/firebase";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

// Dynamically import components to avoid SSR issues
const EDAChart = dynamic(() => import("@/components/Chart"), { ssr: false });
const PPGChart = dynamic(() => import("@/components/Chart"), { ssr: false });
const HistoryChart = dynamic(() => import("@/components/HistoryChart"), { ssr: false });

function DetailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Subject T";
  const age = searchParams.get("age") || "21";
  const height = searchParams.get("height") || "181";
  const weight = searchParams.get("weight") || "65";
  const congenitalDiseases = searchParams.get("congenitalDiseases") || "N/A";
  const stressLevel = searchParams.get("stressLevel") || "Normal";
  const colors = searchParams.get("colors") || "bg-red text-white";

  const [edaData, setEdaData] = useState([]);
  const [ppgData, setPpgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week");

  const stressManagementTips = {
    normal: "",
    Low: "Maintain your healthy habits.",
    Medium: "Take breaks and practice relaxation techniques.",
    High: "Managing stress effectively is essential for maintaining overall well-being. Engaging in regular physical exercise, such as yoga or jogging, can help release endorphins and improve mood. Practicing mindfulness techniques, including deep breathing and meditation, allows individuals to stay present and reduce anxiety. Additionally, maintaining a healthy work-life balance and seeking social support from friends and family can provide emotional relief and perspective.",
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

          console.log("EDA data: ", allEdaData);
          console.log("PPG data: ", allPpgData);
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
      { day: "Day 1", normal: 18, low: 8, medium: 2, high: 0 },
      { day: "Day 2", normal: 16, low: 7, medium: 3, high: 1 },
      { day: "Day 3", normal: 17, low: 6, medium: 4, high: 2 },
      { day: "Day 4", normal: 19, low: 8, medium: 3, high: 1 },
      { day: "Day 5", normal: 15, low: 10, medium: 5, high: 3 },
      { day: "Day 6", normal: 17, low: 9, medium: 3, high: 2 },
      { day: "Day 7", normal: 18, low: 5, medium: 4, high: 1 },
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
        <div className="w-full md:w-1/2 p-4 flex flex-col">
          <div className="bg-gray-200 h-60 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">PREDICTION</h3>
            <div className="flex flex-row items-center gap-4">
              <div
                className={`${colors} rounded-lg shadow-md p-4 w-30 h-30 flex items-center justify-center text-lg font-bold`}
              >
                {stressLevel}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed px-4">
                {stressManagementTips[stressLevel] || "Stay calm and focus on self-care."}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col">
          <div className="bg-gray-200 h-60 rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <Image src="/profile.png" alt="Profile" width={100} height={100} className="rounded-full" priority />
            </div>
            <h2 className="text-xl font-bold text-navy mb-4">{name}</h2>
            <p className="text-sm text-gray-700 mb-2">Age: {age} | Height: {height}</p>
            <p className="text-sm text-gray-700 mb-2">Weight: {weight} | Congenital Diseases: {congenitalDiseases}</p>
          </div>
        </div>

        {/* Signal Sections */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">EDA Signal</h3>
            {loading ? <div className="text-center">Loading...</div> : <EDAChart edaData={filteredEdaData} />}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">PPG Signal</h3>
            {loading ? <div className="text-center">Loading...</div> : <PPGChart edaData={filteredPpgData} />}
          </div>
        </div>

        {/* History Chart */}
        <div className="w-full p-4">
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
