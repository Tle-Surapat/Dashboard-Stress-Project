"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

  const [edaData, setEdaData] = useState([]);
  const [ppgData, setPpgData] = useState([]);
  const [categorizedPpgData, setCategorizedPpgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [filter, setFilter] = useState("Week");

  // New state for updating the displayed stress level every 15 seconds
  const [displayedStressLevel, setDisplayedStressLevel] = useState("Normal");

  // Define stress management tips
  const stressManagementTips = {
    Normal: "Stay calm and focus on self-care.",
    Low: "Maintain your healthy habits.",
    Medium: "Take breaks and practice relaxation techniques.",
    High:
      "Managing stress effectively is essential for overall well-being. Engaging in regular physical exercise, such as yoga or jogging, can help release endorphins and improve mood. Practicing mindfulness techniques, including deep breathing and meditation, allows individuals to stay present and reduce anxiety. Additionally, maintaining a healthy work-life balance and seeking social support from friends and family can provide emotional relief and perspective.",
  };

  // Define color mapping based on stress level
  const stressLevelColors = {
    Normal: "bg-green text-white",
    Low: "bg-yellow text-white",
    Medium: "bg-orange text-white",
    High: "bg-red text-white",
  };

  // Fetch real‑time data from Firebase with onSnapshot (no extra polling needed)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const subcollectionRef = collection(db, "realtimedata");

    const unsubscribe = onSnapshot(
      subcollectionRef,
      (querySnapshot) => {
        const allEdaData = [];
        const allPpgData = [];
        const categorizedData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

          allEdaData.push({ time: timestamp, value: data.EDA_mean });
          allPpgData.push({ time: timestamp, value: data.PPG_mean });

          // Categorize stress level based on EDA_mean
          let category = "Normal";
          if (data.EDA_mean > 0.3) category = "High";
          else if (data.EDA_mean > 0.2) category = "Medium";
          else if (data.EDA_mean > 0.1) category = "Low";

          categorizedData.push({ time: timestamp, value: data.PPG_mean, category });
        });

        setEdaData(allEdaData);
        setPpgData(allPpgData);
        setCategorizedPpgData(categorizedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Memoized filtered data (latest 10 records)
  const filteredEdaData = useMemo(() => edaData.slice(-10), [edaData]);
  const filteredPpgData = useMemo(() => ppgData.slice(-10), [ppgData]);
  const filteredCategorizedPpgData = useMemo(
    () => categorizedPpgData.slice(-10),
    [categorizedPpgData]
  );

  // --- New: Update displayed stress condition every 15 seconds ---
  // We use a ref to always have access to the latest filtered data.
  const latestCategorizedDataRef = useRef(filteredCategorizedPpgData);
  useEffect(() => {
    latestCategorizedDataRef.current = filteredCategorizedPpgData;
  }, [filteredCategorizedPpgData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const data = latestCategorizedDataRef.current;
      const newStressLevel =
        data.length > 0 ? data[data.length - 1].category : "Normal";
      setDisplayedStressLevel(newStressLevel);
    }, 15000); // Check stress condition every 15 seconds

    return () => clearInterval(intervalId);
  }, []);
  // --- End new section ---

  // Simulate history data on component mount
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

  // Filter history data based on selected filter
  const filteredHistoryData = useMemo(() => {
    return filter === "Week" ? historyData.slice(0, 7) : historyData;
  }, [filter, historyData]);

  // Back button click handler
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
              {/* Use conditional color mapping based on the displayed stress level */}
              <div
                className={`${stressLevelColors[displayedStressLevel]} rounded-lg shadow-md p-4 w-30 h-30 flex items-center justify-center text-lg font-bold`}
              >
                {displayedStressLevel}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed px-4">
                {stressManagementTips[displayedStressLevel]}
              </p>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col">
          <div className="bg-gray-200 h-60 rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/profile.png"
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full"
                priority
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

        {/* Signal Sections */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">EDA Signal</h3>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <EDAChart edaData={filteredEdaData} />
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-navy mb-4">PPG Signal</h3>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <PPGChart edaData={filteredPpgData} />
            )}
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
