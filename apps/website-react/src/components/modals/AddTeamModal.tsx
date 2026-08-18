import React, { useState } from "react";
import { OrganizationOffice } from "@repo/models/organization_offices";
import type { CityListItem } from "@repo/models/cities";
import { Subject } from "@repo/models/subjects";
import { TeamSubject } from "@repo/models/team_subjects";

const TEAM_TYPES = [
  "Operate",
  "Develop",
  "Design",
  "Product",
  "Q&A",
  "Support",
  "Marketing",
  "Sales",
  "Management",
];

interface AddTeamModalProps {
  offices: OrganizationOffice[];
  cities: CityListItem[];
  onSubmit: (name: string, type: string, cityId: string) => void;
  onClose: () => void;
  teamSubjects?: TeamSubject[];
  allSubjects?: Subject[];
}

export function AddTeamModal({
  offices,
  cities,
  onSubmit,
  onClose,
  teamSubjects = [],
  allSubjects = [],
}: AddTeamModalProps) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [cityId, setCityId] = useState("");
  const [brand, setBrand] = useState("");
  const [productService, setProductService] = useState("");

  const officeCities = offices
    .map((o) => cities.find((c) => c.id === o.city_id))
    .filter(Boolean) as CityListItem[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative my-8">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="bi bi-x-lg text-lg"></i>
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Add New Team</h3>
        <p className="text-sm text-gray-500 mb-6">Fill in the details to create a new team.</p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Team Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select team type</option>
              {TEAM_TYPES.map((t) => (
                <option value={t} key={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name of Team</label>
            <input
              type="text"
              placeholder="e.g. Team Epsilon"
              value={name}
              maxLength={35}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {name.length}/35
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="PUBLIC">Public Team</option>
              <option value="PRIVATE">Private Team</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City</label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select city</option>
              {officeCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select brand (optional)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Product / Service</label>
            <select
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">None</option>
              {allSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-150">
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
            disabled={!name.trim() || !cityId || !type}
            onClick={() => onSubmit(name.trim(), type, cityId)}
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
}
