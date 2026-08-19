import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EntitySearchModal from "../components/modals/EntitySearchModal";
import { AddTeamModal } from "../components/modals/AddTeamModal";
import { AddTeamMemberModal } from "../components/modals/AddTeamMemberModal";
import { AddCityModal } from "../components/modals/AddCityModal";
import { PhotoUploadModal } from "../components/modals/PhotoUploadModal";
import OrgBlock from "../components/company/OrgBlock";
import { OrgCard } from "../components/company/OrgCard";
import { SubjectCard } from "../components/company/SubjectCard";
import { MemberCard } from "../components/company/MemberCard";
import { OfficeCard } from "../components/company/OfficeCard";
import { ProductCard } from "../components/company/ProductCard";
import TeamProfileSide from "../components/company/TeamProfileSide";
import { useCompanyProfile } from "../hooks/useCompanyProfile";

import "../css/company_con_admin.css";

function checkSessionGuard(navigate: (path: string) => void) {
  const raw =
    sessionStorage.getItem("bildyx_session") ||
    localStorage.getItem("bildyx_session");
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    if (session.organization_id === null) {
      console.error("no organization_id in session: ", session);
      navigate("/profile");
    }
  } catch {
    console.error("malformed session storage: ", raw);
  }
}

export default function CompanyProfile() {
  const navigate = useNavigate();
  const {
    slug,
    isAdminMode,
    loading,
    isAdmin,
    myOrganization,
    teams,
    members,
    offices,
    partners,
    customers,
    investors,
    subsidiaries,
    cities,
    jobs,
    teamSubjects,
    allSubjects,
    mode,
    isEditingProfile,
    profileDraft,
    isEditingUrl,
    urlInputVal,
    modal,
    entitySearchSlot,
    activeTeam,
    filteredMembers,
    teamPhotos,
    teamProfile,
    editingMember,
    setActiveTeamId,
    setMode,
    setIsEditingProfile,
    setProfileDraft,
    setIsEditingUrl,
    setUrlInputVal,
    setModal,
    setEditingMemberId,
    setEntitySearchSlot,
    handleStartEditUrl,
    handleSaveUrl,
    addTeam,
    deleteTeam,
    saveMember,
    deleteMember,
    toggleLeader,
    addOffice,
    removeOffice,
    startEditProfile,
    saveProfileEdit,
    handleLogoChange,
    handleNameBlur,
    addPhoto,
    removePhoto,
    handleEntitySelect,
    handleUnlinkParent,
    removePartner,
    removeCustomer,
    removeInvestor,
    removeSubsidiary,
    removeProduct,
  } = useCompanyProfile();

  useEffect(() => checkSessionGuard(navigate), [navigate]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading Connected Profile...</p>
      </div>
    );
  }

  const logoUrl = myOrganization?.avatar_url || "";

  return (
    <>
      <Header
        isAdmin={isAdminMode}
        centerLabel={myOrganization?.name || "F-CAREER"}
        backHref={`/${slug}`}
        backLabel="‹ Preview company page"
        statusLabel="Published"
      />

      <main className="ca-page">
        <div
          className="ca-shell"
          style={
            !isAdminMode
              ? { gridTemplateColumns: "250px minmax(0, 1fr)" }
              : undefined
          }
        >
          <aside className="ca-left">
            <section className="ca-profile-box">
              <label
                className="ca-logo"
                style={{
                  backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
                  backgroundSize: "cover",
                  cursor: isAdminMode ? "pointer" : "default",
                }}
              >
                {isAdminMode && (
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleLogoChange}
                  />
                )}
                {!logoUrl && (
                  <small>{isAdminMode ? "Upload Logo" : "No Logo"}</small>
                )}
              </label>
              <h1
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={isAdminMode ? handleNameBlur : undefined}
                style={{
                  outline: "none",
                  cursor: isAdminMode ? "text" : "default",
                }}
              >
                {myOrganization?.name || "F-Career"}
              </h1>
              <p>Company Profile</p>
              <div
                className="ca-profile-url-container"
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  opacity: 0.85,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <i className="bi bi-link-45deg" style={{ fontSize: 12 }}></i>
                  <span>Profile URL</span>
                </div>
                {!isEditingUrl ? (
                  <div
                    className="ca-profile-url-display"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontWeight: "bold",
                      marginTop: 4,
                    }}
                  >
                    <span>
                      bildyx.com/
                      {myOrganization?.profile_url ||
                        (myOrganization?.name || "f-career")
                          .toLowerCase()
                          .replace(/[\s_]+/g, "-")}
                    </span>
                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={handleStartEditUrl}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        aria-label="Edit Profile URL"
                      >
                        <i
                          className="bi bi-pencil"
                          style={{ fontSize: 11 }}
                        ></i>
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className="ca-profile-url-edit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <span>bildyx.com/</span>
                    <input
                      type="text"
                      value={urlInputVal}
                      onChange={(e) => setUrlInputVal(e.target.value)}
                      style={{
                        width: 110,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        padding: "0 6px",
                        fontSize: 11,
                        fontWeight: "bold",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#4ade80",
                        cursor: "pointer",
                        padding: "0 4px",
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingUrl(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "0 4px",
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </section>

            <h2>Parent Company</h2>
            <div style={{ width: "100%", overflow: "hidden" }}>
              {myOrganization?.parent_organization_id ? (
                <OrgCard
                  orgId={myOrganization.parent_organization_id}
                  onDelete={isAdminMode ? handleUnlinkParent : undefined}
                />
              ) : isAdminMode ? (
                <button
                  className="ca-parent"
                  type="button"
                  onClick={() => setEntitySearchSlot("parent")}
                >
                  <span>Add your parent company if applicable</span>
                </button>
              ) : (
                <div
                  className="ca-parent"
                  style={{ borderStyle: "solid", opacity: 0.6 }}
                >
                  <span>No parent company linked</span>
                </div>
              )}
            </div>
          </aside>

          <section className="ca-main">
            {!isAdminMode && isAdmin && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 16,
                }}
              >
                <Link
                  to={`/${slug}/admin`}
                  className="ca-edit-btn"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i className="bi bi-pencil"></i>
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}

            {isAdminMode && (
              <header className="ca-builder">
                <span />
                <b>Profile Builder</b>
                <p>
                  — Start building your company profile by adding teams,
                  products, and more
                </p>
              </header>
            )}

            <section>
              <div className="ca-section-head">
                <h2>Our Teams</h2>
                {isAdminMode && activeTeam && (
                  <div
                    className={`ca-edit-actions${isEditingProfile ? " is-editing" : ""}`}
                  >
                    <button
                      className="ca-edit-btn"
                      type="button"
                      onClick={startEditProfile}
                    >
                      <i className="bi bi-pencil" aria-hidden="true"></i>
                      <span>Edit</span>
                    </button>
                    <button
                      className="ca-save-btn"
                      type="button"
                      onClick={saveProfileEdit}
                    >
                      <i className="bi bi-check-lg" aria-hidden="true"></i>
                      <span>Save</span>
                    </button>
                    <button
                      className="ca-cancel-btn"
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      <i className="bi bi-x-lg" aria-hidden="true"></i>
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="ca-team-panel">
                <div className="ca-team-main">
                  <div className="ca-tabs-wrapper">
                    <div className="ca-tabs">
                      {teams.map((team) => (
                        <button
                          key={team.id}
                          className={
                            team.id === activeTeam?.id ? "is-active" : ""
                          }
                          onClick={() => setActiveTeamId(team.id)}
                        >
                          {team.name}
                          {isAdminMode && (
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
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isAdminMode && (
                    <div className="ca-actions" style={{ marginTop: 14 }}>
                      <button
                        style={{
                          border: "1px dashed var(--ca-blue)",
                          color: "var(--ca-blue)",
                          borderRadius: 999,
                          minHeight: 34,
                          padding: "0 16px",
                          fontWeight: "bold",
                          background: "transparent",
                        }}
                        onClick={() => setModal("team")}
                      >
                        + Add New Team
                      </button>
                      <button
                        style={{
                          border: "1px dashed #cbd5e1",
                          color: "#0f172a",
                          borderRadius: 999,
                          minHeight: 34,
                          padding: "0 16px",
                          fontWeight: "bold",
                          background: "transparent",
                        }}
                        onClick={() => setModal("member")}
                        disabled={!activeTeam}
                      >
                        Add Team Members
                      </button>
                    </div>
                  )}

                  <div className="ca-members">
                    {filteredMembers.length === 0 ? (
                      <div className="ca-empty">
                        No team members added yet. Use "Add Team Members" to
                        build this team.
                      </div>
                    ) : (
                      filteredMembers
                        .slice()
                        .sort((a, b) =>
                          a.is_leader === b.is_leader
                            ? a.fullname.localeCompare(b.fullname)
                            : a.is_leader
                              ? -1
                              : 1,
                        )
                        .map((member) => (
                          <MemberCard
                            key={member.id}
                            member={member}
                            job={jobs.find((j) => j.id === member.job_id)}
                            isAdminMode={isAdminMode}
                            onEdit={() => {
                              setEditingMemberId(member.id);
                              setModal("editMember");
                            }}
                            onToggleLeader={() => toggleLeader(member.id)}
                            onDelete={() => deleteMember(member.id)}
                          />
                        ))
                    )}
                  </div>

                  <div className="ca-sub">
                    <h3>Our Offices</h3>
                    {isAdminMode && (
                      <button onClick={() => setModal("city")}>
                        + Add City
                      </button>
                    )}
                  </div>
                  <div className="ca-chips">
                    {offices.map((office) => (
                      <OfficeCard
                        key={office.id}
                        office={office}
                        city={cities.find((c) => c.id === office.city_id)}
                        isMain={activeTeam?.city_id === office.city_id}
                        isAdminMode={isAdminMode}
                        onRemove={() => removeOffice(office.id)}
                      />
                    ))}
                  </div>

                  <div className="ca-sub">
                    <h3>Main Products / Services</h3>
                    {isAdminMode && (
                      <div>
                        <button onClick={() => setEntitySearchSlot("product")}>
                          + Add Product/Service
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="ca-chips">
                    {teamSubjects
                      .filter((ts) => ts.team_id === activeTeam?.id)
                      .map((ts) => (
                        <ProductCard
                          key={ts.id}
                          ts={ts}
                          subject={allSubjects.find(
                            (s) => s.id === ts.subject_id,
                          )}
                          isAdminMode={isAdminMode}
                          onRemove={() => removeProduct(ts.id)}
                        />
                      ))}
                  </div>
                </div>

                <TeamProfileSide
                  isAdminMode={isAdminMode}
                  isEditingProfile={isEditingProfile}
                  startEditProfile={startEditProfile}
                  activeTeam={activeTeam}
                  mode={mode}
                  setMode={setMode}
                  teamProfile={teamProfile}
                  profileDraft={profileDraft}
                  setProfileDraft={setProfileDraft}
                  setIsEditingProfile={setIsEditingProfile}
                />
              </div>
            </section>

            <section className="ca-block">
              <header>
                <span>Our Product &amp; Service Portfolio</span>
                {isAdminMode && (
                  <button onClick={() => setEntitySearchSlot("product")}>
                    + Add Product/Service
                  </button>
                )}
              </header>
              <div>
                {teamSubjects.filter((ts) => ts.team_id === activeTeam?.id)
                  .length === 0 ? (
                  "No products or services added yet."
                ) : (
                  <div className="ca-org-grid">
                    {teamSubjects
                      .filter((ts) => ts.team_id === activeTeam?.id)
                      .map((ts) => (
                        <SubjectCard
                          key={ts.id}
                          subjectId={ts.subject_id}
                          onDelete={
                            isAdminMode ? () => removeProduct(ts.id) : undefined
                          }
                        />
                      ))}
                  </div>
                )}
              </div>
            </section>

            <section className="ca-block">
              <header>
                <span>Photos</span>
                <small>{teamPhotos.length}/10</small>
                {isAdminMode && (
                  <button
                    onClick={() => setModal("photo")}
                    disabled={teamPhotos.length >= 10}
                  >
                    + Add Photos
                  </button>
                )}
              </header>
              <div className="ca-photos-grid">
                {teamPhotos.length === 0 ? (
                  <div className="ca-empty-photos">No photos added yet.</div>
                ) : (
                  teamPhotos.map((photo) => (
                    <div className="ca-photo-item" key={photo.id}>
                      <img src={photo.url} alt="" className="ca-photo-img" />
                      {isAdminMode && (
                        <button
                          className="ca-photo-delete"
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            <OrgBlock
              title="Partners"
              addButtonLabel="+ Add Partner"
              onAddClick={() => setEntitySearchSlot("partner")}
              items={partners}
              orgIdKey="partner_id"
              isAdminMode={isAdminMode}
              onDelete={removePartner}
            />

            <OrgBlock
              title="Customers"
              addButtonLabel="+ Add Customer"
              onAddClick={() => setEntitySearchSlot("customer")}
              items={customers}
              orgIdKey="customer_id"
              isAdminMode={isAdminMode}
              onDelete={removeCustomer}
            />

            <OrgBlock
              title="Investors"
              addButtonLabel="+ Add Investor"
              onAddClick={() => setEntitySearchSlot("investor")}
              items={investors}
              orgIdKey="investor_id"
              isAdminMode={isAdminMode}
              onDelete={removeInvestor}
            />

            <OrgBlock
              title="Subsidiaries"
              addButtonLabel="+ Add Subsidiary"
              onAddClick={() => setEntitySearchSlot("subsidiary")}
              items={subsidiaries}
              orgIdKey="subsidiary_id"
              isAdminMode={isAdminMode}
              onDelete={removeSubsidiary}
            />
          </section>

          {isAdminMode && (
            <aside className="ca-nav">
              <Link className="is-active" to={`/${slug}/admin`}>
                Profile
              </Link>
              <Link to="/coming-soon/about-me">About Me</Link>
              <Link to="/coming-soon/job-ads">My Job Ads</Link>
              <Link to="/coming-soon/settings">Settings</Link>
            </aside>
          )}
        </div>
      </main>

      {modal === "team" && (
        <AddTeamModal
          offices={offices}
          cities={cities}
          onSubmit={addTeam}
          onClose={() => setModal(null)}
          teamSubjects={teamSubjects}
          allSubjects={allSubjects}
        />
      )}

      {modal === "member" && activeTeam && (
        <AddTeamMemberModal
          teamId={activeTeam.id}
          onSubmit={saveMember}
          onClose={() => setModal(null)}
          teams={teams}
          members={members}
        />
      )}

      {modal === "editMember" && editingMember && activeTeam && (
        <AddTeamMemberModal
          teamId={activeTeam.id}
          initial={editingMember}
          onSubmit={saveMember}
          onClose={() => {
            setModal(null);
            setEditingMemberId(null);
          }}
          teams={teams}
          members={members}
        />
      )}

      {modal === "city" && (
        <AddCityModal
          cities={cities}
          onSubmit={addOffice}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "photo" && (
        <PhotoUploadModal onSubmit={addPhoto} onClose={() => setModal(null)} />
      )}

      <EntitySearchModal
        open={entitySearchSlot !== null}
        slotType={
          entitySearchSlot === "product" ? "subject-card" : "company-card"
        }
        onClose={() => setEntitySearchSlot(null)}
        onSelect={handleEntitySelect}
      />

      <Footer />
    </>
  );
}
