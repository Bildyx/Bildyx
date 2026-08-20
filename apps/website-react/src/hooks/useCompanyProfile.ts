import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "../lib/toast";
import { getSession } from "../lib/session";

import { TeamService } from "../services/team.service";
import { TeamMemberService } from "../services/team-member.service";
import { TeamOfficeService } from "../services/team-office.service";
import { TeamProfileService } from "../services/team-profile.service";
import { OrganizationPhotoService } from "../services/organization-photo.service";
import { OrganizationPartnerService } from "../services/organization-partner.service";
import { OrganizationCustomerService } from "../services/organization-customer.service";
import { OrganizationInvestorService } from "../services/organization-investor.service";
import { OrganizationSubsidiaryService } from "../services/organization-subsidiary.service";
import { CityService } from "../services/city.service";
import { OrganizationService } from "../services/organization.service";
import { JobService } from "../services/job.service";
import { TeamSubjectService } from "../services/team-subject.service";
import { SubjectService } from "../services/subject.service";

import type { Team } from "@repo/models/teams";
import type { TeamMember } from "@repo/models/team_members";
import type { OrganizationOffice } from "@repo/models/organization_offices";
import type { TeamProfile } from "@repo/models/team_profiles";
import type { OrganizationPhoto } from "@repo/models/organization_photos";
import type { OrganizationPartner } from "@repo/models/organization_partners";
import type { OrganizationCustomer } from "@repo/models/organization_customers";
import type { OrganizationInvestor } from "@repo/models/organization_investors";
import type { OrganizationSubsidiary } from "@repo/models/organization_subsidiaries";
import type { Subject } from "@repo/models/subjects";
import type { TeamSubject } from "@repo/models/team_subjects";
import type { CityListItem } from "@repo/models/cities";
import type { Job } from "@repo/models/jobs";
import type { Organization } from "@repo/models/organizations";

const teamService = new TeamService();
const teamMemberService = new TeamMemberService();
const teamOfficeService = new TeamOfficeService();
const teamProfileService = new TeamProfileService();
const teamPhotoService = new OrganizationPhotoService();
const teamPartnerService = new OrganizationPartnerService();
const teamCustomerService = new OrganizationCustomerService();
const teamInvestorService = new OrganizationInvestorService();
const teamSubsidiaryService = new OrganizationSubsidiaryService();
const cityService = new CityService();
const organizationService = new OrganizationService();
const jobService = new JobService();
const teamSubjectService = new TeamSubjectService();
const subjectService = new SubjectService();

type ModalName = "team" | "member" | "editMember" | "city" | "photo" | "editTeam" | null;

