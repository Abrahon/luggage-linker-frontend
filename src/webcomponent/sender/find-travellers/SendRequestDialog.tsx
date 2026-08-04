"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BackendTrip } from "@/api/trip.api";

interface SendRequestDialogProps {
  setOpen: (open: boolean) => void;
  trip: BackendTrip | null;
}

export const SendRequestDialog = ({ setOpen, trip }: SendRequestDialogProps) => {
  const [weight, setWeight] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [checkboxes, setCheckboxes] = useState([false, false, false]);

  if (!trip) return null;

  const travellerData = [
    { label: "From", value: `${trip.from_city}, ${trip.from_country}` },
    { label: "To", value: `${trip.to_city}, ${trip.to_country}` },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Departure",
      value: trip.departure_date,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Arrival",
      value: trip.arrival_date,
    },
    { label: "Price / kg", value: `$${trip.reward_per_kg} ${trip.currency}` },
    { label: "Available Space", value: `${trip.available_weight_kg} kg` },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckbox = (index: number) => {
    const updated = [...checkboxes];
    updated[index] = !updated[index];
    setCheckboxes(updated);
  };

  const allChecked = checkboxes.every(Boolean);
  const formComplete =
    weight !== "" &&
    Number(weight) > 0 &&
    Number(weight) <= Number(trip.available_weight_kg) &&
    message.trim() !== "" &&
    allChecked;

  return (
    <div className="flex flex-col gap-6 font-montserrat">
      <div className="grid grid-cols-2 gap-4">
        {travellerData.map((item, index) => (
          <div className="flex flex-col gap-1" key={index}>
            <span className="font-semibold text-xs text-gray-500">{item.label}</span>
            <div
              className={`border rounded-lg bg-gray-50 border-gray-200 p-2 text-sm font-medium ${
                item.icon ? "flex items-center gap-2" : ""
              }`}
            >
              {item.icon && item.icon}
              <span className="truncate">{item.value}</span>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-1 col-span-2">
          <Label className="font-semibold text-xs">
            Sender Product Weight (Max: {trip.available_weight_kg} kg)
          </Label>
          <Input
            placeholder="Enter weight in kg"
            type="number"
            max={Number(trip.available_weight_kg)}
            value={weight}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(Number(e.target.value))}
            className="outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label className="font-semibold text-xs">Write a request message</Label>
          <textarea
            value={message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            placeholder="Type details about your items..."
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            rows={3}
          />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition">
          <label className="flex flex-col items-center cursor-pointer">
            <div className="bg-gray-100 rounded-full p-2">
              <Upload className="w-5 h-5 text-gray-500" />
            </div>
            <span className="mt-1 text-xs font-semibold text-gray-700">Tap To Upload Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((src, index) => (
              <div key={index} className="relative w-[50px] h-[50px]">
                <Image
                  src={src}
                  alt={`upload-${index}`}
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute -top-1 -right-1 bg-white rounded-full shadow p-0.5"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {[
            "I confirm this package does not contain prohibited or hazardous materials.",
            "I understand that my package may be subject to inspection.",
            "I agree to comply with all shipping regulations and terms.",
          ].map((text, index) => (
            <label key={index} className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={checkboxes[index]}
                onChange={() => handleCheckbox(index)}
                className="mt-0.5"
              />
              <span className="text-gray-600">{text}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            disabled={!formComplete}
            onClick={() => {
              console.log("Booking request submitted for trip:", trip.id);
              setOpen(false);
            }}
            className="px-6 bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
};