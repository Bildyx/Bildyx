import React, { useState, useRef, useEffect } from "react";
import type { CityListItem } from "@repo/models/cities";

interface AddCityModalProps {
  cities: CityListItem[];
  onSubmit: (cityId: string, officeType: string) => void;
  onClose: () => void;
}

const OFFICE_TYPES = [
  "Head Office",
  "Back Office",
  "Customer Support Center",
  "Data Center",
  "Delivery Center",
  "Distribution/Fulfillment Center",
  "Headquarters",
  "Hub/Depot/Terminal",
  "Liaison/Representative Office",
  "Management/Business Operations",
  "Manufacturing Plant/Factory/Facility",
  "Network Operations Center (NOC)/Control Center",
  "Payments Hub",
  "Procurement/Sourcing Hub",
  "R&D Center/Lab/Incubator",
  "Regional Headquarters",
  "Sales/Business Development",
  "Satellite/Branch Office",
  "Shared Services Center (SSC)",
  "Showroom",
  "Software Development Center",
  "Studio",
  "Tax/Treasury Center",
  "Training Center"
];

export function AddCityModal({ cities, onSubmit, onClose }: AddCityModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityListItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [officeType, setOfficeType] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = search.trim();
  const filtered = trimmed.length >= 3
    ? cities.filter((c) =>
        `${c.name} ${c.country_name}`.toLowerCase().includes(trimmed.toLowerCase())
      )
    : [];

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setSelectedCity(null);
    setShowDropdown(val.trim().length >= 3);
  };

  const handleSelectCity = (city: CityListItem) => {
    setSelectedCity(city);
    setSearch(`${city.name}, ${city.country_name}`);
    setShowDropdown(false);
  };

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
        <p className="text-sm text-gray-500 mb-4">Type at least 3 characters to search for a city.</p>

        {/* Search Combobox Container */}
        <div className="relative mb-4" ref={dropdownRef}>
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (search.trim().length >= 3) {
                  setShowDropdown(true);
                }
              }}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Dropdown Overlay */}
          {showDropdown && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No cities found
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {c.name}, {c.country_name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Office Type Select */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Type of Office
          </label>
          <select
            value={officeType}
            onChange={(e) => setOfficeType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select type of office</option>
            {OFFICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
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
            disabled={!selectedCity || !officeType}
            onClick={() => selectedCity && onSubmit(selectedCity.id, officeType)}
          >
            Add City
          </button>
        </div>
      </div>
    </div>
  );
}
