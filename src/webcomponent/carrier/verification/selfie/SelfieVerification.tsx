"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, X } from "lucide-react";
import { useVerification } from "@/app/(protected)/(carrier)/verification/(verification)/VerificationLayOut";
import Image from "next/image";

export const SelfieVerification = () => {
  const { setStepComplete, selfieBase64, setSelfieBase64 } = useVerification();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStepComplete(!!selfieBase64);
  }, [selfieBase64, setStepComplete]);

  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setSelfieBase64(imageSrc);
      setIsCameraOpen(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setSelfieBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

      {selfieBase64 ? (
        <div className="relative w-64 h-64 rounded-xl overflow-hidden border border-gray-200 shadow-md">
          <Image src={selfieBase64} alt="Selfie Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => setSelfieBase64("")}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 p-1.5 rounded-full shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isCameraOpen ? (
        <div className="relative w-full max-w-sm h-64 rounded-xl overflow-hidden border">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/png" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          >
            <Camera className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-4 bg-gray-50">
          <p className="text-xs text-gray-500 font-medium">Capture live selfie or upload an image file</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Use Camera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};