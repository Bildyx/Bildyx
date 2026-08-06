// @ts-nocheck
(() => {
  "use strict";

  const PUB = "bildyx_compagny_con_profile_v3";
  const DRAFT = "bildyx_compagny_con_admin_draft_v3";

  const empty = () => ({
    companyName: "F-Career",
    parentCompany: "",
    published: false,
    teams: [],
    members: [],
    offices: [],
    products: [],
    brands: [],
    photos: [],
    partners: [],
    customers: [],
    investors: [],
    subsidiaries: [],
    teamProfiles: {},
  });

  let st = empty();
  let teamId = null;
  let mode = "people";
  let editMode = false;

  const $ = (selector) => document.querySelector(selector);
  const overlay = $("#companyAdminModal");
  const modal = overlay?.querySelector(".ca-modal");
  const content = $("#companyAdminModalContent");
  const toast = $("#caToast");

  const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const esc = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };

  function saveDraft() {
    const name = $("[data-company-name]");
    if (name) st.companyName = name.textContent.trim() || "F-Career";
    localStorage.setItem(DRAFT, JSON.stringify(st));
  }

  function load() {
    st = read(DRAFT) || read(PUB) || empty();
    teamId = st.teams[0]?.id || null;

    const name = $("[data-company-name]");
    if (name) name.textContent = st.companyName || "F-Career";
  }

  function note(title, text) {
    if (!toast) return;

    toast.innerHTML = `<b>${esc(title)}</b><p>${esc(text)}</p>`;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function confirmModify() {
    return window.confirm("Êtes-vous sûr de vouloir modifier ?");
  }

  function confirmDelete() {
    return window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?");
  }


  function publish() {
    st.published = true;
    saveDraft();
    localStorage.setItem(PUB, JSON.stringify(st));
    renderStatus();
    note("Saved", "compagny_con.php has been updated.");
  }

  function activeTeam() {
    return st.teams.find((team) => team.id === teamId) || st.teams[0] || null;
  }


  function updateProfileButton() {
    const button = document.querySelector("[data-profile-edit-button], .ca-profile-side [data-open-modal='profile']");
    const team = activeTeam();
    const hasProfile = Boolean(team && st.teamProfiles[team.id]);

    if (!button) return;

    button.textContent = hasProfile ? "✎ Edit" : "+ Add";
    button.setAttribute("aria-label", hasProfile ? "Edit team profile" : "Add team profile");
  }

  function hydrateProfileModal(teamProfileId) {
    if (!content) return;

    const selectedTeamId = teamProfileId || content.querySelector('[data-field="teamId"]')?.value || teamId;
    const profile = st.teamProfiles[selectedTeamId];

    ["who", "great", "culture", "work", "notFor", "led", "solving", "day", "value", "growth"].forEach((fieldName) => {
      const field = content.querySelector(`[data-field="${fieldName}"]`);
      if (field) field.value = profile?.[fieldName] || "";
    });
  }

  function refreshEditUI() {
    const panel = $(".ca-team-panel");
    const button = $("[data-toggle-edit-mode]");

    panel?.classList.toggle("is-editing", editMode);
    button?.classList.toggle("is-active", editMode);
    button?.setAttribute("aria-pressed", String(editMode));
  }

  function renderTabs() {
    const el = $("#caTeamTabs");
    if (!el) return;

    if (!st.teams.length) {
      el.innerHTML = "";
      teamId = null;
      return;
    }

    if (!teamId) teamId = st.teams[0].id;

    el.innerHTML = st.teams
      .map(
        (team) => `
          <button class="${team.id === teamId ? "is-active" : ""}" data-id="${esc(team.id)}">
            ${esc(team.name)}
            <span class="ca-item-actions">
              <span class="ca-item-action" data-edit-team="${esc(team.id)}">✎</span>
              <span class="ca-item-action danger" data-delete-team-quick="${esc(team.id)}">×</span>
            </span>
          </button>
        `,
      )
      .join("");

    el.querySelectorAll("[data-id]").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target.closest(".ca-item-actions")) return;

        teamId = button.dataset.id;
        saveDraft();
        render();
      });
    });

    el.querySelectorAll("[data-edit-team]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!confirmModify()) return;
        open("edit-team", { teamId: button.dataset.editTeam });
      });
    });

    el.querySelectorAll("[data-delete-team-quick]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!confirmDelete()) return;

        const id = button.dataset.deleteTeamQuick;
        st.teams = st.teams.filter((team) => team.id !== id);
        st.members = st.members.filter((member) => member.teamId !== id);
        delete st.teamProfiles[id];

        teamId = st.teams[0]?.id || null;
        saveDraft();
        render();
      });
    });
  }

  function renderMembers() {
    const el = $("#caMembers");
    if (!el) return;

    const members = st.members.filter((member) => !teamId || !member.teamId || member.teamId === teamId);

    el.innerHTML = members.length
      ? members
          .map(
            (member) => `
              <article class="ca-member">
                <div class="ca-item-actions">
                  <button class="ca-item-action" type="button" data-edit-member="${esc(member.id)}">✎</button>
                  <button class="ca-item-action danger" type="button" data-delete-member-quick="${esc(member.id)}">×</button>
                </div>
                <span></span>
                <strong>${esc(member.name)}</strong>
                <small>${esc(member.jobTitle)}</small>
              </article>
            `,
          )
          .join("")
      : '<div class="ca-empty">No team members added yet. Use “Add Team Members” to build this team.</div>';

    el.querySelectorAll("[data-edit-member]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!confirmModify()) return;
        open("edit-member", { memberId: button.dataset.editMember });
      });
    });

    el.querySelectorAll("[data-delete-member-quick]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!confirmDelete()) return;
        st.members = st.members.filter((member) => member.id !== button.dataset.deleteMemberQuick);
        saveDraft();
        render();
      });
    });
  }

  function renderChips(id, arr, type) {
    const el = $(id);
    if (!el) return;

    const editKind = id === "#caOffices" ? "office" : "product";

    el.innerHTML = (arr || [])
      .map(
        (item) => `
          <div class="ca-chip ${type || ""}">
            <div class="ca-item-actions">
              <button class="ca-item-action" type="button" data-edit-${editKind}="${esc(item.id)}">✎</button>
              <button class="ca-item-action danger" type="button" data-delete-${editKind}-quick="${esc(item.id)}">×</button>
            </div>
            <span></span>
            ${esc(item.name)}
          </div>
        `,
      )
      .join("");

    if (editKind === "office") {
      el.querySelectorAll("[data-edit-office]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!confirmModify()) return;
          open("edit-office", { officeId: button.dataset.editOffice });
        });
      });

      el.querySelectorAll("[data-delete-office-quick]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!confirmDelete()) return;
          st.offices = st.offices.filter((office) => office.id !== button.dataset.deleteOfficeQuick);
          saveDraft();
          render();
        });
      });
    }

    if (editKind === "product") {
      el.querySelectorAll("[data-edit-product]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!confirmModify()) return;
          open("edit-product", { productId: button.dataset.editProduct });
        });
      });

      el.querySelectorAll("[data-delete-product-quick]").forEach((button) => {
        button.addEventListener("click", () => {
          if (!confirmDelete()) return;
          st.products = st.products.filter((product) => product.id !== button.dataset.deleteProductQuick);
          saveDraft();
          render();
        });
      });
    }
  }

  function renderProfile() {
    const el = $("#caTeamProfile");
    const team = activeTeam();
    if (!el) return;

    if (!team) {
      el.innerHTML = "<p>No team profile added yet.</p>";
      return;
    }

    const profile = st.teamProfiles[team.id];

    if (!profile) {
      el.innerHTML = "<p>No team profile added yet.</p>";
      return;
    }

    const points =
      mode === "operate"
        ? [
            ["How We're Led", profile.led],
            ["What We're Solving Now", profile.solving],
            ["A Typical Day", profile.day],
            ["What We Value", profile.value],
            ["Growth Here", profile.growth],
          ]
        : [
            ["Who We Are", profile.who],
            ["What We're Great At", profile.great],
            ["Team Culture", profile.culture],
            ["How We Work Together", profile.work],
            ["This team is NOT for you if...", profile.notFor, true],
          ];

    el.innerHTML =
      points
        .filter(([, value]) => String(value || "").trim())
        .map(
          ([title, text, danger]) => `
            <section class="ca-point ${danger ? "danger" : ""}">
              <h4>${esc(title)}</h4>
              <p>${esc(text)}</p>
            </section>
          `,
        )
        .join("") || "<p>No team profile added yet.</p>";
  }

  function renderStatus() {
    const label = $("[data-published-label]");
    if (label) label.textContent = st.published ? "Published" : "Unpublished";

    const map = [
      ["#caPortfolio", st.products, "product/service"],
      ["#caPhotos", st.photos, "photo"],
      ["#caPartners", st.partners, "partner"],
      ["#caCustomers", st.customers, "customer"],
      ["#caInvestors", st.investors, "investor"],
      ["#caSubsidiaries", st.subsidiaries, "subsidiary"],
    ];

    map.forEach(([selector, arr, labelText]) => {
      const el = $(selector);
      if (el) {
        el.textContent = arr.length
          ? `${arr.length} ${labelText}(s) in draft. Use the header publish button to update the public page.`
          : `No ${labelText}s added yet.`;
      }
    });

    const photosCount = $("#caPhotosCount");
    if (photosCount) photosCount.textContent = `${st.photos.length}/10`;
  }

  function render() {
    renderTabs();
    renderMembers();
    renderChips("#caOffices", st.offices);
    renderChips("#caProducts", st.products, "product");
    renderProfile();
    renderStatus();
    updateProfileButton();
    refreshEditUI();
  }

  function fillTeamSelect(select) {
    if (!select) return;

    select.innerHTML = st.teams.length
      ? st.teams
          .map((team) => `<option value="${esc(team.id)}" ${team.id === teamId ? "selected" : ""}>${esc(team.name)}</option>`)
          .join("")
      : '<option value="">Create a team first</option>';
  }

  function hydrateEditModal(name, payload = {}) {
    if (!content) return;

    if (name === "edit-team") {
      const team = st.teams.find((item) => item.id === payload.teamId);
      if (!team) return;

      content.querySelector('[data-field="teamId"]').value = team.id;
      content.querySelector('[data-field="teamName"]').value = team.name || "";
    }

    if (name === "edit-member") {
      const member = st.members.find((item) => item.id === payload.memberId);
      if (!member) return;

      content.querySelector('[data-field="memberId"]').value = member.id;
      content.querySelector('[data-field="memberName"]').value = member.name || "";
      content.querySelector('[data-field="jobTitle"]').value = member.jobTitle || "";
    }

    if (name === "edit-office") {
      const office = st.offices.find((item) => item.id === payload.officeId);
      if (!office) return;

      content.querySelector('[data-field="officeId"]').value = office.id;
      content.querySelector('[data-field="cityName"]').value = office.name || "";
    }

    if (name === "edit-product") {
      const product = st.products.find((item) => item.id === payload.productId);
      if (!product) return;

      content.querySelector('[data-field="productId"]').value = product.id;
      content.querySelector('[data-field="productName"]').value = product.name || "";

      const status = content.querySelector('[data-field="productStatus"]');
      if (status && product.status) status.value = product.status;
    }
  }

  function open(name, payload = {}) {
    const template = document.getElementById("modal-" + name);
    if (!template || !overlay || !content) return;

    content.innerHTML = "";
    content.appendChild(template.content.cloneNode(true));

    modal?.classList.toggle("large", name === "profile");
    content.querySelectorAll('[data-field="teamId"]').forEach(fillTeamSelect);

    hydrateEditModal(name, payload);

    if (name === "profile") {
      hydrateProfileModal();
      const teamSelect = content.querySelector('[data-field="teamId"]');
      teamSelect?.addEventListener("change", () => hydrateProfileModal(teamSelect.value));
    }

    overlay.classList.add("open");
    bind();
  }

  function close() {
    overlay?.classList.remove("open");
  }

  function bind() {
    content?.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.onclick = close;
    });

    const teamName = content?.querySelector('[data-field="teamName"]');
    const counter = content?.querySelector(".ca-counter");

    teamName?.addEventListener("input", () => {
      if (counter) counter.textContent = `${teamName.value.length}/35`;
    });

    content?.querySelector("[data-create-team]")?.addEventListener("click", () => {
      const name =
        content.querySelector('[data-field="teamName"]')?.value.trim() || `Team ${st.teams.length + 1}`;

      const team = { id: uid("team"), name };

      st.teams.push(team);
      teamId = team.id;

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-add-member]")?.addEventListener("click", () => {
      if (!st.teams.length) {
        note("Create a team first", "You need a team before adding members.");
        return;
      }

      const selectedTeamId = content.querySelector('[data-field="teamId"]')?.value || teamId;

      st.members.push({
        id: uid("member"),
        teamId: selectedTeamId,
        name: content.querySelector('[data-field="memberName"]')?.value.trim() || `Member ${st.members.length + 1}`,
        jobTitle: content.querySelector('[data-field="jobTitle"]')?.value.trim() || "Team Member",
      });

      teamId = selectedTeamId;
      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-save-profile]")?.addEventListener("click", () => {
      if (!st.teams.length) {
        note("Create a team first", "You need a team before adding a profile.");
        return;
      }

      const selectedTeamId = content.querySelector('[data-field="teamId"]')?.value || teamId;
      const field = (name) => content.querySelector(`[data-field="${name}"]`)?.value || "";

      st.teamProfiles[selectedTeamId] = {
        who: field("who"),
        great: field("great"),
        culture: field("culture"),
        work: field("work"),
        notFor: field("notFor"),
        led: field("led"),
        solving: field("solving"),
        day: field("day"),
        value: field("value"),
        growth: field("growth"),
      };

      teamId = selectedTeamId;
      saveDraft();
      render();
      close();
    });

    content?.querySelectorAll("[data-add-item]").forEach((button) => {
      button.onclick = () => {
        const key = button.dataset.addItem;
        const value =
          content.querySelector('[data-field="name"]')?.value.trim() || `${key.slice(0, -1)} ${st[key].length + 1}`;
        const status = content.querySelector('[data-field="status"]')?.value || "";

        st[key].push({ id: uid(key), name: value, status });

        saveDraft();
        render();
        close();
      };
    });

    content?.querySelector("[data-add-photo]")?.addEventListener("click", () => {
      st.photos.push({ id: uid("photo"), name: `Photo ${st.photos.length + 1}` });

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-add-parent]")?.addEventListener("click", () => {
      st.parentCompany = content.querySelector('[data-field="name"]')?.value.trim() || "Parent Company";

      saveDraft();
      close();
      note("Parent company added", "Use the header publish button to update the public page.");
    });

    content?.querySelector("[data-update-team]")?.addEventListener("click", () => {
      const id = content.querySelector('[data-field="teamId"]')?.value;
      const team = st.teams.find((item) => item.id === id);
      if (!team) return;

      team.name = content.querySelector('[data-field="teamName"]')?.value.trim() || team.name;

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-delete-team]")?.addEventListener("click", () => {
      if (!confirmDelete()) return;

      const id = content.querySelector('[data-field="teamId"]')?.value;

      st.teams = st.teams.filter((team) => team.id !== id);
      st.members = st.members.filter((member) => member.teamId !== id);
      delete st.teamProfiles[id];

      teamId = st.teams[0]?.id || null;

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-update-member]")?.addEventListener("click", () => {
      const id = content.querySelector('[data-field="memberId"]')?.value;
      const member = st.members.find((item) => item.id === id);
      if (!member) return;

      member.name = content.querySelector('[data-field="memberName"]')?.value.trim() || member.name;
      member.jobTitle = content.querySelector('[data-field="jobTitle"]')?.value.trim() || member.jobTitle;

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-delete-member]")?.addEventListener("click", () => {
      if (!confirmDelete()) return;

      const id = content.querySelector('[data-field="memberId"]')?.value;
      st.members = st.members.filter((member) => member.id !== id);

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-update-office]")?.addEventListener("click", () => {
      const id = content.querySelector('[data-field="officeId"]')?.value;
      const office = st.offices.find((item) => item.id === id);
      if (!office) return;

      office.name = content.querySelector('[data-field="cityName"]')?.value.trim() || office.name;

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-delete-office]")?.addEventListener("click", () => {
      if (!confirmDelete()) return;

      const id = content.querySelector('[data-field="officeId"]')?.value;
      st.offices = st.offices.filter((office) => office.id !== id);

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-update-product]")?.addEventListener("click", () => {
      const id = content.querySelector('[data-field="productId"]')?.value;
      const product = st.products.find((item) => item.id === id);
      if (!product) return;

      product.name = content.querySelector('[data-field="productName"]')?.value.trim() || product.name;
      product.status = content.querySelector('[data-field="productStatus"]')?.value || product.status;

      saveDraft();
      render();
      close();
    });

    content?.querySelector("[data-delete-product]")?.addEventListener("click", () => {
      if (!confirmDelete()) return;

      const id = content.querySelector('[data-field="productId"]')?.value;
      st.products = st.products.filter((product) => product.id !== id);

      saveDraft();
      render();
      close();
    });
  }

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.onclick = () => {
      const modalName = button.dataset.openModal;

      if (modalName === "profile") {
        const team = activeTeam();
        const hasProfile = Boolean(team && st.teamProfiles[team.id]);

        if (hasProfile && !confirmModify()) return;
      }

      open(modalName);
    };
  });

  document.addEventListener(
    "click",
    (event) => {
      const closeButton = event.target?.closest?.("[data-close-modal], .ca-x");
      if (!closeButton) return;

      event.preventDefault();
      event.stopPropagation();
      close();
    },
    true,
  );

  $("[data-toggle-edit-mode]")?.addEventListener("click", () => {
    if (!editMode && !confirmModify()) return;

    editMode = !editMode;
    refreshEditUI();
  });

  $("[data-toggle-published]")?.addEventListener("click", () => {
    if (st.published) {
      st.published = false;
      saveDraft();
      localStorage.setItem(PUB, JSON.stringify(st));
      renderStatus();
      note("Unpublished", "Your profile is no longer public.");
    } else {
      publish();
    }
  });

  $("[data-company-name]")?.addEventListener("input", saveDraft);

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.onclick = () => {
      mode = button.dataset.mode;

      document.querySelectorAll("[data-mode]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      renderProfile();
    };
  });

  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  load();
  saveDraft();
  render();
})();
