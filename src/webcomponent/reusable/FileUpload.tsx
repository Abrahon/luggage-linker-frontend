

'use client';

import React, { FC, useRef, useState, useMemo } from "react";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  label?: string;
  maxSizeMB?: number;
  onFileChange?: (file: File | null) => void; // notify parent of change
}

export const FileUpload: FC<FileUploadProps> = ({
  label = "JPG, PNG or PDF Max 10MB",
  maxSizeMB = 10,
  onFileChange,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Preview is now derived dynamically instead of state in effect
  const preview = useMemo(() => {
    if (!file) return "";
    if (!file.type.startsWith("image/")) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    const fileSizeMB = selectedFile.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      alert(`File size exceeds ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    onFileChange?.(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileChange?.(null);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-400 transition relative"
    >
      {/* Remove button */}
      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeFile();
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Icon or preview */}
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 overflow-hidden">
        {preview ? (
          <Image
            src={preview}
            alt="preview"
            height={400}
            width={400}
            className="w-full h-full object-cover"
          />
        ) : (
          <UploadCloud className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {/* Label */}
      <span className="text-gray-700 font-bold text-center">
        {file ? file.name : label}
      </span>

      {/* Hidden file input */}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.pdf"
      />
    </div>
  );
};