export function useCompanyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAdminMode = window.location.pathname.endsWith("/admin");

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myOrganization, setMyOrganization] = useState<Organization | null>(
    null,
  );
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [offices, setOffices] = useState<OrganizationOffice[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<Record<string, TeamProfile>>(
    {},
  );
  const [photos, setPhotos] = useState<OrganizationPhoto[]>([]);
  const [partners, setPartners] = useState<OrganizationPartner[]>([]);
  const [customers, setCustomers] = useState<OrganizationCustomer[]>([]);
  const [investors, setInvestors] = useState<OrganizationInvestor[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<OrganizationSubsidiary[]>(
    [],
  );
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [teamSubjects, setTeamSubjects] = useState<TeamSubject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [mode, setMode] = useState<"people" | "operate">("people");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Partial<TeamProfile>>({});
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInputVal, setUrlInputVal] = useState("");
  const [modal, setModal] = useState<ModalName>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [entitySearchSlot, setEntitySearchSlot] = useState<string | null>(null);

  const handleStartEditUrl = () => {
    setUrlInputVal(
      myOrganization?.profile_url ||
        (myOrganization?.name || "f-career")
          .toLowerCase()
          .replace(/[\s_]+/g, "-"),
    );
    setIsEditingUrl(true);
  };

  const handleSaveUrl = async () => {
    if (!myOrganization?.id) return;
    const slugVal = urlInputVal
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-");
    if (!slugVal) {
      toast.warning("Profile URL slug cannot be empty.");
      return;
    }
    try {
      const updated = await organizationService.update(myOrganization.id, {
        profile_url: slugVal,
      });
      setMyOrganization(updated);
      setIsEditingUrl(false);
      toast.success("Profile URL updated successfully.");
      const newPath = isAdminMode ? `/${slugVal}/admin` : `/${slugVal}`;
      navigate(newPath, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update Profile URL.");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (!slug) {
        toast.error("Profile URL slug is missing.");
        navigate("/");
        return;
      }

      const orgs = await organizationService.getAll();
      const org = orgs.find(
        (o) =>
          o.profile_url === slug ||
          (o.name || "").toLowerCase().replace(/[\s_]+/g, "-") === slug,
      );

      if (!org) {
        toast.error("Company not found.");
        navigate("/");
        return;
      }

      const session = getSession();
      if (!session || session.companyId !== org.id) {
        toast.error("You are not authorized to manage this company.");
        navigate("/login");
        return;
      }

      const myOrgId = org.id;

      const [
        teamsData,
        membersData,
        officesData,
        profilesData,
        photosData,
        partnersData,
        customersData,
        investorsData,
        subsidiariesData,
        citiesData,
        jobsData,
        teamSubjectsData,
        subjectsData,
        orgData,
      ] = await Promise.all([
        teamService.getAll({ organization_id: myOrgId }),
        teamMemberService.getAll(),
        teamOfficeService.getAll(),
        teamProfileService.getAll(),
        teamPhotoService.getAll({ organization_id: myOrgId }),
        teamPartnerService.getAll({ organization_id: myOrgId }),
        teamCustomerService.getAll({ organization_id: myOrgId }),
        teamInvestorService.getAll({ organization_id: myOrgId }),
        teamSubsidiaryService.getAll({ organization_id: myOrgId }),
        cityService.getAll(),
        jobService.getAll(),
        teamSubjectService.getAll(),
        subjectService.getAll(),
        organizationService.getById(myOrgId),
      ]);

      setCities(citiesData);
      setJobs(jobsData);
      setTeamSubjects(teamSubjectsData);
      setAllSubjects(subjectsData);
      setMyOrganization(orgData);
      setTeams(teamsData);

      const teamIds = new Set(teamsData.map((t) => t.id));
      setMembers(membersData.filter((m) => teamIds.has(m.team_id)));
      setOffices(officesData.filter((o) => o.organization_id === myOrgId));
      setPhotos(photosData);
      setPartners(partnersData);
      setCustomers(customersData);
      setInvestors(investorsData);
      setSubsidiaries(subsidiariesData);

      const profileMap: Record<string, TeamProfile> = {};
      for (const p of profilesData) {
        if (p.team_id) {
          profileMap[p.team_id] = p;
        }
      }
      setTeamProfiles(profileMap);

      if (teamsData.length > 0) {
        setActiveTeamId(teamsData[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const activeTeam =
    teams.find((t) => t.id === activeTeamId) || teams[0] || null;
  const filteredMembers = members.filter(
    (m) => !activeTeam || !m.team_id || m.team_id === activeTeam.id,
  );
  const teamPhotos = photos.filter(
    (p) => !activeTeam || p.organization_id === myOrganization?.id,
  );
  const teamProfile = activeTeam ? teamProfiles[activeTeam.id] : undefined;

  async function addTeam(
    name: string,
    type: string,
    cityId: string,
    visibility: string,
    productService?: string,
  ) {
    try {
      const created = await teamService.create({
        name,
        type,
        city_id: cityId,
        visibility: visibility as any,
        product_service: productService || null,
        organization_id: myOrganization!.id,
      });
      setTeams((prev) => [...prev, created]);
      setActiveTeamId(created.id);
      setModal(null);
      toast.success(`"${name}" has been created.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create team.");
    }
  }

  async function updateTeam(
    teamId: string,
    name: string,
    type: string,
    cityId: string,
    visibility: string,
    productService?: string,
  ) {
    try {
      const updated = await teamService.update(teamId, {
        name,
        type,
        city_id: cityId,
        visibility: visibility as any,
        product_service: productService || null,
      });
      setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
      setModal(null);
      toast.success(`"${name}" has been updated.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update team.");
    }
  }

  async function deleteTeam(id: string) {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await teamService.delete(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setMembers((prev) => prev.filter((m) => m.team_id !== id));
      setTeamProfiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (activeTeamId === id) {
        const remaining = teams.filter((t) => t.id !== id);
        setActiveTeamId(remaining[0]?.id || null);
      }
      toast.success("Team deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete team.");
    }
  }

  async function saveMember(
    fullname: string,
    jobId: string,
    avatarFile?: File,
    profileImageUrl?: string,
  ) {
    if (!activeTeam) return;
    try {
      let profile_image = profileImageUrl || "";
      if (avatarFile) {
        const reader = new FileReader();
        const b64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
        });
        reader.readAsDataURL(avatarFile);
        profile_image = await b64Promise;
      }

      if (editingMemberId) {
        const existing = members.find((m) => m.id === editingMemberId);
        const updated = await teamMemberService.update(editingMemberId, {
          fullname,
          job_id: jobId,
          team_id: activeTeam.id,
          profile_image: profile_image || existing?.profile_image,
        });
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMemberId ? updated : m)),
        );
        toast.success("Member updated.");
      } else {
        const created = await teamMemberService.create({
          fullname,
          job_id: jobId,
          team_id: activeTeam.id,
          profile_image: profile_image,
          is_leader: false,
        });
        setMembers((prev) => [...prev, created]);
        toast.success("Member added.");
      }
      setModal(null);
      setEditingMemberId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save member.");
    }
  }

  async function deleteMember(id: string) {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await teamMemberService.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete member.");
    }
  }

  async function toggleLeader(id: string) {
    const member = members.find((m) => m.id === id);
    if (!member || !member.team_id) {
      toast.error("This member is not assigned to a team.");
      return;
    }
    try {
      const nextIsLeader = !member.is_leader;
      if (nextIsLeader) {
        const currentLeader = members.find(
          (m) => m.team_id === member.team_id && m.is_leader,
        );
        if (currentLeader) {
          await teamMemberService.update(currentLeader.id, {
            fullname: currentLeader.fullname,
            job_id: currentLeader.job_id,
            team_id: currentLeader.team_id,
            profile_image: currentLeader.profile_image,
            is_leader: false,
          });
        }
      }

      const updated = await teamMemberService.update(id, {
        fullname: member.fullname,
        job_id: member.job_id,
        team_id: member.team_id,
        profile_image: member.profile_image,
        is_leader: nextIsLeader,
      });

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === id) return updated;
          if (m.team_id === member.team_id && nextIsLeader)
            return { ...m, is_leader: false };
          return m;
        }),
      );
      toast.success(
        nextIsLeader
          ? `"${member.fullname}" is now leader.`
          : `"${member.fullname}" is no longer leader.`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update leader status.");
    }
  }

  async function addOffice(cityId: string, officeType: string) {
    if (!myOrganization?.id) return;
    try {
      const created = await teamOfficeService.create({
        organization_id: myOrganization.id,
        city_id: cityId,
        type: officeType,
      });
      setOffices((prev) => [...prev, created]);
      setModal(null);
      toast.success("Office added.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add office.");
    }
  }

  async function removeOffice(id: string) {
    if (!window.confirm("Are you sure you want to delete this office?")) return;
    try {
      await teamOfficeService.delete(id);
      setOffices((prev) => prev.filter((o) => o.id !== id));
      toast.success("Office removed.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove office.");
    }
  }

  function startEditProfile() {
    setProfileDraft(
      activeTeam && teamProfiles[activeTeam.id]
        ? ({ ...teamProfiles[activeTeam.id] } as Partial<TeamProfile>)
        : {},
    );
    setIsEditingProfile(true);
  }

  async function saveProfileEdit() {
    if (!activeTeam) return;
    try {
      const existing = teamProfiles[activeTeam.id];
      const payload = {
        team_id: activeTeam.id,
        who_we_are: profileDraft.who_we_are || "",
        what_were_great_at: profileDraft.what_were_great_at || "",
        team_culture: profileDraft.team_culture || "",
        how_we_work_together: profileDraft.how_we_work_together || "",
        this_team_is_not_for_you_if:
          profileDraft.this_team_is_not_for_you_if || "",
        how_were_led: profileDraft.how_were_led || "",
        what_were_solving_now: profileDraft.what_were_solving_now || "",
        typical_day: profileDraft.typical_day || "",
        what_we_value: profileDraft.what_we_value || "",
        growth_here: profileDraft.growth_here || "",
      };

      if (existing?.id) {
        const updated = await teamProfileService.update(existing.id, payload);
        setTeamProfiles((prev) => ({ ...prev, [activeTeam.id]: updated }));
      } else {
        const created = await teamProfileService.create(payload);
        setTeamProfiles((prev) => ({ ...prev, [activeTeam.id]: created }));
      }
      setIsEditingProfile(false);
      toast.success("Team profile updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile.");
    }
  }

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!myOrganization?.id) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await organizationService.update(myOrganization.id, {
          avatar_url: reader.result as string,
        });
        setMyOrganization(updated);
        toast.success("Logo updated.");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update logo.");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleNameBlur(e: React.FocusEvent<HTMLHeadingElement>) {
    if (!myOrganization?.id) return;
    const nextName = e.currentTarget.textContent || "";
    if (nextName === myOrganization.name) return;
    try {
      const updated = await organizationService.update(myOrganization.id, {
        name: nextName,
      });
      setMyOrganization(updated);
      toast.success("Company name updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update company name.");
    }
  }

  async function addPhoto(dataUrl: string) {
    if (!myOrganization?.id) return;
    if (teamPhotos.length >= 10) {
      toast.warning("Limit of 10 photos reached.");
      return;
    }
    try {
      const created = await teamPhotoService.create({
        url: dataUrl,
        name: `Photo ${photos.length + 1}`,
        organization_id: myOrganization.id,
      });
      setPhotos((prev) => [...prev, created]);
      setModal(null);
      toast.success("Photo added.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add photo.");
    }
  }

  async function removePhoto(id: string) {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await teamPhotoService.delete(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Photo deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete photo.");
    }
  }

  async function handleEntitySelect(entityId: string) {
    if (!myOrganization?.id) return;
    try {
      if (entitySearchSlot === "parent") {
        const updated = await organizationService.update(myOrganization.id, {
          parent_organization_id: entityId,
        });
        setMyOrganization(updated);
        toast.success("Parent company connected.");
      } else if (entitySearchSlot === "partner") {
        const created = await teamPartnerService.create({
          organization_id: myOrganization.id,
          partner_id: entityId,
        });
        setPartners((prev) => [...prev, created]);
        toast.success("Partner linked.");
      } else if (entitySearchSlot === "customer") {
        const created = await teamCustomerService.create({
          organization_id: myOrganization.id,
          customer_id: entityId,
        });
        setCustomers((prev) => [...prev, created]);
        toast.success("Customer linked.");
      } else if (entitySearchSlot === "investor") {
        const created = await teamInvestorService.create({
          organization_id: myOrganization.id,
          investor_id: entityId,
        });
        setInvestors((prev) => [...prev, created]);
        toast.success("Investor linked.");
      } else if (entitySearchSlot === "subsidiary") {
        const created = await teamSubsidiaryService.create({
          organization_id: myOrganization.id,
          subsidiary_id: entityId,
        });
        setSubsidiaries((prev) => [...prev, created]);
        toast.success("Subsidiary linked.");
      } else if (entitySearchSlot === "product") {
        if (!activeTeamId) return;
        const created = await teamSubjectService.create({
          team_id: activeTeamId,
          subject_id: entityId,
          status: "MAIN_FOCUS",
        });
        setTeamSubjects((prev) => [...prev, created]);
        toast.success("Product linked.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to link entity.");
    } finally {
      setEntitySearchSlot(null);
    }
  }

  async function handleUnlinkParent() {
    if (!myOrganization?.id) return;
    if (!window.confirm("Are you sure you want to unlink the parent company?"))
      return;
    try {
      const updated = await organizationService.update(myOrganization.id, {
        parent_organization_id: null,
      });
      setMyOrganization(updated);
      toast.success("Parent company unlinked.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to unlink parent company.");
    }
  }

  async function removePartner(id: string) {
    if (!window.confirm("Unlink this partner?")) return;
    try {
      await teamPartnerService.delete(id);
      setPartners((prev) => prev.filter((p) => p.id !== id));
      toast.success("Partner unlinked.");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeCustomer(id: string) {
    if (!window.confirm("Unlink this customer?")) return;
    try {
      await teamCustomerService.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success("Customer unlinked.");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeInvestor(id: string) {
    if (!window.confirm("Unlink this investor?")) return;
    try {
      await teamInvestorService.delete(id);
      setInvestors((prev) => prev.filter((i) => i.id !== id));
      toast.success("Investor unlinked.");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeSubsidiary(id: string) {
    if (!window.confirm("Unlink this subsidiary?")) return;
    try {
      await teamSubsidiaryService.delete(id);
      setSubsidiaries((prev) => prev.filter((s) => s.id !== id));
      toast.success("Subsidiary unlinked.");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeProduct(id: string) {
    if (!window.confirm("Unlink this product/service?")) return;
    try {
      await teamSubjectService.delete(id);
      setTeamSubjects((prev) => prev.filter((s) => s.id !== id));
      toast.success("Product unlinked.");
    } catch (err) {
      console.error(err);
    }
  }

  const editingMember = editingMemberId
    ? members.find((m) => m.id === editingMemberId) || null
    : null;

  return {
    slug,
    isAdminMode,
    loading,
    isAdmin,
    myOrganization,
    teams,
    members,
    offices,
    teamProfiles,
    photos,
    partners,
    customers,
    investors,
    subsidiaries,
    cities,
    jobs,
    teamSubjects,
    allSubjects,
    activeTeamId,
    mode,
    isEditingProfile,
    profileDraft,
    isEditingUrl,
    urlInputVal,
    modal,
    editingMemberId,
    entitySearchSlot,
    activeTeam,
    filteredMembers,
    teamPhotos,
    teamProfile,
    editingMember,
    setLoading,
    setIsAdmin,
    setMyOrganization,
    setTeams,
    setMembers,
    setOffices,
    setTeamProfiles,
    setPhotos,
    setPartners,
    setCustomers,
    setInvestors,
    setSubsidiaries,
    setCities,
    setJobs,
    setTeamSubjects,
    setAllSubjects,
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
    updateTeam,
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
  };
}
