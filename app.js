// ── Climate style map ─────────────────────────────────────────────────────────
const CLIMATE_STYLES = {
  "Hot and Dry":  "hot-dry",
  "Warm & humid": "warm-humid",
  "Composite":    "composite",
  "Cold":         "cold",
  "Temperate":    "temperate",
};

// ── 3-Level dropdown: State → District → City ─────────────────────────────────
function loadDistricts() {
  const state = document.getElementById("sel_state").value;
  const selD  = document.getElementById("sel_district");
  selD.innerHTML = "";
  const districts = [...new Set(
    INDIA_CITIES.filter(c => c.state === state).map(c => c.district)
  )].sort();
  districts.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d; opt.textContent = d;
    selD.appendChild(opt);
  });
  loadCities();
}

function loadCities() {
  const state    = document.getElementById("sel_state").value;
  const district = document.getElementById("sel_district").value;
  const selC     = document.getElementById("sel_city");
  selC.innerHTML = "";
  const cities = INDIA_CITIES.filter(c => c.state === state && c.district === district);
  cities.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.city; opt.textContent = c.city;
    selC.appendChild(opt);
  });
  updateClimate();
}

function updateClimate() {
  const state    = document.getElementById("sel_state").value;
  const district = document.getElementById("sel_district").value;
  const cityEl   = document.getElementById("sel_city");
  const cityName = cityEl ? cityEl.value : "";
  const city = INDIA_CITIES.find(c =>
    c.state === state && c.district === district &&
    (!cityName || c.city === cityName)
  ) || INDIA_CITIES.find(c => c.state === state && c.district === district);
  if (!city) return;
  const badge = document.getElementById("climate-badge");
  badge.className = "pill " + (CLIMATE_STYLES[city.climate] || "composite");
  badge.textContent = city.climate;
  updateHeroBadges();
}

function updateHeroBadges() {
  const state    = document.getElementById("sel_state").value;
  const district = document.getElementById("sel_district").value;
  const cityEl   = document.getElementById("sel_city");
  const cityName = cityEl ? cityEl.value : district;
  const pop      = Number(document.getElementById("population").value).toLocaleString("en-IN");
  const area     = document.getElementById("area_sqkm").value;
  const by       = document.getElementById("base_year").value;
  const ty       = document.getElementById("target_year").value;
  const city     = INDIA_CITIES.find(c => c.state === state && c.district === district) || {};
  const climate  = city.climate || "";
  document.getElementById("hero-badges").innerHTML = [
    `<span class="badge">${cityName}, ${district}</span>`,
    `<span class="badge">${state}</span>`,
    `<span class="badge">Pop: ${pop}</span>`,
    `<span class="badge">${area} km²</span>`,
    `<span class="badge">${climate}</span>`,
    `<span class="badge">${by} → ${ty}</span>`,
    `<span class="badge">IPCC 2019 · GPC</span>`,
  ].join("");
}

// ── Sliders ───────────────────────────────────────────────────────────────────
const EP_DEFAULTS = {
  "Buildings – Residential":8,"Buildings – Commercial":8,
  "Buildings – Public & Inst.":8,"Buildings – Industrial":8,
  "Electricity Generation":5,"Transport – Road":10,"Transport – Rail":5,
  "Transport – Water/Aviation":5,"Waste – Solid Waste":5,
  "Waste – Biological":5,"Waste – Wastewater":5,"AFOLU":5,"IPPU":5
};
const HA_DEFAULTS = {
  "Buildings – Residential":30,"Buildings – Commercial":30,
  "Buildings – Public & Inst.":30,"Buildings – Industrial":30,
  "Electricity Generation":20,"Transport – Road":35,"Transport – Rail":20,
  "Transport – Water/Aviation":20,"Waste – Solid Waste":40,
  "Waste – Biological":40,"Waste – Wastewater":40,"AFOLU":15,"IPPU":20
};

