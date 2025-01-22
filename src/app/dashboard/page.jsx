"use client";

import { useRouter } from "next/navigation";
import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import PieChart from "@/components/PieChart";
import SubjectCard from "@/components/SubjectCard";

export default function DashboardPage() {
    const router = useRouter();
    const [windowWidth, setWindowWidth] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowWidth(window.innerWidth);
        }
    }, []);

    const [summaryData, setSummaryData] = useState({
        normal: 4,
        low: 3,
        medium: 1,
        high: 2,
    });

    const subjects = [
        { name: "Subject A", age: 20, height: 167, stressLevel: "Medium" },
        { name: "Subject B", age: 21, height: 181, stressLevel: "High" },
        { name: "Subject C", age: 18, height: 177, stressLevel: "Low" },
        { name: "Subject D", age: 19, height: 180, stressLevel: "Normal" },
    ];

    const stressLevelColors = {
        High: "bg-red-500 text-white",
        Medium: "bg-orange-500 text-black",
        Low: "bg-yellow-400 text-black",
        Normal: "bg-green-500 text-white",
    };

    const handleMoreClick = (subject) => {
        router.push(
            `/detail?name=${encodeURIComponent(subject.name)}&age=${subject.age}&height=${subject.height}&stressLevel=${subject.stressLevel}&colors=${encodeURIComponent(
                stressLevelColors[subject.stressLevel]
            )}`
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar_DB />
            <div className="flex flex-wrap px-8">
                <div className="w-full md:w-1/2 p-4">
                    <div className="bg-white rounded-lg p-10 shadow-md">
                        <h2 className="text-3xl text-navy mb-4">Summary</h2>
                        <div className="mt-8 w-full h-auto">
                            <PieChart data={summaryData} />
                        </div>
                        <div className="mt-14 grid grid-cols-2 gap-2">
                            <div className="bg-green-500 text-white p-2 text-center rounded-lg">
                                NORMAL: {summaryData.normal} PEOPLE
                            </div>
                            <div className="bg-yellow-400 text-black p-2 text-center rounded-lg">
                                LOW: {summaryData.low} PEOPLE
                            </div>
                            <div className="bg-orange-500 text-black p-2 text-center rounded-lg">
                                MEDIUM: {summaryData.medium} PERSON
                            </div>
                            <div className="bg-red-500 text-white p-2 text-center rounded-lg">
                                HIGH: {summaryData.high} PEOPLE
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-4">
                    <div className="bg-white rounded-lg p-10 shadow-md">
                        <h2 className="text-3xl text-navy font-bold mb-4">Stress Levels</h2>
                        <div className="grid grid-cols-2 gap-4 overflow-y-auto" style={{ maxHeight: "510px" }}>
                            {subjects.map((subject, index) => (
                                <SubjectCard
                                    key={`${subject.name}-${index}`}
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
}
