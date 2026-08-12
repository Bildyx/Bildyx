import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CaModal from "../components/CaModal";
import { usePageMeta } from "../hooks/usePageMeta";
import { toast } from "../lib/toast";
import {
  readCompanyProfile,
  writeCompanyProfile,
  uid,
  type CompanyConProfile,
  type NamedItem,
  type Photo,
  type Team,
  type TeamMember,
  type TeamProfile,
} from "../lib/companyProfile";
import "../css/company_con_admin.css";

const TEAM_TYPES = [
  "Customer Success",
  "Growth & Product Development",
  "Innovation & Project-Based",
  "Market Expansion",
  "Process Improvement",
  "Administration",
  "Business Planning and Strategy",
  "Customer Support",
  "Data & Analytics",
  "Design & UX",
  "Engineering & Development",
  "Finance & Accounting",
  "Human Resources",
  "Legal & Compliance",
  "Marketing & Communications",
  "Operations",
  "Product Management",
];

const PROFILE_FIELDS_PEOPLE: [string, keyof TeamProfile, boolean?][] = [
  ["Who We Are", "who"],
  ["What We're Great At", "great"],
  ["Team Culture", "culture"],
  ["How We Work Together", "work"],
  ["This team is NOT for you if...", "notFor", true],
];

const PROFILE_FIELDS_OPERATE: [string, keyof TeamProfile][] = [
  ["How We're Led", "led"],
  ["What We're Solving Now", "solving"],
  ["A Typical Day", "day"],
  ["What We Value", "value"],
  ["Growth Here", "growth"],
];

type ModalName = "team" | "member" | "editMember" | "city" | "product" | "brand" | "parent" | "photo" | "partner" | "customer" | "investor" | "subsidiary" | null;

function checkSessionGuard(navigate: (path: string) => void) {
  const raw = sessionStorage.getItem("bildyx_session") || localStorage.getItem("bildyx_session");
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    const type = String(session.accountType || session.role || "").toLowerCase().replace(/[\s_-]/g, "");
    if (type && type !== "company") navigate("/profile");
  } catch {
    // ignore malformed session
  }
}

