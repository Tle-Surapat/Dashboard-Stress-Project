"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EditProfileModal({ isOpen, onClose, personalData, onSave, deviceOptions }) {
  const [formData, setFormData] = useState(personalData || {});
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setFormData(personalData || {});
    }
  }, [isOpen, personalData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.deviceId) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      const payload = {
        ...formData,
        deviceId: formData.deviceId || "",
      };

      const res = await fetch(process.env.NEXT_PUBLIC_API + "personal-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        onSave(formData);
        onClose();
      } else {
        const errorData = await res.json();
        toast.error("Failed to update: " + (errorData.message || res.statusText));
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error, please try again.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this profile?");
    if (!confirmDelete) return;

    const id = personalData?._id || formData?._id;

    if (!id) {
      toast.error("Missing ID, cannot delete profile.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}personal-data/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toast.success("Profile deleted successfully!");
        onSave(null);
        onClose();

        setTimeout(() => {
          router.push("/dashboard");
        }, 500); // รอให้ modal ปิดและ toast แสดงก่อน redirect
      } else {
        const errorData = await res.json();
        toast.error("Failed to delete: " + (errorData.message || res.statusText));
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error, please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-navy text-lg font-bold mb-4">Edit Personal Info</Dialog.Title>

          <div className="space-y-3">
            {["name", "surname", "age", "weight", "height", "CD"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-900 capitalize">{field}</label>
                <input
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className="text-gray-900 w-full p-2 border rounded-md text-sm"
                />
              </div>
            ))}

            {/* Gender (read-only) */}
            <div>
              <label className="block text-sm text-gray-900 capitalize">Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender || ""}
                disabled
                className="text-black w-full p-2 border rounded-md text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Device ID (editable dropdown) */}
            <div>
              <label className="block text-sm text-gray-900 capitalize">Device ID</label>
              <select
                name="deviceId"
                value={formData.deviceId || ""}
                onChange={handleChange}
                className="text-gray-900 w-full p-2 border rounded-md text-sm"
              >
                <option value="">Select device</option>
                {(deviceOptions || []).map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm rounded bg-red hover:bg-red-700 text-white"
            >
              Delete Profile
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded bg-navy text-white hover:bg-navy/80"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
