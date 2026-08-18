import React, { useState } from "react";

interface PhotoUploadModalProps {
  onSubmit: (dataUrl: string) => void;
  onClose: () => void;
}

export function PhotoUploadModal({ onSubmit, onClose }: PhotoUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl relative">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="bi bi-x-lg text-lg"></i>
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Add Photos</h3>
        <p className="text-sm text-gray-500 mb-4">Upload photos of your workspace, team, or culture.</p>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors" style={{ minHeight: "150px" }}>
          {!preview ? (
            <div
              onClick={() => document.getElementById("ca-photo-file")?.click()}
              className="cursor-pointer w-full"
            >
              <i className="bi bi-cloud-arrow-up text-3xl text-gray-400 mb-2 block"></i>
              <span className="font-semibold block text-sm text-gray-700">Click to upload photo</span>
              <small className="text-xs text-gray-500">JPG, PNG up to 5MB</small>
            </div>
          ) : (
            <div className="flex items-center gap-4 w-full justify-start">
              <img
                src={preview}
                alt="Preview"
                className="w-28 h-20 rounded-lg object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setPreview(null)}
              >
                Change
              </button>
            </div>
          )}
          <input
            id="ca-photo-file"
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!preview}
            onClick={() => preview && onSubmit(preview)}
          >
            Add Photo
          </button>
        </div>
      </div>
    </div>
  );
}
