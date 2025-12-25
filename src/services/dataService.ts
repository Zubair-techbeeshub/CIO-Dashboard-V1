import Papa from 'papaparse';

/* ======================================================
   Tenant Resolution (FIXED)
   ====================================================== */

function getTenantId(): string {
  const envTenant = import.meta.env.VITE_TENANT_ID;
  if (envTenant && envTenant.trim()) {
    return envTenant.trim();
  }

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
   EXECUTIVE SUMMARY (MATCHES COMPONENT EXPECTATION)
   ====================================================== */

export async function loadExecutiveSummary() {
  const [
    kpis,
    financials,
    risks,
    initiatives,
    projectSummary,
    vulnerabilityTrend,
  ] = await Promise.all([
    loadCSV('executive_summary.csv'),
    loadCSV('financial_summary.csv'),
    loadCSV('risk_summary.csv'),
    loadCSV('key_initiatives.csv'),
    loadCSV('project_summary.csv'),
    loadCSV('vulnerability_trend.csv'),
  ]);

  return {
    kpis,
    financials,
    risks,
    initiatives,
    projectSummary,
    vulnerabilityTrend,
  };
}

/* ======================================================
   FINANCIAL SECTION (RESTORED)
   ====================================================== */

export async function loadSpendTrend() {
  return loadCSV('spend_trend.csv');
}

export async function loadSpendCategories() {
  return loadCSV('spend_categories.csv');
}

export async function loadWorkforceMetrics() {
  return loadCSV('workforce_metrics.csv');
}

/* ======================================================
   PORTFOLIO
   ====================================================== */

export async function loadPortfolioOverview() {
  return loadCSV('portfolio_overview.csv');
}

export async function loadPortfolioProjects() {
  return loadCSV('portfolio_projects.csv');
}

export async function loadPortfolioPrograms() {
  return loadCSV('portfolio_programs.csv');
}

export async function loadApplicationHealth() {
  return loadCSV('application_health.csv');
}

/* ======================================================
   PROJECTS
   ====================================================== */

export async function loadTechnologyProjects() {
  return loadCSV('technology_projects.csv');
}

export async function loadDeliveryPerformance() {
  return loadCSV('delivery_performance.csv');
}

/* ======================================================
   WORKFORCE
   ====================================================== */

export async function loadWorkforceSummary() {
  return loadCSV('workforce_summary.csv');
}

export async function loadSkillDistribution() {
  return loadCSV('skill_distribution.csv');
}

/* ======================================================
   GENERIC FALLBACK
   ====================================================== */

export async function loadAnyCSV(filename: string) {
  return loadCSV(filename);
}
