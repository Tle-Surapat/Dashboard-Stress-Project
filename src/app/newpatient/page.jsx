"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar_DB";
import Footer from "@/components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    age: "",
    weight: "",
    height: "",
    congenitalDiseases: "",
    skinType: "",
    timeToSleep: "",
    deviceId: "",
    gender: "",
  });

  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload with expected API property names & types
    const payload = {
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: Number(formData.height),
      CD: formData.congenitalDiseases.trim() || "-",
      skinType: formData.skinType,
      timeToSleep: formData.timeToSleep,
      device_id: formData.deviceId,
      gender: formData.gender, // <-- added
    };

    // Validation lists
    const validSkinTypes = [
      "Type 1", "Type 2", "Type 3", "Type 4", "Type 5", "Type 6"
    ];
    const validTimeToSleep = ["6 - 8 hours", "Less than 8 hours", "More than 8 hours"];

    // Basic validation
    if (!payload.name || !payload.surname || !payload.device_id) {
      toast.error("Name, surname, and device ID cannot be empty.");
      return;
    }

    if (
      isNaN(payload.age) ||
      isNaN(payload.weight) ||
      isNaN(payload.height) ||
      payload.age <= 0 ||
      payload.weight <= 0 ||
      payload.height <= 0
    ) {
      toast.error("Age, weight, and height must be valid positive numbers.");
      return;
    }

    if (!validSkinTypes.includes(payload.skinType)) {
      toast.error("Please select a valid skin type.");
      return;
    }

    if (!validTimeToSleep.includes(payload.timeToSleep)) {
      toast.error("Please select a valid time to sleep.");
      return;
    }

    if (!payload.gender) {
      toast.error("Please select a gender.");
      return;
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API + "personal-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Patient added successfully!");
        setFormData({
          name: "",
          surname: "",
          age: "",
          weight: "",
          height: "",
          congenitalDiseases: "",
          skinType: "",
          timeToSleep: "",
          deviceId: "",
          gender: "",
        });
        setTimeout(() => router.push("/dashboard"), 5000); // Delay to show toast
      } else {
        const errorData = await res.json();
        toast.error("Error adding patient: " + (errorData.message || res.statusText));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to server.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />
      <div className="flex flex-1 justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <Link href="/dashboard">
              <button className="text-sm text-navy hover:underline">&larr; Back</button>
            </Link>
            <h2 className="text-2xl font-semibold text-navy">New Patient</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Surname", name: "surname", type: "text" },
              { label: "Age", name: "age", type: "number" },
              { label: "Weight", name: "weight", type: "number" },
              { label: "Height", name: "height", type: "number" },
              { label: "Congenital Diseases", name: "congenitalDiseases", type: "text", placeholder: "-" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Skin Type Reference Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skin Type Reference
              </label>
              <div className="space-y-4">
                <img
                  src="/skintype01.png"
                  alt="Skin Type Reference 1"
                  className="w-full max-w-md object-contain rounded shadow"
                />
                <img
                  src="/skintype02.png"
                  alt="Skin Type Reference 2"
                  className="w-full max-w-md object-contain rounded shadow"
                />
              </div>
            </div>

            {/* Skin Type */}
            <div>
              <label htmlFor="skinType" className="block text-sm font-medium text-gray-700 mb-1">Skin Type</label>
              <select
                id="skinType"
                name="skinType"
                value={formData.skinType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              >
                <option value="">Select Skin Type</option>
                <option value=" ">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="Type 3">Type 3</option>
                <option value="Type 4">Type 4</option>
                <option value="Type 5">Type 5</option>
                <option value=" ">Type 6</option>
              </select>
            </div>

            {/* Sleep Time */}
            <div>
              <label htmlFor="timeToSleep" className="block text-sm font-medium text-gray-700 mb-1">Time to Sleep</label>
              <select
                id="timeToSleep"
                name="timeToSleep"
                value={formData.timeToSleep}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              >
                <option value="">Select Time to Sleep</option>
                <option value="Less than 8 hours">Less than 8 hours</option>
                <option value="More than 8 hours">More than 8 hours</option>
                <option value="6 - 8 hours">6 - 8 hours</option>
              </select>
            </div>

            {/* Device ID */}
            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
              <select
                id="deviceId"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              >
                <option value="">Select Device ID</option>
                <option value="Emotibit-001">Emotibit-001</option>
                <option value="MD-V5-0000560">MD-V5-0000560</option>
                <option value="MD-V5-0001071">MD-V5-0001071</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-navy text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
