"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  projectId?: string;
}

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export function UploadZone({ onUpload, accept = ".csv,.txt,.pdf,.xlsx,.xls,.json", multiple = true }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" as const })));

    try {
      await onUpload(files.map((f) => f.file));
      setFiles((prev) => prev.map((f) => ({ ...f, status: "complete" as const })));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) => prev.map((f) => ({ ...f, status: "error" as const, error: message })));
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/50"
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={`h-10 w-10 mx-auto mb-4 ${isDragOver ? "text-brand-500" : "text-gray-400"}`} />
        <p className="text-sm font-medium text-gray-700">
          Drop files here or <span className="text-brand-600">browse</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supports CSV, TXT, PDF, Excel, and JSON files. Upload incident logs, maintenance records, chemical inventories, or training records.
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>
              {uploadedFile.status === "complete" && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {uploadedFile.status === "error" && (
                <span className="text-xs text-red-600">{uploadedFile.error}</span>
              )}
              {uploadedFile.status === "pending" && (
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {files.some((f) => f.status === "pending") && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary w-full"
            >
              {isUploading ? "Uploading..." : `Upload ${files.filter((f) => f.status === "pending").length} file(s)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