function buildSliders() {
  ["ep","ha"].forEach(prefix => {
    const container = document.getElementById(`${prefix}-sliders`);
    if (!container) return;
    const defaults = prefix === "ep" ? EP_DEFAULTS : HA_DEFAULTS;
    const max      = prefix === "ep" ? 30 : 75;
    SECTORS.forEach(s => {
      const safe = s.replace(/[^a-zA-Z0-9]/g,"_");
      const def  = defaults[s] || 10;
      container.innerHTML += `
        <div class="slider-row">
          <label>
            <span style="font-size:.72rem">${s}</span>
            <span id="${prefix}_${safe}_val" style="color:var(--teal);font-weight:700">${def}%</span>
          </label>
          <input type="range" id="${prefix}_${s}" min="0" max="${max}" step="1" value="${def}"
                 oninput="document.getElementById('${prefix}_${safe}_val').textContent=this.value+'%'">
        </div>`;
    });
  });
}

// ── Collect form data ─────────────────────────────────────────────────────────
function collectFormData() {
  const d = {};
  const ids = [
    "population","area_sqkm","base_year","target_year","interim1","interim2",
    "growth_rate","target_pct","sel_state","sel_district","sel_city","tier",
    "res_Electricity","res_Firewood","res_Kerosene","res_PNG","res_LPG",
    "com_Electricity","com_Firewood","com_Kerosene","com_PNG","com_LPG",
    "ins_Electricity","ins_Firewood","ins_Kerosene","ins_LPG","ins_PNG",
    "ind_Electricity","ind_Coal","ind_Diesel","ind_PNG",
    "ng_tj","coal_tj","msw_pw",
    "t_pet","t_die","t_cng","t_alpg","t_elec",
    "r_die","r_elec","w_pet","w_die","av_gas","av_jet",
    "sw_tot","sw_lfm","sw_lfu","sw_inc","sw_com",
    "ww_bod","ww_prot","ww_aer","ww_uasb","ww_sep","ww_open",
    "af_dc","af_ndc","af_bufd","af_bufnd","af_sheep","af_goat","af_wet",
    "af_fd","af_fm","af_fo",
    "ip_clink","ip_cfrac","ip_lime","ip_ls","ip_nh3","ip_hno3","ip_bof","ip_eaf",
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let key = id
      .replace("sel_state","state")
      .replace("sel_district","district")
      .replace("sel_city","city");
    d[key] = el.value;
  });
  SECTORS.forEach(s => {
    const ep = document.getElementById(`ep_${s}`);
    const ha = document.getElementById(`ha_${s}`);
    if (ep) d[`ep_${s}`] = ep.value;
    if (ha) d[`ha_${s}`] = ha.value;
  });
  return d;
}

// ── Main calculation ──────────────────────────────────────────────────────────
let lastData = null;

async function runCalculation() {
  const btn = document.querySelector(".btn-calc");
  btn.textContent = "⏳ Calculating…";
  btn.disabled = true;
  try {
    const d = collectFormData();
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(d)
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();
    lastData = d;
    renderResults(data);
  } catch(e) {
    alert("Error: " + e.message);
  }
  btn.textContent = "▶ Calculate Emissions";
  btn.disabled = false;
}

