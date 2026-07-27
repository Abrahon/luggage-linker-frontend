"use client";

import { useState, useEffect } from "react";
import { useVerification } from "@/app/(protected)/(carrier)/verification/(verification)/VerificationLayOut";
import { FileUpload } from "@/webcomponent/reusable/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const idTypes = [
  { label: "National ID", value: "national_id" },
  { label: "Passport", value: "passport" },
  { label: "Driver's License", value: "drivers_license" },
] as const;

export interface IDVerificationData {
  idType: string;
  idNumber: string;
  front?: File;
  back?: File;
}

interface Props {
  onChange?: (data: IDVerificationData) => void;
}

export const IDVerification = ({ onChange }: Props) => {
  const { setStepComplete } = useVerification();
  const [activeTab, setActiveTab] = useState<string>("national_id");
  const [idNumber, setIdNumber] = useState<string>("");
  const [files, setFiles] = useState<{ front?: File; back?: File }>({});

  useEffect(() => {
    let isValid = false;
    const hasNumber = idNumber.trim().length > 3;

    if (activeTab === "passport") {
      isValid = hasNumber && !!files.front;
    } else {
      isValid = hasNumber && !!files.front && !!files.back;
    }

    setStepComplete(isValid);

    if (onChange) {
      onChange({
        idType: activeTab,
        idNumber,
        front: files.front,
        back: files.back,
      });
    }
  }, [files, activeTab, idNumber, setStepComplete, onChange]);

  const handleFileChange = (key: "front" | "back", file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file || undefined }));
  };

  return (
    <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold">Document Details</h2>

      {/* ID Number Input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="idNumber" className="font-bold text-sm tracking-wide">
          Document ID / Registration Number
        </Label>
        <Input
          id="idNumber"
          placeholder="Enter ID number"
          value={idNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdNumber(e.target.value)}
          className="h-11"
        />
      </div>

      <h2 className="text-lg font-bold mt-2">Select Document Type</h2>

      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v)}>
        <TabsList className="flex gap-2 border rounded-lg p-1 bg-white">
          {idTypes.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              className={`rounded-lg px-4 py-2 font-medium transition-colors duration-200 ${
                activeTab === type.value ? "bg-[#EFF6FF]" : "bg-white hover:bg-gray-100"
              }`}
            >
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="national_id">
          <div className="flex flex-col gap-4 mt-4">
            <FileUpload label="Front Side" onFileChange={(file) => handleFileChange("front", file)} />
            <FileUpload label="Back Side" onFileChange={(file) => handleFileChange("back", file)} />
          </div>
        </TabsContent>

        <TabsContent value="passport">
          <div className="flex flex-col gap-4 mt-4">
            <FileUpload label="Passport Information Page" onFileChange={(file) => handleFileChange("front", file)} />
          </div>
        </TabsContent>

        <TabsContent value="drivers_license">
          <div className="flex flex-col gap-4 mt-4">
            <FileUpload label="Front Side" onFileChange={(file) => handleFileChange("front", file)} />
            <FileUpload label="Back Side" onFileChange={(file) => handleFileChange("back", file)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};