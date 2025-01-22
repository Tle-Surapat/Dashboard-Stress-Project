"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import EDAChart from "@/components/Chart";
import HistoryChart from "@/components/HistoryChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import Image from 'next/image';

function DetailContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const age = searchParams.get("age") || "N/A";
  const height = searchParams.get("height") || "N/A";
  const stressLevel = searchParams.get("stressLevel") || "Normal";
  const colors = searchParams.get("colors") || "bg-gray-200";

  const handleBackClick = () => {
    window.location.href = "/dashboard";
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
            <FontAwesomeIcon icon={faBackward} /> Back
          </button>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className={`rounded-lg shadow-md p-6 ${colors}`}>
            <h3 className="text-lg font-bold text-white mb-4">Prediction</h3>
            <p className="text-lg font-bold">{stressLevel}</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 text-center">
            <Image src="/profile.png" alt="Profile" width={96} height={96} className="rounded-full" />
            <h2 className="text-xl font-bold text-navy mb-4">{name}</h2>
            <p className="text-sm text-gray-700 mb-2">Age: {age} | Height: {height}</p>
          </div>
        </div>

        <div className="w-full p-4">
          <div className="bg-gray-200 rounded-lg shadow-md p-8">
            <h3 className="text-2xl text-navy font-bold">History</h3>
            <HistoryChart data={[]} />
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
      <DetailContent />
    </Suspense>
  );
}
