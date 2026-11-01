(function () {
  "use strict";

  const config = window.RSI_SUPABASE_CONFIG || {};
  const configReady =
    config.url &&
    config.publishableKey &&
    !config.url.includes("YOUR_PROJECT_REF") &&
    !config.publishableKey.includes("YOUR_SUPABASE");

  const loginView = document.getElementById("loginView");
  const dashboardView = document.getElementById("dashboardView");
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");
  const loginError = document.getElementById("loginError");
  const logoutButton = document.getElementById("logoutButton");
  const portalMessage = document.getElementById("portalMessage");

  let supabaseClient = null;
  let currentProfile = null;
  let currentAgency = null;
  let rentals = [];
  let statements = [];
  let agencyMap = new Map();

  const RSI_FEE_PER_ACTIVE_DAY = 1;

  function money(value) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  }

  function safeText(value, fallback = "—") {
    return value === null || value === undefined || value === "" ? fallback : String(value);
  }

  function dateLabel(value) {
    if (!value) return "—";
    const d = new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  }

  function inclusiveDays(start, end) {
    if (!start || !end) return 0;
    const a = new Date(start + "T00:00:00Z");
    const b = new Date(end + "T00:00:00Z");
    const ms = b - a;
    if (!Number.isFinite(ms) || ms < 0) return 0;
    return Math.floor(ms / 86400000) + 1;
  }

  function isCurrentlyActive(rental) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = rental.lease_start ? new Date(rental.lease_start + "T00:00:00") : null;
    const end = rental.lease_end ? new Date(rental.lease_end + "T23:59:59") : null;

    return (!start || start <= today) && (!end || end >= today);
  }

  function rentalFinancials(rental) {
    if (!rental.rsi_enabled) {
      return { days: 0, rsiOwed: 0, gross: 0, partnerKeeps: 0 };
    }

    const days = inclusiveDays(rental.lease_start, rental.lease_end);
    const customerPrice = Number(rental.customer_price_per_day || 3);
    const rsiOwed = days * RSI_FEE_PER_ACTIVE_DAY;
    const gross = days * customerPrice;
    const partnerKeeps = days * Math.max(0, customerPrice - RSI_FEE_PER_ACTIVE_DAY);

    return { days, rsiOwed, gross, partnerKeeps };
  }

  function showLoginError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
  }

  function clearLoginError() {
    loginError.hidden = true;
    loginError.textContent = "";
  }

  function showMessage(message) {
    portalMessage.textContent = message;
    portalMessage.hidden = false;
  }

  function clearMessage() {
    portalMessage.hidden = true;
    portalMessage.textContent = "";
  }

  async function getProfile(userId) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, full_name, role, agency_id")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async function getAgency(agencyId) {
    if (!agencyId) return null;

    const { data, error } = await supabaseClient
      .from("agencies")
      .select("id, name, city, country")
      .eq("id", agencyId)
      .single();

    if (error) throw error;
    return data;
  }

  async function getAgenciesForAdmin() {
    if (currentProfile.role !== "admin") return [];

    const { data, error } = await supabaseClient
      .from("agencies")
      .select("id, name, city, country")
      .order("name");

    if (error) throw error;
    return data || [];
  }

  async function getRentals() {
    let query = supabaseClient
      .from("rentals")
      .select(`
        id,
        agency_id,
        plate,
        vehicle_model,
        customer_name,
        country_of_origin,
        lease_start,
        lease_end,
        rsi_enabled,
        customer_price_per_day,
        status
      `)
      .order("lease_start", { ascending: false });

    if (currentProfile.role !== "admin") {
      query = query.eq("agency_id", currentProfile.agency_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function getStatements() {
    let query = supabaseClient
      .from("billing_statements")
      .select(`
        id,
        agency_id,
        period_start,
        period_end,
        active_vehicle_days,
        rsi_amount,
        partner_amount,
        gross_amount,
        status
      `)
      .order("period_end", { ascending: false })
      .limit(12);

    if (currentProfile.role !== "admin") {
      query = query.eq("agency_id", currentProfile.agency_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  function setIdentity(user) {
    const isAdmin = currentProfile.role === "admin";
    const agencyName = isAdmin
      ? "All agencies"
      : safeText(currentAgency && currentAgency.name, "Rent-a-Car Agency");

    document.getElementById("userEmail").textContent = user.email || "";
    document.getElementById("agencyNameTop").textContent = agencyName;
    document.getElementById("accountAgency").textContent = agencyName;
    document.getElementById("accountRole").textContent = isAdmin ? "RSI ADMIN" : "RAC";
    document.getElementById("dashboardRoleLabel").textContent =
      isAdmin ? "RSI ADMIN DASHBOARD" : "PARTNER DASHBOARD";

    document.getElementById("adminAgencyStat").hidden = !isAdmin;
    document.getElementById("agencyColumnHeader").hidden = !isAdmin;
  }

  function renderStats() {
    const active = rentals.filter(isCurrentlyActive);
    const rsiEnabled = active.filter((r) => r.rsi_enabled);

    let vehicleDays = 0;
    let rsiOwed = 0;
    let gross = 0;
    let partnerKeeps = 0;

    active.forEach((rental) => {
      const f = rentalFinancials(rental);
      vehicleDays += f.days;
      rsiOwed += f.rsiOwed;
      gross += f.gross;
      partnerKeeps += f.partnerKeeps;
    });

    document.getElementById("statActiveRentals").textContent = active.length;
    document.getElementById("statRsiEnabled").textContent = rsiEnabled.length;
    document.getElementById("statRsiOwed").textContent = money(rsiOwed);
    document.getElementById("statPartnerRevenue").textContent = money(partnerKeeps);
    document.getElementById("statVehicleDays").textContent = vehicleDays;
    document.getElementById("statGrossRevenue").textContent = money(gross);

    document.getElementById("billingRsiOwed").textContent = money(rsiOwed);
    document.getElementById("billingPartnerRevenue").textContent = money(partnerKeeps);
    document.getElementById("billingGross").textContent = money(gross);

    if (currentProfile.role === "admin") {
      document.getElementById("statAgencies").textContent = agencyMap.size;
    }
  }

  function agencyName(agencyId) {
    if (currentProfile.role !== "admin") {
      return currentAgency ? currentAgency.name : "Agency";
    }
    const agency = agencyMap.get(agencyId);
    return agency ? agency.name : "Unknown agency";
  }

  function renderOverview() {
    const host = document.getElementById("overviewRentalList");
    const active = rentals.filter(isCurrentlyActive).slice(0, 6);

    if (!active.length) {
      host.innerHTML = '<div class="portal-empty">No active rentals.</div>';
      return;
    }

    host.innerHTML = active.map((r) => {
      const f = rentalFinancials(r);
      return `
        <div class="portal-rental-row">
          <div>
            <strong>${safeText(r.vehicle_model)}</strong>
            <small>ΠΙΝΑΚΙΔΑ ΚΥΚΛΟΦΟΡΙΑΣ: ${safeText(r.plate)}</small>
          </div>
          <div>
            <strong>${safeText(r.customer_name)}</strong>
            <small>Country of Origin: ${safeText(r.country_of_origin)}</small>
          </div>
          <div>
            <strong>${dateLabel(r.lease_start)} → ${dateLabel(r.lease_end)}</strong>
            <small>${f.days} leased day${f.days === 1 ? "" : "s"}</small>
          </div>
          <div>
            <span class="portal-pill ${r.rsi_enabled ? "portal-pill--on" : "portal-pill--off"}">
              ${r.rsi_enabled ? "RSI ON" : "RSI OFF"}
            </span>
            <small>${agencyName(r.agency_id)}</small>
          </div>
        </div>`;
    }).join("");
  }

  function renderRentals(filterText = "") {
    const body = document.getElementById("rentalsTableBody");
    const isAdmin = currentProfile.role === "admin";
    const q = filterText.trim().toLowerCase();

    const filtered = rentals.filter((r) => {
      if (!q) return true;
      const haystack = [
        r.vehicle_model,
        r.plate,
        r.customer_name,
        r.country_of_origin,
        agencyName(r.agency_id)
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (!filtered.length) {
      body.innerHTML = `
        <tr>
          <td colspan="${isAdmin ? 7 : 6}">
            <div class="portal-empty">No rentals found.</div>
          </td>
        </tr>`;
      return;
    }

    body.innerHTML = filtered.map((r) => {
      const f = rentalFinancials(r);
      return `
        <tr>
          ${isAdmin ? `<td><strong>${agencyName(r.agency_id)}</strong></td>` : ""}
          <td>
            <strong>${safeText(r.vehicle_model)}</strong>
            <small>ΠΙΝΑΚΙΔΑ ΚΥΚΛΟΦΟΡΙΑΣ: ${safeText(r.plate)}</small>
          </td>
          <td>
            <strong>${safeText(r.customer_name)}</strong>
            <small>Country of Origin: ${safeText(r.country_of_origin)}</small>
          </td>
          <td>
            <strong>${dateLabel(r.lease_start)} → ${dateLabel(r.lease_end)}</strong>
            <small>${f.days} day${f.days === 1 ? "" : "s"}</small>
          </td>
          <td>
            <span class="portal-pill ${r.rsi_enabled ? "portal-pill--on" : "portal-pill--off"}">
              ${r.rsi_enabled ? "ON" : "OFF"}
            </span>
          </td>
          <td><strong>${money(f.rsiOwed)}</strong><small>€1 / active leased day</small></td>
          <td><strong>${money(f.partnerKeeps)}</strong><small>At ${money(r.customer_price_per_day || 3)} / day</small></td>
        </tr>`;
    }).join("");

    document.getElementById("agencyColumnHeader").style.display = isAdmin ? "" : "none";
  }

  function renderStatements() {
    const host = document.getElementById("statementList");

    if (!statements.length) {
      host.innerHTML = '<div class="portal-empty">No billing statements yet.</div>';
      return;
    }

    host.innerHTML = statements.map((s) => `
      <div class="portal-statement">
        <div>
          <strong>${dateLabel(s.period_start)} → ${dateLabel(s.period_end)}</strong>
          <span>${agencyName(s.agency_id)}</span>
        </div>
        <strong>${money(s.rsi_amount)}</strong>
        <span>${Number(s.active_vehicle_days || 0)} vehicle-days</span>
        <em>${safeText(s.status, "Open")}</em>
      </div>
    `).join("");
  }

  async function loadDashboard(user) {
    clearMessage();

    currentProfile = await getProfile(user.id);

    if (!["admin", "rac"].includes(currentProfile.role)) {
      throw new Error("This account does not have portal access.");
    }

    currentAgency = currentProfile.agency_id
      ? await getAgency(currentProfile.agency_id)
      : null;

    const agencies = await getAgenciesForAdmin();
    agencyMap = new Map(agencies.map((a) => [a.id, a]));

    [rentals, statements] = await Promise.all([
      getRentals(),
      getStatements()
    ]);

    setIdentity(user);
    renderStats();
    renderOverview();
    renderRentals();
    renderStatements();

    loginView.hidden = true;
    dashboardView.hidden = false;
  }

  async function enterFromExistingSession() {
    if (!configReady) {
      showLoginError(
        "Supabase is not configured yet. Add your project URL and publishable key in js/supabase-config.js."
      );
      return;
    }

    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data || !data.user) return;

    try {
      await loadDashboard(data.user);
    } catch (err) {
      showLoginError(err.message || "Could not load portal access.");
      await supabaseClient.auth.signOut();
    }
  }

  async function login(event) {
    event.preventDefault();
    clearLoginError();

    if (!configReady) {
      showLoginError(
        "Supabase is not configured yet. Add your project URL and publishable key in js/supabase-config.js."
      );
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Signing in…";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error("Login failed.");

      await loadDashboard(data.user);
    } catch (err) {
      showLoginError(err.message || "Could not sign in.");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Sign in";
    }
  }

  async function logout() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

    currentProfile = null;
    currentAgency = null;
    rentals = [];
    statements = [];
    agencyMap = new Map();

    dashboardView.hidden = true;
    loginView.hidden = false;
    document.getElementById("loginPassword").value = "";
  }

  function showPage(page) {
    document.querySelectorAll(".portal-page").forEach((el) => {
      el.hidden = el.id !== `page-${page}`;
    });

    document.querySelectorAll(".portal-nav button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.page === page);
    });

    const titles = {
      overview: "Fleet Overview",
      rentals: "Rental Contracts",
      billing: "Billing"
    };
    document.getElementById("dashboardTitle").textContent = titles[page] || "Dashboard";
  }

  loginForm.addEventListener("submit", login);
  logoutButton.addEventListener("click", logout);

  document.querySelectorAll(".portal-nav button").forEach((btn) => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
  });

  document.querySelectorAll("[data-open-page]").forEach((btn) => {
    btn.addEventListener("click", () => showPage(btn.dataset.openPage));
  });

  document.getElementById("rentalSearch").addEventListener("input", (event) => {
    renderRentals(event.target.value);
  });

  if (configReady) {
    supabaseClient = window.supabase.createClient(
      config.url,
      config.publishableKey
    );
    enterFromExistingSession();
  } else {
    showLoginError(
      "Supabase is not configured yet. Add your project URL and publishable key in js/supabase-config.js."
    );
  }
})();
