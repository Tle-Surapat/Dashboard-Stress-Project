// components/EDADataFetcher.js
"use client";

import { useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/components/firebase";

const EDADataFetcher = ({ path, setEdaData, setLoading }) => {
  useEffect(() => {
    if (!path) {
      console.error("Firestore path is undefined or empty.");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, ...path.split("/")), // Split the Firestore path
      (querySnapshot) => {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        const data = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const edaArray = Array.isArray(docData.EDA_array) ? docData.EDA_array : [];
          const timestamp = docData.Timestamp * (docData.Timestamp < 1e12 ? 1000 : 1);

          if (timestamp >= oneMinuteAgo && timestamp <= now) {
            const time = new Intl.DateTimeFormat("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
              timeZone: "Asia/Bangkok",
            }).format(new Date(timestamp));

            edaArray.forEach((value) => {
              data.push({ time, value });
            });
          }
        });

        setEdaData(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching real-time data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup the subscription on unmount
  }, [path, setEdaData, setLoading]);

  return null;
};

export default EDADataFetcher;
