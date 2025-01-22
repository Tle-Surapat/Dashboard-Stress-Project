"use client";

import { useEffect, useState } from "react";
import dyn from "next/dynamic";  // Alias 'dynamic' to 'dyn' to avoid conflicts
import { useRouter } from "next/navigation";

import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import SubjectCard from "@/components/SubjectCard";

// Dynamically import PieChart to prevent SSR issues
const PieChart = dyn(() => import("@/components/PieChart"), { ssr: false });

// Force dynamic rendering to avoid SSR issues
export const dynamicRendering = "force-dynamic";

const DashboardPage = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(typeof window !== "undefined");
    }, []);

    const summaryData = {
        normal: 4,
        low: 3,
        medium: 1,
        high: 2,
    };

    const subjects = [
        { name: "Subject A", age: 20, height: 167, stressLevel: "Medium" },
        { name: "Subject B", age: 21, height: 181, stressLevel: "High" },
        { name: "Subject C", age: 18, height: 177, stressLevel: "Low" },
        { name: "Subject D", age: 19, height: 180, stressLevel: "Normal" },
        { name: "Subject E", age: 22, height: 181, stressLevel: "Low" },
        { name: "Subject F", age: 20, height: 177, stressLevel: "Medium" },
        { name: "Subject G", age: 22, height: 170, stressLevel: "High" },
        { name: "Subject H", age: 21, height: 180, stressLevel: "Normal" },
    ];

    const stressLevelColors = {
        High: "bg-red text-white",
        Medium: "bg-orange text-black",
        Low: "bg-yellow text-black",
        Normal: "bg-green text-white",
    };

    const handleMoreClick = (subject) => {
        router.push(
            `/detail?name=${encodeURIComponent(subject.name)}&age=${subject.age}&height=${subject.height}&stressLevel=${subject.stressLevel}&colors=${encodeURIComponent(stressLevelColors[subject.stressLevel])}`
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar_DB />
            <div className="flex flex-wrap px-8 py-6">
                {/* Summary Section */}
                <div className="w-full md:w-1/2 p-4">
                    <div className="bg-white rounded-lg p-10 shadow-md">
                        <h2 className="text-3xl text-navy mb-4">Summary</h2>
                        <div className="mt-8 w-full h-auto">
                            {isClient ? <PieChart data={summaryData} /> : <div>Loading chart...</div>}
                        </div>
                        <div className="mt-14 grid grid-cols-2 gap-2">
                            <div className="bg-green text-white p-2 text-center rounded-lg">
                                NORMAL: {summaryData.normal} PEOPLE
                            </div>
                            <div className="bg-yellow text-black p-2 text-center rounded-lg">
                                LOW: {summaryData.low} PEOPLE
                            </div>
                            <div className="bg-orange text-white p-2 text-center rounded-lg">
                                MEDIUM: {summaryData.medium} PERSON
                            </div>
                            <div className="bg-red text-black p-2 text-center rounded-lg">
                                HIGH: {summaryData.high} PEOPLE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stress Levels Section */}
                <div className="w-full md:w-1/2 p-4">
                    <div className="bg-white rounded-lg p-10 shadow-md">
                        <h2 className="text-3xl text-navy font-bold mb-4">Stress Levels</h2>
                        {/* Grid Container */}
                        <div
                            className="grid grid-cols-2 gap-4 overflow-y-auto"
                            style={{ maxHeight: "510px" }} // Adjusted height for 4 rows
                        >
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
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardPage;
