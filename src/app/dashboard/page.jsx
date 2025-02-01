"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dyn from "next/dynamic";
import { useRouter } from "next/navigation";

import Navbar_DB from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import SubjectCard from "@/components/SubjectCard";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/components/firebase";

const PieChart = dyn(() => import("@/components/PieChart"), { ssr: false });

const DashboardPage = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [edaData, setEdaData] = useState([]);
    const [ppgData, setPpgData] = useState([]);
    const [categorizedPpgData, setCategorizedPpgData] = useState([]);
    const [loading, setLoading] = useState(true);

    const intervalRef = useRef(null);

    useEffect(() => {
        setIsClient(typeof window !== "undefined");
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const fetchData = () => {
            setLoading(true);
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

                        let category = "Normal";
                        if (data.PPG_mean > 91) category = "High";
                        else if (data.PPG_mean > 82) category = "Medium";
                        else if (data.PPG_mean > 72) category = "Low";

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

            return unsubscribe;
        };

        const unsubscribe = fetchData();

        intervalRef.current = setInterval(() => {
            fetchData();
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const filteredEdaData = useMemo(() => edaData.slice(-10), [edaData]);
    const filteredPpgData = useMemo(() => ppgData.slice(-10), [ppgData]);
    const filteredCategorizedPpgData = useMemo(() => categorizedPpgData.slice(-10), [categorizedPpgData]);

    const subjectAStressLevel = filteredCategorizedPpgData.length
        ? filteredCategorizedPpgData[filteredCategorizedPpgData.length - 1].category
        : "Normal";

    const subjects = [
        { name: "Subject A", age: 20, height: 167, stressLevel: subjectAStressLevel },
        { name: "Subject B", age: 21, height: 181, stressLevel: "High" },
        { name: "Subject C", age: 18, height: 177, stressLevel: "Low" },
        { name: "Subject D", age: 19, height: 180, stressLevel: "Normal" },
        { name: "Subject E", age: 22, height: 181, stressLevel: "Low" },
        { name: "Subject F", age: 20, height: 177, stressLevel: "Medium" },
        { name: "Subject G", age: 22, height: 170, stressLevel: "High" },
        { name: "Subject H", age: 21, height: 180, stressLevel: "Normal" },
    ];

    const summaryData = useMemo(() => {
        return {
            normal: subjects.filter((s) => s.stressLevel === "Normal").length,
            low: subjects.filter((s) => s.stressLevel === "Low").length,
            medium: subjects.filter((s) => s.stressLevel === "Medium").length,
            high: subjects.filter((s) => s.stressLevel === "High").length,
        };
    }, [subjects]);

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
                                MEDIUM: {summaryData.medium} PEOPLE
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
                        <div className="grid grid-cols-2 gap-4 overflow-y-auto" style={{ maxHeight: "510px" }}>
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
