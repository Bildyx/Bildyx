import React, { useState, useEffect } from "react";
import { Team } from "@repo/models/teams";
import { TeamMember } from "@repo/models/team_members";
import { Job } from "@repo/models/jobs";
import { UserProfileService } from "../../services/user-profile.service";
import { JobService } from "../../services/job.service";
import type { UserProfile } from "@repo/models/user_profiles";
import { useFormValidation } from "../../hooks/useFormValidation";
import ValidatedForm from "../forms/ValidatedForm";
import { PostTeamMemberSchema } from "@repo/models/team_members";
import FormInput from "../forms/FormInput";

const userProfileService = new UserProfileService();
const jobService = new JobService();

const memberFormSchema = PostTeamMemberSchema.omit({ team_id: true });

interface AddTeamMemberModalProps {
  teamId: string;
  initial?: Partial<TeamMember>;
  onSubmit: (
    fullname: string,
    jobId: string,
    avatarFile?: File,
    profileImageUrl?: string,
  ) => void;
  onClose: () => void;
  teams?: Team[];
  members?: TeamMember[];
}

export function AddTeamMemberModal({
  teamId,
  initial,
  onSubmit,
  onClose,
  teams = [],
  members = [],
}: AddTeamMemberModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState(teamId);
  const [name, setName] = useState(initial?.fullname || "");
  const [jobId, setJobId] = useState(initial?.job_id || "");
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initial?.profile_image || undefined,
  );
  const [searchVal, setSearchVal] = useState("");
  const [isExistingMode, setIsExistingMode] = useState(true);
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSearchVal, setJobSearchVal] = useState("");
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  const { errors, validateForm, setErrors } =
    useFormValidation(memberFormSchema);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userProfileService
      .getAll({ excludeOrganizations: true })
      .then((data) => {
        setCandidates(data);
      })
      .catch(console.error);

    jobService
      .getAll()
      .then((data) => {
        setJobs(data);
        if (initial?.job_id) {
          const found = data.find((j) => j.id === initial.job_id);
          if (found) {
            setJobSearchVal(found.title);
          }
        }
      })
      .catch(console.error);
  }, [initial]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const teamMembersCount = members.filter(
    (m) => m.team_id === selectedTeamId,
  ).length;

  const teamMemberNames = members
    .filter((m) => m.team_id === selectedTeamId)
    .map((m) => m.fullname.toLowerCase().trim());

  const filteredCandidates =
    searchVal.trim() === ""
      ? []
      : candidates.filter((c) => {
          const fullName = `${c.first_name || ""} ${c.last_name || ""}`
            .toLowerCase()
            .trim();
          const matchesSearch = fullName.includes(
            searchVal.toLowerCase().trim(),
          );
          const isNotInTeam = !teamMemberNames.includes(fullName);
          return matchesSearch && isNotInTeam;
        });

  const filteredJobs =
    jobSearchVal.trim().length >= 3
      ? jobs.filter((j) =>
          j.title.toLowerCase().includes(jobSearchVal.toLowerCase().trim()),
        )
      : [];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullname: name.trim(),
      job_id: jobId || undefined,
      profile_image: previewUrl || null,
    };
    if (validateForm(payload as any)) {
      setIsSubmitting(true);
      try {
        await onSubmit(name.trim(), jobId, avatarFile, previewUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (initial) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl relative my-8">
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Edit Team Member
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Update job title or profile image for this team member.
          </p>

          <ValidatedForm
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleFormSubmit}
            noValidate
          >
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Job Title
                </label>
                <select
                  value={jobId}
                  onChange={(e) => {
                    setJobId(e.target.value);
                    if (errors.job_id) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.job_id;
                        return next;
                      });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.job_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select job title</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                {errors.job_id && (
                  <small className="text-red-500 text-xs mt-1 block">
                    {errors.job_id}
                  </small>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="rounded-full w-14 h-14 object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="rounded-full w-14 h-14 bg-gray-100 flex items-center justify-center text-gray-700 text-lg font-bold border border-gray-200">
                      {name.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <button
                    type="button"
                    className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                    onClick={() =>
                      document
                        .getElementById("avatar-upload-input-edit")
                        ?.click()
                    }
                  >
                    <i className="bi bi-upload"></i>
                    <span>Change Image</span>
                  </button>
                  <input
                    id="avatar-upload-input-edit"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    );
  }

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

        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Add Team Members
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Add a new or existing member to a team.
        </p>

        <ValidatedForm
          errors={errors}
          setErrors={setErrors}
          onSubmit={handleFormSubmit}
          noValidate
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-400 mt-1">
                {teamMembersCount}/12 members
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Name of Member
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsExistingMode(true);
                    setName("");
                    setPreviewUrl(undefined);
                  }}
                  className={`btn btn-sm rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isExistingMode
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  Select Existing User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExistingMode(false);
                    setName("");
                    setPreviewUrl(undefined);
                  }}
                  className={`btn btn-sm rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    !isExistingMode
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  Add New Member
                </button>
              </div>

              {isExistingMode ? (
                <div>
                  <div
                    className={`flex rounded-lg shadow-sm border focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden ${
                      errors.fullname ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <span className="inline-flex items-center px-3 text-gray-400 bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search job seekers with microresume..."
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      className="w-full py-2 px-1 text-sm bg-white focus:outline-none"
                    />
                  </div>
                  {errors.fullname && (
                    <small className="text-red-500 text-xs mt-1 block">
                      {errors.fullname}
                    </small>
                  )}
                  {searchVal.trim() !== "" && (
                    <div className="border border-gray-200 rounded-lg mt-2 overflow-y-auto max-h-48 divide-y divide-gray-100">
                      {filteredCandidates.length === 0 ? (
                        <div className="text-gray-400 text-center p-3 text-sm">
                          No users found
                        </div>
                      ) : (
                        filteredCandidates.map((c) => {
                          const fullName =
                            `${c.first_name || ""} ${c.last_name || ""}`.trim();
                          const isSelected = name === fullName;
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                setName(fullName);
                                const matchedJob = jobs.find(
                                  (j) =>
                                    j.title.toLowerCase() ===
                                    (c.role || "").toLowerCase(),
                                );
                                if (matchedJob) {
                                  setJobId(matchedJob.id);
                                  setJobSearchVal(matchedJob.title);
                                } else {
                                  setJobId("");
                                  setJobSearchVal(c.role || "");
                                }
                                setPreviewUrl(c.avatar_url || undefined);
                                if (errors.fullname) {
                                  setErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.fullname;
                                    return next;
                                  });
                                }
                              }}
                              className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                              style={{
                                backgroundColor: isSelected
                                  ? "#f1f5f9"
                                  : "transparent",
                              }}
                            >
                              <img
                                src={c.avatar_url || undefined}
                                alt=""
                                className="rounded-full w-8 h-8 object-cover border border-gray-100"
                              />
                              <div className="text-left">
                                <div className="font-semibold text-sm text-gray-900">
                                  {fullName}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {c.role || "Job Seeker"}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <FormInput
                  name="fullname"
                  label=""
                  type="text"
                  placeholder="Jane Parker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.fullname}
                />
              )}
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Job Title
              </label>
              <input
                type="text"
                placeholder="Type at least 3 letters..."
                value={jobSearchVal}
                onFocus={() => setShowJobDropdown(true)}
                onChange={(e) => {
                  setJobSearchVal(e.target.value);
                  setJobId("");
                  setShowJobDropdown(true);
                  if (errors.job_id) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.job_id;
                      return next;
                    });
                  }
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.job_id ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.job_id && (
                <small className="text-red-500 text-xs mt-1 block">
                  {errors.job_id}
                </small>
              )}
              {showJobDropdown && jobSearchVal.trim().length >= 3 && (
                <div className="absolute bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 overflow-y-auto max-h-36 z-50 divide-y divide-gray-100">
                  {filteredJobs.length === 0 ? (
                    <div className="text-gray-400 p-2.5 text-sm">
                      No jobs found
                    </div>
                  ) : (
                    filteredJobs.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => {
                          setJobId(j.id);
                          setJobSearchVal(j.title);
                          setShowJobDropdown(false);
                        }}
                        className="p-2.5 cursor-pointer hover:bg-gray-50 text-sm text-gray-800 text-left transition-colors"
                        style={{
                          backgroundColor:
                            jobId === j.id ? "#f1f5f9" : "transparent",
                        }}
                      >
                        {j.title}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Profile Image
              </label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-center"
                onClick={() =>
                  document.getElementById("avatar-upload-input")?.click()
                }
                style={{ cursor: "pointer", minHeight: "120px" }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="rounded-full w-16 h-16 object-cover border border-gray-200"
                  />
                ) : (
                  <div>
                    <i className="bi bi-upload text-xl text-gray-400 mb-1 block"></i>
                    <span className="font-semibold text-xs block text-gray-700">
                      Click to upload image
                    </span>
                    <small className="text-gray-450 text-[10px]">
                      JPG, PNG up to 5MB
                    </small>
                  </div>
                )}
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-150">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              <i className="bi bi-person-plus text-sm"></i>
              <span>{isSubmitting ? "Adding Member..." : "Add Member"}</span>
            </button>
          </div>
        </ValidatedForm>
      </div>
    </div>
  );
}