// ── Render all results ────────────────────────────────────────────────────────
function renderResults(data) {
  const k = data.kpis;

  // KPIs
  setKpi("kpi-base",   `${k.base_total_mt} Mt`);
  setKpi("kpi-capita", `${k.per_capita} t`);
  setKpi("kpi-sqkm",   `${k.per_sqkm} kt`);
  setKpi("kpi-bau",    `${k.bau_end_mt} Mt`);
  setKpi("kpi-ha",     `${k.ha_end_mt} Mt`);
  setKpi("kpi-inv",    `₹${Number(k.total_inv).toLocaleString("en-IN")} Cr`);

  // Charts
  const opt = {responsive: true, displayModeBar: false};
  if (data.charts.trajectory) Plotly.react("chart-traj",  data.charts.trajectory.data, data.charts.trajectory.layout, opt);
  if (data.charts.pie)        Plotly.react("chart-pie",   data.charts.pie.data,         data.charts.pie.layout,         opt);
  if (data.charts.bar_group)  Plotly.react("chart-bar",   data.charts.bar_group.data,   data.charts.bar_group.layout,   opt);
  if (data.charts.budget)     Plotly.react("chart-budget",data.charts.budget.data,       data.charts.budget.layout,      opt);

  // Tables
  renderTable("milestone-table", data.milestones, [
    {key:"year",        label:"Year"},
    {key:"bau",         label:"BAU (Mt)"},
    {key:"target",      label:"Target (Mt)"},
    {key:"ha",          label:"High Ambition (Mt)"},
    {key:"required_pct",label:"Required %"},
    {key:"achieved_pct",label:"HA Achieves %"},
    {key:"status",      label:"Status"},
  ], row => row.status === "On Track" ? "on-track" : "gap");

  renderTable("sector-detail-table", data.sector_detail, [
    {key:"sector",    label:"Sub-sector"},
    {key:"emissions", label:"Emissions (t CO₂e)", fmt: v => Number(v).toLocaleString("en-IN")},
    {key:"share",     label:"Share (%)"},
  ]);

  renderTable("budget-table", data.budget, [
    {key:"Sector",              label:"Sector"},
    {key:"BAU (t CO2e)",        label:"BAU (t CO₂e)",          fmt: v => Number(v).toLocaleString("en-IN")},
    {key:"Reduction %",         label:"Reduction %"},
    {key:"GHG Reduced (t CO2e)",label:"GHG Reduced (t CO₂e)",  fmt: v => Number(v).toLocaleString("en-IN")},
    {key:"Investment (Crore)",  label:"Investment (₹ Crore)"},
  ], row => row["Sector"] === "TOTAL" ? "total-row" : "");

  renderTable("target-track-table", data.milestones, [
    {key:"year",        label:"Milestone"},
    {key:"bau",         label:"BAU (Mt)"},
    {key:"target",      label:"Target (Mt)"},
    {key:"ha",          label:"High Ambition (Mt)"},
    {key:"required_pct",label:"Required %"},
    {key:"achieved_pct",label:"HA Achieves %"},
    {key:"status",      label:"Status"},
  ], row => row.status === "On Track" ? "on-track" : "gap");

  renderTable("export-table", data.milestones, [
    {key:"year",   label:"Year"},
    {key:"bau",    label:"Reference (Mt)"},
    {key:"ha",     label:"High Ambition (Mt)"},
  ]);

  updateHeroBadges();
}

function setKpi(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = val;
    el.closest(".kpi-card").style.borderTop = "3px solid var(--teal)";
  }
}

// ── Table renderer ────────────────────────────────────────────────────────────
function renderTable(containerId, rows, cols, rowClassFn) {
  if (!rows || !rows.length) {
    document.getElementById(containerId).innerHTML =
      `<div class="empty-state" style="padding:20px"><p>No data available</p></div>`;
    return;
  }
  let html = `<table class="data-table"><thead><tr>`;
  cols.forEach(c => html += `<th>${c.label}</th>`);
  html += `</tr></thead><tbody>`;
  rows.forEach(row => {
    const cls = rowClassFn ? rowClassFn(row) : "";
    html += `<tr class="${cls}">`;
    cols.forEach(c => {
      const val = row[c.key] !== undefined ? row[c.key] : "—";
      html += `<td>${c.fmt ? c.fmt(val) : val}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById(containerId).innerHTML = html;
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.add("active");
  btn.classList.add("active");
  setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
}

// ── Downloads ─────────────────────────────────────────────────────────────────
async function downloadCSV() {
  if (!lastData) { alert("Run a calculation first."); return; }
  const res = await fetch("/api/download/csv", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(lastData)
  });
  triggerDownload(await res.blob(), `ASCENT_${lastData.district || "city"}_scenarios.csv`);
}

async function downloadExcel() {
  if (!lastData) { alert("Run a calculation first."); return; }
  try {
    const res = await fetch("/api/download/excel", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(lastData)
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const city = (lastData.district || "city").replace(/\s+/g,"_");
    const by   = lastData.base_year || "2025";
    const ty   = lastData.target_year || "2050";
    triggerDownload(await res.blob(), `ASCENT_${city}_${by}_${ty}.xlsx`);
  } catch(e) {
    alert("Excel download failed: " + e.message);
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
