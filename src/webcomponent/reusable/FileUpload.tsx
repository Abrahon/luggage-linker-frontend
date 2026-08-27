

// 'use client';

// import React, { FC, useRef, useState, useMemo } from "react";
// import { UploadCloud, X } from "lucide-react";
// import Image from "next/image";

// interface FileUploadProps {
//   label?: string;
//   maxSizeMB?: number;
//   onFileChange?: (file: File | null) => void; // notify parent of change
// }

// export const FileUpload: FC<FileUploadProps> = ({
//   label = "JPG, PNG or PDF Max 10MB",
//   maxSizeMB = 10,
//   onFileChange,
// }) => {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [file, setFile] = useState<File | null>(null);

//   // Preview is now derived dynamically instead of state in effect
//   const preview = useMemo(() => {
//     if (!file) return "";
//     if (!file.type.startsWith("image/")) return "";
//     return URL.createObjectURL(file);
//   }, [file]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0] || null;
//     if (!selectedFile) return;

//     const fileSizeMB = selectedFile.size / 1024 / 1024;
//     if (fileSizeMB > maxSizeMB) {
//       alert(`File size exceeds ${maxSizeMB}MB`);
//       return;
//     }

//     setFile(selectedFile);
//     onFileChange?.(selectedFile);
//   };

//   const removeFile = () => {
//     setFile(null);
//     if (inputRef.current) inputRef.current.value = "";
//     onFileChange?.(null);
//   };

//   return (
//     <div
//       onClick={() => inputRef.current?.click()}
//       className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-400 transition relative"
//     >
//       {/* Remove button */}
//       {file && (
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             removeFile();
//           }}
//           className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       )}

//       {/* Icon or preview */}
//       <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 overflow-hidden">
//         {preview ? (
//           <Image
//             src={preview}
//             alt="preview"
//             height={400}
//             width={400}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <UploadCloud className="w-8 h-8 text-gray-600" />
//         )}
//       </div>

//       {/* Label */}
//       <span className="text-gray-700 font-bold text-center">
//         {file ? file.name : label}
//       </span>

//       {/* Hidden file input */}
//       <input
//         type="file"
//         ref={inputRef}
//         className="hidden"
//         onChange={handleFileChange}
//         accept=".jpg,.jpeg,.png,.pdf"
//       />
//     </div>
//   );
// };


'use client';

import React, { FC, useRef, useState, useMemo, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

export interface FileUploadProps {
  label?: string;
  maxSizeMB?: number;
  initialPreview?: string | null;
  onFileChange?: (file: File | null) => void;
  onRemove?: () => void;
}

export const FileUpload: FC<FileUploadProps> = ({
  label = "JPG, PNG or PDF Max 10MB",
  maxSizeMB = 10,
  initialPreview,
  onFileChange,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null | undefined>(initialPreview);

  // Sync existing remote image when initialPreview prop changes
  useEffect(() => {
    setExistingUrl(initialPreview);
  }, [initialPreview]);

  // Derive preview URL: local object URL takes priority over initial remote URL
  const preview = useMemo(() => {
    if (file && file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return existingUrl || "";
  }, [file, existingUrl]);

  // Clean up object URLs from memory when file unmounts or changes
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
    setExistingUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileChange?.(null);
    onRemove?.();
  };

  const hasContent = Boolean(file || existingUrl);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-400 transition relative"
    >
      {/* Remove button */}
      {hasContent && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeFile();
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Icon or image preview */}
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 overflow-hidden relative">
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

      {/* Label / File name display */}
      <span className="text-gray-700 font-bold text-center text-sm">
        {file ? file.name : existingUrl ? "Existing Document Loaded" : label}
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

export default FileUpload;