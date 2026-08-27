"use client";

import { useEffect } from "react";
import { FileUpload } from "@/webcomponent/reusable/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerification } from "@/app/(protected)/(carrier)/verification/(verification)/VerificationLayOut";

const idTypes = [
  { label: "National ID", value: "national_id" },
  { label: "Passport", value: "passport" },
  { label: "Driver's License", value: "driving_license" },
] as const;

export const IDVerification = () => {
  const { setStepComplete, idData, setIdData } = useVerification();

  useEffect(() => {
    const hasValidNumber = idData.idNumber.trim().length >= 6;
    
    // Check for either a newly uploaded File OR an existing image URL
    const hasFront = Boolean(idData.front || idData.frontPreviewUrl);
    const hasBack = Boolean(idData.back || idData.backPreviewUrl);

    let isValid = false;

    if (idData.idType === "passport") {
      isValid = hasValidNumber && hasFront;
    } else {
      isValid = hasValidNumber && hasFront && hasBack;
    }

    setStepComplete(isValid);
  }, [idData, setStepComplete]);

  const handleTypeChange = (val: string) => {
    setIdData((prev) => ({
      ...prev,
      idType: val as any,
    }));
  };

  const handleFileChange = (key: "front" | "back", file: File | null) => {
    setIdData((prev) => ({
      ...prev,
      [key]: file || undefined,
      // If user replaces/clears file, update corresponding URL state
      [key === "front" ? "frontPreviewUrl" : "backPreviewUrl"]: file 
        ? URL.createObjectURL(file) 
        : undefined,
    }));
  };

  const handleRemoveExisting = (key: "front" | "back") => {
    setIdData((prev) => ({
      ...prev,
      [key]: undefined,
      [key === "front" ? "frontPreviewUrl" : "backPreviewUrl"]: undefined,
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <Label htmlFor="idNumber" className="font-semibold text-sm">
          Document Registration Number (Min 6 characters)
        </Label>
        <Input
          id="idNumber"
          placeholder="e.g. A123456789"
          value={idData.idNumber}
          onChange={(e) => setIdData((prev) => ({ ...prev, idNumber: e.target.value }))}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label className="font-semibold text-sm">Document Type</Label>
        <Tabs value={idData.idType} onValueChange={handleTypeChange}>
          <TabsList className="grid grid-cols-3 w-full bg-gray-100 p-1 rounded-xl">
            {idTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value} className="rounded-lg text-xs font-semibold">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="national_id" className="flex flex-col gap-4 mt-4">
            <FileUpload
              label="ID Front Side"
              initialPreview={idData.frontPreviewUrl}
              onFileChange={(f) => handleFileChange("front", f)}
              onRemove={() => handleRemoveExisting("front")}
            />
            <FileUpload
              label="ID Back Side"
              initialPreview={idData.backPreviewUrl}
              onFileChange={(f) => handleFileChange("back", f)}
              onRemove={() => handleRemoveExisting("back")}
            />
          </TabsContent>

          <TabsContent value="passport" className="flex flex-col gap-4 mt-4">
            <FileUpload
              label="Passport Information Page"
              initialPreview={idData.frontPreviewUrl}
              onFileChange={(f) => handleFileChange("front", f)}
              onRemove={() => handleRemoveExisting("front")}
            />
          </TabsContent>

          <TabsContent value="driving_license" className="flex flex-col gap-4 mt-4">
            <FileUpload
              label="License Front Side"
              initialPreview={idData.frontPreviewUrl}
              onFileChange={(f) => handleFileChange("front", f)}
              onRemove={() => handleRemoveExisting("front")}
            />
            <FileUpload
              label="License Back Side"
              initialPreview={idData.backPreviewUrl}
              onFileChange={(f) => handleFileChange("back", f)}
              onRemove={() => handleRemoveExisting("back")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};