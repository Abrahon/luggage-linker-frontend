"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, X } from "lucide-react";
import { useVerification } from "@/app/(protected)/(carrier)/verification/(verification)/VerificationLayOut";
import Image from "next/image";

export const SelfieVerification = () => {
  const { setStepComplete, setSelfieBase64 } = useVerification();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Mark step complete if at least 1 photo exists
    const hasPhoto = photos.length > 0;
    setStepComplete(hasPhoto);

    // 2. Pass the latest selfie base64 string to the parent layout context
    if (hasPhoto) {
      setSelfieBase64(photos[photos.length - 1]);
    } else {
      setSelfieBase64("");
    }
  }, [photos, setStepComplete, setSelfieBase64]);

  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPhotos((prev) => [...prev, imageSrc].slice(0, 4));
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotos((prev) => [...prev, reader.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <h2 className="text-lg font-bold">Take or Upload a Quick Selfie</h2>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Camera / Capture / Upload Section */}
      <div className="relative w-64 h-48 mt-4">
        {isCameraOpen ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-gray-300 hover:border-gray-400 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-6 h-6 text-gray-700" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg gap-3 p-4">
            <p className="text-xs font-medium text-gray-500">
              Select an option below
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow transition"
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-xs font-semibold shadow transition"
              >
                <Upload className="w-4 h-4" />
                Upload Pic
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Option Below Live Webcam */}
      {isCameraOpen && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            <Upload className="w-3.5 h-3.5" /> Or upload from device
          </button>
        </div>
      )}

      {/* Captured Photos List */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm"
            >
              <Image
                src={photo}
                alt={`Photo ${idx + 1}`}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
              <span className="absolute top-1 left-1 px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-600 hover:text-red-500 shadow"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};