export default function CompanyAdmin() {
  usePageMeta("Company Admin — Bildyx", "Create and manage your connected company profile on Bildyx.");
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyConProfile>(() => readCompanyProfile() || {});
  const [activeTeamId, setActiveTeamId] = useState<string | null>(profile.teams?.[0]?.id || null);
  const [mode, setMode] = useState<"people" | "operate">("people");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<TeamProfile>({});
  const [modal, setModal] = useState<ModalName>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  useEffect(() => checkSessionGuard(navigate), [navigate]);

  function persist(next: CompanyConProfile) {
    setProfile(next);
    writeCompanyProfile(next);
  }

  const teams = profile.teams || [];
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0] || null;
  const members = (profile.members || []).filter((m) => !activeTeam || !m.teamId || m.teamId === activeTeam.id);
  const offices = profile.offices || [];
  const products = profile.products || [];
  const teamProfile = activeTeam ? profile.teamProfiles?.[activeTeam.id] : undefined;

  // ─── Teams ──────────────────────────────────────────────────
  function addTeam(name: string, type: string) {
    const team: Team = { id: uid(), name, type };
    const next = { ...profile, teams: [...teams, team] };
    persist(next);
    setActiveTeamId(team.id);
    setModal(null);
  }

  function deleteTeam(id: string) {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    const next: CompanyConProfile = {
      ...profile,
      teams: teams.filter((t) => t.id !== id),
      members: (profile.members || []).filter((m) => m.teamId !== id),
      teamProfiles: Object.fromEntries(Object.entries(profile.teamProfiles || {}).filter(([tid]) => tid !== id)),
    };
    persist(next);
    if (activeTeamId === id) setActiveTeamId(next.teams?.[0]?.id || null);
  }

  // ─── Members ────────────────────────────────────────────────
  function saveMember(member: TeamMember) {
    const existing = profile.members || [];
    const isNew = !existing.some((m) => m.id === member.id);
    const next = { ...profile, members: isNew ? [...existing, member] : existing.map((m) => (m.id === member.id ? member : m)) };
    persist(next);
    setModal(null);
    setEditingMemberId(null);
  }

  function deleteMember(id: string) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    persist({ ...profile, members: (profile.members || []).filter((m) => m.id !== id) });
  }

  function toggleLeader(id: string) {
    const member = (profile.members || []).find((m) => m.id === id);
    if (!member || !member.teamId) {
      toast.error("This member is not assigned to a team.");
      return;
    }
    const nextMembers = (profile.members || []).map((m) => {
      if (m.id === id) return { ...m, isLeader: !m.isLeader };
      if (m.teamId === member.teamId && !member.isLeader) return { ...m, isLeader: false };
      return m;
    });
    persist({ ...profile, members: nextMembers });
    toast.success(member.isLeader ? `"${member.name}" is no longer the team leader.` : `"${member.name}" is now the team leader.`);
  }

  // ─── Offices / Products ────────────────────────────────────
  function addNamedItem(key: "offices" | "products" | "brands", name: string) {
    const list = (profile[key] as NamedItem[] | undefined) || [];
    const next = { ...profile, [key]: [...list, { id: uid(), name }] };
    persist(next);
    setModal(null);
  }

  function removeNamedItem(key: "offices" | "products" | "brands", id: string) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const list = (profile[key] as NamedItem[] | undefined) || [];
    persist({ ...profile, [key]: list.filter((item) => item.id !== id) });
  }

  // ─── Team profile ───────────────────────────────────────────
  function startEditProfile() {
    setProfileDraft(activeTeam && profile.teamProfiles?.[activeTeam.id] ? { ...profile.teamProfiles[activeTeam.id] } : {});
    setIsEditingProfile(true);
  }

  function saveProfileEdit() {
    if (!activeTeam) return;
    const next = { ...profile, teamProfiles: { ...profile.teamProfiles, [activeTeam.id]: profileDraft } };
    persist(next);
    setIsEditingProfile(false);
    toast.success("The team profile has been updated.");
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => persist({ ...profile, logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  // ─── Org-linked sections (Partners/Customers/Investors/Subsidiaries) ────
  function addOrgItem(key: "partners" | "customers" | "investors" | "subsidiaries", name: string) {
    const list = (profile[key] as NamedItem[] | undefined) || [];
    persist({ ...profile, [key]: [...list, { id: uid(), name }] });
    setModal(null);
  }

  function removeOrgItem(key: "partners" | "customers" | "investors" | "subsidiaries", id: string) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const list = (profile[key] as NamedItem[] | undefined) || [];
    persist({ ...profile, [key]: list.filter((item) => item.id !== id) });
  }

  // ─── Photos ─────────────────────────────────────────────────
  const teamPhotos = (profile.photos || []).filter((p) => !activeTeam || !p.teamId || p.teamId === activeTeam.id);

  function addPhoto(dataUrl: string) {
    if (teamPhotos.length >= 10) {
      toast.warning("You can add up to 10 photos per team.");
      return;
    }
    const photo: Photo = { id: uid(), url: dataUrl, teamId: activeTeam?.id };
    persist({ ...profile, photos: [...(profile.photos || []), photo] });
    setModal(null);
  }

  function removePhoto(id: string) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    persist({ ...profile, photos: (profile.photos || []).filter((p) => p.id !== id) });
  }

  const editingMember = editingMemberId ? (profile.members || []).find((m) => m.id === editingMemberId) : null;

  return (
    <>
      <Header mode="company-admin" centerLabel="F-CAREER" backHref="/company-con" backLabel="‹ Preview company page" statusLabel="Unpublished" />

      <main className="ca-page">
        <div className="ca-shell">
          <aside className="ca-left">
            <section className="ca-profile-box">
              <label className="ca-logo" style={profile.logoUrl ? { backgroundImage: `url(${profile.logoUrl})`, backgroundSize: "cover" } : undefined}>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                {!profile.logoUrl && <small>Upload Logo</small>}
              </label>
              <h1 contentEditable suppressContentEditableWarning onBlur={(e) => persist({ ...profile, companyName: e.currentTarget.textContent || "" })}>
                {profile.companyName || "F-Career"}
              </h1>
              <p>Company Profile</p>
              <small>
                Profile URL
                <br />
                <b>bildyx.com/{(profile.companyName || "f-career").toLowerCase().replace(/\s+/g, "-")}</b>
              </small>
            </section>

            <h2>Parent Company</h2>
            <div style={{ width: "100%" }}>
              <button className="ca-parent" type="button" onClick={() => setModal("parent")}>
                <span>{profile.parentCompany || "Add your parent company if applicable"}</span>
              </button>
            </div>
          </aside>

          <section className="ca-main">
            <header className="ca-builder">
              <span />
              <b>Profile Builder</b>
              <p>— Start building your company profile by adding teams, products, and more</p>
            </header>

            <section>
              <div className="ca-section-head">
                <h2>Our Teams</h2>
              </div>

              <div className="ca-team-panel">
                <div className="ca-team-main">
                  <div className="ca-tabs-wrapper">
                    <div className="ca-tabs">
                      {teams.map((team) => (
                        <button key={team.id} className={team.id === activeTeam?.id ? "is-active" : ""} onClick={() => setActiveTeamId(team.id)}>
                          {team.name}
                          <span className="ca-item-actions">
                            <span
                              className="ca-item-action danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTeam(team.id);
                              }}
                            >
                              ×
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ca-actions" style={{ marginTop: 14 }}>
                    <button
                      style={{ border: "1px dashed var(--ca-blue)", color: "var(--ca-blue)", borderRadius: 999, minHeight: 34, padding: "0 16px", fontWeight: "bold", background: "transparent" }}
                      onClick={() => setModal("team")}
                    >
                      + Add New Team
                    </button>
                    <button
                      style={{ border: "1px dashed #cbd5e1", color: "#0f172a", borderRadius: 999, minHeight: 34, padding: "0 16px", fontWeight: "bold", background: "transparent" }}
                      onClick={() => setModal("member")}
                      disabled={!activeTeam}
                    >
                      Add Team Members
                    </button>
                  </div>

                  <div className="ca-members">
                    {members.length === 0 ? (
                      <div className="ca-empty">No team members added yet. Use "Add Team Members" to build this team.</div>
                    ) : (
                      members
                        .slice()
                        .sort((a, b) => (a.isLeader === b.isLeader ? a.name.localeCompare(b.name) : a.isLeader ? -1 : 1))
                        .map((member) => (
                          <article
                            className="ca-member"
                            key={member.id}
                            style={{ position: "relative", cursor: "pointer" }}
                            onClick={() => {
                              setEditingMemberId(member.id);
                              setModal("editMember");
                            }}
                          >
                            <button
                              type="button"
                              className="ca-star-button"
                              title={member.isLeader ? "Remove team leader" : "Set as team leader"}
                              style={{ position: "absolute", top: 8, left: 8, border: 0, background: "transparent", padding: 4, cursor: "pointer", color: "#2447f4", fontSize: 16, zIndex: 2 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLeader(member.id);
                              }}
                            >
                              {member.isLeader ? "★" : "☆"}
                            </button>
                            <button
                              className="ca-member-delete"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMember(member.id);
                              }}
                            >
                              🗑
                            </button>
                            <div className="ca-member-photo-wrap" style={{ position: "relative", width: 54, height: 54, margin: "6px auto 8px" }}>
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt="" style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover" }} />
                              ) : (
                                <div className="ca-default-avatar">☻</div>
                              )}
                            </div>
                            <strong>{member.name}</strong>
                            <small>{member.jobTitle}</small>
                          </article>
                        ))
                    )}
                  </div>

                  <div className="ca-sub">
                    <h3>Our Offices</h3>
                    <button onClick={() => setModal("city")}>+ Add City</button>
                  </div>
                  <div className="ca-chips">
                    {offices.map((office) => (
                      <div className="ca-chip" key={office.id}>
                        <div className="ca-item-actions">
                          <button className="ca-item-action danger" type="button" onClick={() => removeNamedItem("offices", office.id)}>
                            ×
                          </button>
                        </div>
                        <span>{office.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="ca-sub">
                    <h3>Main Products / Services</h3>
                    <div>
                      <button onClick={() => setModal("product")}>+ Add Product/Service</button>
                      <button onClick={() => setModal("brand")}>+ Add Brand</button>
                    </div>
                  </div>
                  <div className="ca-chips">
                    {products.map((product) => (
                      <div className="ca-chip" key={product.id}>
                        <div className="ca-item-actions">
                          <button className="ca-item-action danger" type="button" onClick={() => removeNamedItem("products", product.id)}>
                            ×
                          </button>
                        </div>
                        <span>{product.name}</span>
                      </div>
                    ))}
                    {(profile.brands || []).map((brand) => (
                      <div className="ca-chip brand" key={brand.id}>
                        <div className="ca-item-actions">
                          <button className="ca-item-action danger" type="button" onClick={() => removeNamedItem("brands", brand.id)}>
                            ×
                          </button>
                        </div>
                        <span>{brand.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="ca-profile-side">
                  <div>
                    <h3>Team Profile</h3>
                    {!isEditingProfile && (
                      <button onClick={startEditProfile} disabled={!activeTeam}>
                        + Add
                      </button>
                    )}
                  </div>

                  <div>
                    {!activeTeam ? (
                      <p className="ca-profile-empty">No team profile added yet.</p>
                    ) : isEditingProfile ? (
                      <div className="ca-profile-points is-editing">
                        {(mode === "operate" ? PROFILE_FIELDS_OPERATE : PROFILE_FIELDS_PEOPLE).map(([title, field, danger]) => (
                          <section className={`ca-point ca-point-editing${danger ? " danger" : ""}`} key={field}>
                            <h4>{title}</h4>
                            <textarea className="ca-profile-input" rows={4} value={profileDraft[field] || ""} onChange={(e) => setProfileDraft({ ...profileDraft, [field]: e.target.value })} />
                          </section>
                        ))}
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button className="ca-cancel-btn" onClick={() => setIsEditingProfile(false)}>
                            Cancel
                          </button>
                          <button className="ca-save-btn" onClick={saveProfileEdit}>
                            Save
                          </button>
                        </div>
                      </div>
                    ) : !teamProfile ? (
                      <p className="ca-profile-empty">No team profile added yet.</p>
                    ) : (
                      <div className="ca-profile-points">
                        {(mode === "operate" ? PROFILE_FIELDS_OPERATE : PROFILE_FIELDS_PEOPLE)
                          .filter(([, field]) => String(teamProfile[field] || "").trim())
                          .map(([title, field, danger]) => (
                            <section className={`ca-point${danger ? " danger" : ""}`} key={field}>
                              <h4>{title}</h4>
                              <p>{teamProfile[field]}</p>
                            </section>
                          ))}
                      </div>
                    )}
                  </div>

                  <footer>
                    <button className={mode === "people" ? "is-active" : ""} onClick={() => setMode("people")}>
                      People
                    </button>
                    <button className={mode === "operate" ? "is-active" : ""} onClick={() => setMode("operate")}>
                      How We Operate
                    </button>
                  </footer>
                </aside>
              </div>
            </section>

            <section className="ca-block">
              <header>
                <span>Our Product &amp; Service Portfolio</span>
                <button onClick={() => setModal("product")}>+ Add Product/Service</button>
              </header>
              <div>
                {products.length === 0 ? (
                  "No products or services added yet."
                ) : (
                  <div className="ca-org-grid">
                    {products.map((product) => (
                      <div className="ca-card-slot ca-card-slot--summary" key={product.id}>
                        <strong>{product.name}</strong>
                        {product.status && <span>{product.status}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="ca-block">
              <header>
                <span>Photos</span>
                <small>{teamPhotos.length}/10</small>
                <button onClick={() => setModal("photo")} disabled={teamPhotos.length >= 10}>
                  + Add Photos
                </button>
              </header>
              <div className="ca-photos-grid">
                {teamPhotos.length === 0 ? (
                  <div className="ca-empty-photos">No photos added yet.</div>
                ) : (
                  teamPhotos.map((photo) => (
                    <div className="ca-photo-item" key={photo.id}>
                      <img src={photo.url} alt="" className="ca-photo-img" />
                      <button className="ca-photo-delete" type="button" onClick={() => removePhoto(photo.id)}>
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <OrgSection title="Partners" emptyLabel="No partners added yet." items={profile.partners} onAdd={() => setModal("partner")} onRemove={(id) => removeOrgItem("partners", id)} />
            <OrgSection title="Customers" emptyLabel="No customers added yet." items={profile.customers} onAdd={() => setModal("customer")} onRemove={(id) => removeOrgItem("customers", id)} />
            <OrgSection title="Investors" emptyLabel="No investors added yet." items={profile.investors} onAdd={() => setModal("investor")} onRemove={(id) => removeOrgItem("investors", id)} />
            <OrgSection
              title="Subsidiaries"
              emptyLabel="No subsidiaries added yet."
              items={profile.subsidiaries}
              onAdd={() => setModal("subsidiary")}
              onRemove={(id) => removeOrgItem("subsidiaries", id)}
            />
          </section>

          <aside className="ca-nav">
            <Link className="is-active" to="/company-admin">
              Profile
            </Link>
            <Link to="/coming-soon/about-me">About Me</Link>
            <Link to="/coming-soon/job-ads">My Job Ads</Link>
            <Link to="/coming-soon/settings">Settings</Link>
          </aside>
        </div>
      </main>

      {modal === "team" && (
        <CaModal onClose={() => setModal(null)}>
          <AddTeamForm onSubmit={addTeam} />
        </CaModal>
      )}

      {modal === "member" && activeTeam && (
        <CaModal onClose={() => setModal(null)}>
          <AddMemberForm teamId={activeTeam.id} onSubmit={saveMember} />
        </CaModal>
      )}

      {modal === "editMember" && editingMember && (
        <CaModal
          onClose={() => {
            setModal(null);
            setEditingMemberId(null);
          }}
        >
          <AddMemberForm teamId={editingMember.teamId || ""} initial={editingMember} onSubmit={saveMember} />
        </CaModal>
      )}

      {modal === "city" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add City" placeholder="City name" onSubmit={(name) => addNamedItem("offices", name)} />
        </CaModal>
      )}

      {modal === "product" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add Product / Service" placeholder="Product or service name" onSubmit={(name) => addNamedItem("products", name)} />
        </CaModal>
      )}

      {modal === "brand" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add Brand" placeholder="Brand name" onSubmit={(name) => addNamedItem("brands", name)} />
        </CaModal>
      )}

      {modal === "parent" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm
            title="Parent Company"
            placeholder="Parent company name"
            initial={profile.parentCompany}
            onSubmit={(name) => {
              persist({ ...profile, parentCompany: name });
              setModal(null);
            }}
          />
        </CaModal>
      )}

      {modal === "photo" && (
        <CaModal onClose={() => setModal(null)}>
          <PhotoUploadForm onSubmit={addPhoto} />
        </CaModal>
      )}

      {modal === "partner" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add Partner" placeholder="Search organization..." onSubmit={(name) => addOrgItem("partners", name)} />
        </CaModal>
      )}

      {modal === "customer" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add Customer" placeholder="Search customer..." onSubmit={(name) => addOrgItem("customers", name)} />
        </CaModal>
      )}

      {modal === "investor" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add Investor" placeholder="Search investor..." onSubmit={(name) => addOrgItem("investors", name)} />
        </CaModal>
      )}

      {modal === "subsidiary" && (
        <CaModal onClose={() => setModal(null)}>
          <SimpleNameForm title="Add Subsidiary" placeholder="Search subsidiary..." onSubmit={(name) => addOrgItem("subsidiaries", name)} />
        </CaModal>
      )}

      <Footer />
    </>
  );
}

// ─── Small forms used inside modals ────────────────────────────

function AddTeamForm({ onSubmit }: { onSubmit: (name: string, type: string) => void }) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");

  return (
    <div>
      <h2>Add New Team</h2>
      <p>Fill in the details to create a new team.</p>

      <label>Team Type</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Select team type</option>
        {TEAM_TYPES.map((t) => (
          <option value={t} key={t}>
            {t}
          </option>
        ))}
      </select>

      <label>Team Name</label>
      <input type="text" placeholder="e.g. Team Alpha" value={name} onChange={(e) => setName(e.target.value)} />

      <div className="ca-modal-actions" style={{ marginTop: 16 }}>
        <button className="ca-save-btn" disabled={!name.trim()} onClick={() => onSubmit(name.trim(), type || TEAM_TYPES[0])}>
          Create Team
        </button>
      </div>
    </div>
  );
}

function AddMemberForm({ teamId, initial, onSubmit }: { teamId: string; initial?: TeamMember; onSubmit: (m: TeamMember) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle || "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initial?.avatarUrl);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <h2>{initial ? "Edit Team Member" : "Add Team Member"}</h2>

      <label>Photo</label>
      <input type="file" accept="image/*" onChange={handleFile} />

      <label>Full Name</label>
      <input type="text" placeholder="Jane Parker" value={name} onChange={(e) => setName(e.target.value)} />

      <label>Job Title</label>
      <input type="text" placeholder="Product Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />

      <div className="ca-modal-actions" style={{ marginTop: 16 }}>
        <button
          className="ca-save-btn"
          disabled={!name.trim()}
          onClick={() =>
            onSubmit({
              id: initial?.id || uid(),
              name: name.trim(),
              jobTitle: jobTitle.trim(),
              teamId,
              isLeader: initial?.isLeader,
              avatarUrl,
            })
          }
        >
          {initial ? "Save Changes" : "Add Member"}
        </button>
      </div>
    </div>
  );
}

// ─── Org-linked section (Partners/Customers/Investors/Subsidiaries) ───
// Simplified from the original's live organization-search + iframe card
// preview: no real org search backend exists yet, so each item is stored
// as a plain name with a small summary card instead of a rendered org card.
function OrgSection({
  title,
  emptyLabel,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  emptyLabel: string;
  items?: NamedItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const list = items || [];
  return (
    <section className="ca-block">
      <header>
        <span>{title}</span>
        <button onClick={onAdd}>+ Add {title.slice(0, -1)}</button>
      </header>
      <div>
        {list.length === 0 ? (
          emptyLabel
        ) : (
          <div className="ca-org-grid">
            {list.map((item) => (
              <div className="ca-card-slot ca-card-slot--summary" key={item.id}>
                <strong>{item.name}</strong>
                <button className="ca-card-delete-btn" type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PhotoUploadForm({ onSubmit }: { onSubmit: (dataUrl: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <h2>Add Photos</h2>
      <p>Upload photos of your workspace, team, or culture.</p>

      <div className="ca-image-upload-wrapper">
        {!preview ? (
          <button className="upload" type="button" onClick={() => document.getElementById("ca-photo-file")?.click()}>
            <b>Click to upload photo</b>
            <small>JPG, PNG up to 5MB</small>
          </button>
        ) : (
          <div className="ca-image-preview-area" style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
            <img className="ca-preview-img" src={preview} style={{ width: 120, height: 90, borderRadius: 6, objectFit: "cover", border: "2px solid #cbd5e1" }} />
            <button type="button" className="ca-toggle-btn" onClick={() => setPreview(null)}>
              Change
            </button>
          </div>
        )}
        <input id="ca-photo-file" type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={handleFile} />
      </div>

      <div className="ca-modal-actions" style={{ marginTop: 16 }}>
        <button className="ca-save-btn" disabled={!preview} onClick={() => preview && onSubmit(preview)}>
          Add Photo
        </button>
      </div>
    </div>
  );
}

function SimpleNameForm({ title, placeholder, initial, onSubmit }: { title: string; placeholder: string; initial?: string; onSubmit: (name: string) => void }) {
  const [value, setValue] = useState(initial || "");

  return (
    <div>
      <h2>{title}</h2>
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
      <div className="ca-modal-actions" style={{ marginTop: 16 }}>
        <button className="ca-save-btn" disabled={!value.trim()} onClick={() => onSubmit(value.trim())}>
          Save
        </button>
      </div>
    </div>
  );
}
