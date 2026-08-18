import React, { useState } from "react";
import type { CityListItem } from "@repo/models/cities";

interface AddCityModalProps {
  cities: CityListItem[];
  onSubmit: (cityId: string) => void;
  onClose: () => void;
}

export function AddCityModal({ cities, onSubmit, onClose }: AddCityModalProps) {
  const [cityId, setCityId] = useState("");
  const [search, setSearch] = useState("");

  const filtered = cities.filter((c) =>
    `${c.name} ${c.country_name}`.toLowerCase().includes(search.toLowerCase())
  );

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

        <h3 className="text-xl font-bold text-gray-900 mb-1">Add City</h3>
        <p className="text-sm text-gray-500 mb-4">Select a city to add to your offices.</p>

        <input
          type="text"
          placeholder="Filter cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          size={8}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          style={{ height: "180px" }}
        >
          {filtered.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.country_name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3 mt-2">
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
            disabled={!cityId}
            onClick={() => onSubmit(cityId)}
          >
            Add City
          </button>
        </div>
      </div>
    </div>
  );
}
