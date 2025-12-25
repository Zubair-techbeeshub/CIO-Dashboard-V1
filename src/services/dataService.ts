import Papa from 'papaparse';

/* ======================================================
   Tenant Resolution
   ====================================================== */

function getTenantId(): string {
  const hostname = window.location.hostname;

  // 1️⃣ Explicit env override (best)
  const envTenant = import.meta.env.VITE_TENANT_ID;
  if (envTenant && envTenant.trim()) {
    return envTenant.trim();
  }

  // 2️⃣ Known deployments → single tenant
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app') ||
    hostname === 'cio-dashboard.techbeeshub.com'
  ) {
    return 'american_logics';
  }

  // 3️⃣ Future multi-tenant support
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0].toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  // 4️⃣ Absolute fallback
  return 'american_logics';
}

/* ======================================================
   Core CSV Loader
   ====================================================== */

async function loadCSV<T = any>(filename: string): Promise<T[]> {
  const tenantId = getTenantId();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://api.techbeeshub.com';

  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/data/${tenantId}/${filename}`;

  console.log('Loading CSV from:', url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
}

/* ======================================================
   Executive Summary (MULTIPLE CSVs)
   ====================================================== */

export async function loadExecutiveSummary() {
  const [
    kpis,
    financials,
    risks,
    initiatives,
  ] = await Promise.all([
    loadCSV('executive_summary.csv'),
    loadCSV('financial_summary.csv'),
    loadCSV('risk_summary.csv'),
    loadCSV('key_initiatives.csv'),
  ]);

  return {
    kpis,
    financials,
    risks,
    initiatives,
  };
}

/* ======================================================
   Portfolio
   ====================================================== */

export async function loadPortfolioOverview() {
  return loadCSV('portfolio_overview.csv');
}

export async function loadPortfolioProjects() {
  return loadCSV('portfolio_projects.csv');
}

/* ======================================================
   Workforce
   ====================================================== */

export async function loadWorkforceSummary() {
  return loadCSV('workforce_summary.csv');
}

export async function loadWorkforceSkills() {
  return loadCSV('workforce_skills.csv');
}

/* ======================================================
   Projects
   ====================================================== */

export async function loadProjectsSummary() {
  return loadCSV('projects_summary.csv');
}

export async function loadProjectsTimeline() {
  return loadCSV('projects_timeline.csv');
}

/* ======================================================
   Utilities / Helpers
   ====================================================== */

export async function loadAnyCSV(filename: string) {
  return loadCSV(filename);
}
