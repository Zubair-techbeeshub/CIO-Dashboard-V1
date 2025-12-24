import Papa from 'papaparse';
// Get tenant ID from current domain
function getTenantId(): string {
  const hostname = window.location.hostname;

  // For local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'american_logics';
  }

  // For Vercel preview deployments
  if (hostname.includes('vercel-preview')) {
    return 'american_logics';
  }

  // For production Vercel deployment
  if (hostname.includes('vercel.app')) {
    return 'american_logics';
  }

  // Extract tenant from subdomain (e.g., client1.yourdomain.com -> client1)
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0].toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  // Fallback to default tenant
  return 'american_logics';
}

// Load CSV file
async function loadCSV(filename: string): Promise<any[]> {
  const tenantId = getTenantId();
  // Prefer the API base URL from environment for production (HTTPS). If not set, use same-origin path.
  const apiBase = (import.meta.env.VITE_API_URL as string) || '';
  const path = `/data/tenant_${tenantId}/${filename}`;
  const url = apiBase ? `${apiBase}${path}` : path;
  console.log('Loading CSV from:', url);
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  console.log('CSV text length:', csvText.length);
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parsed data for', filename, ':', results.data.length, 'rows');
        console.log('Fields:', results.meta.fields);
        if (results.data.length > 0) {
          console.log('First row:', results.data[0]);
        }
        resolve(results.data);
      },
      error: reject
    });
  });
}

// Data loading functions - Now loading from CSV files directly
export async function loadExecutiveSummary() {
  const data = await loadCSV('executive_summary.csv');
  const metrics: Record<string, any> = {};
  data.forEach((row: any) => {
    metrics[row.Metric] = row.Value;
  });

  const projData = await loadCSV('project_summary.csv');
  const projMetrics: Record<string, any> = {};
  projData.forEach((row: any) => {
    projMetrics[row.Metric] = row.Value;
  });

  const completionData = await loadCSV('project_completion_trend.csv');
  const vulnData = await loadCSV('vulnerability_trend.csv');

  return {
    yoyRevenueGrowth: metrics.YoYRevenueGrowth || 0,
    totalITSpend: metrics.TotalITSpend || 0,
    itSpendAsPercentRevenue: metrics.ITSpendAsPercentRevenue || 0,
    budgetUtilization: metrics.BudgetUtilization || 0,
    systemUptime: metrics.SystemUptime || 0,
    securityIncidentsMoM: metrics.SecurityIncidentsMoM || 0,
    responseTimeMin: metrics.ResponseTimeMin || 0,
    cloudSpend: metrics.CloudSpend || 0,
    cloudCapacityUtilization: metrics.CloudCapacityUtilization || 0,
    projectSummary: {
      inProgress: projMetrics.InProgress || 0,
      atRisk: projMetrics.AtRisk || 0,
      completed: projMetrics.Completed || 0,
      completionTrend: completionData.map((row: any) => ({
        Month: row.Month,
        Completed: row.Completed
      }))
    },
    vulnerabilityTrend: vulnData.map((row: any) => ({
      Month: row.Month,
      Count: row.Count
    }))
  };
}

export async function loadProjectSummary() {
  const data = await loadCSV('project_summary.csv');
  return data.map((row: any) => ({
    Metric: row.Metric,
    Value: row.Value
  }));
}

export async function loadProjectCompletionTrend() {
  const data = await loadCSV('project_completion_trend.csv');
  return data.map((row: any) => ({
    Month: row.Month,
    Completed: row.Completed
  }));
}

export async function loadVulnerabilityTrend() {
  const data = await loadCSV('vulnerability_trend.csv');
  return data.map((row: any) => ({
    Month: row.Month,
    Count: row.Count
  }));
}

export async function loadPortfolioPrograms() {
  const data = await loadCSV('portfolio_programs.csv');
  return convertPortfolioPrograms(data);
}

export async function loadApplicationHealth() {
  const data = await loadCSV('application_health.csv');
  return convertApplicationHealth(data);
}

export async function loadTechnologyProjects() {
  const data = await loadCSV('technology_projects.csv');
  return convertTechnologyProjects(data);
}

export async function loadWorkforceMetrics() {
  const data = await loadCSV('workforce_metrics.csv');
  return convertWorkforceMetrics(data);
}

export async function loadDeliveryPerformance() {
  const data = await loadCSV('delivery_performance.csv');
  return convertDeliveryPerformance(data);
}

export async function loadSpendTrend() {
  return await loadCSV('monthly_spend_trend.csv');
}

export async function loadSpendCategories() {
  return await loadCSV('spend_categories.csv');
}

export async function loadActiveIncidents() {
  return await loadCSV('active_incidents.csv');
}

export async function loadSkillDistribution() {
  return await loadCSV('skills_distribution.csv');
}

// Helper functions to convert API data to component-friendly format
export function convertExecutiveSummary(data: any) {
  return {
    yoyRevenueGrowth: data.yoyRevenueGrowth || 0,
    totalITSpend: data.totalITSpend || 0,
    itSpendAsPercentRevenue: data.itSpendAsPercentRevenue || 0,
    budgetUtilization: data.budgetUtilization || 0,
    systemUptime: data.systemUptime || 0,
    securityIncidentsMoM: data.securityIncidentsMoM || 0,
    responseTimeMin: data.responseTimeMin || 0,
    cloudSpend: data.cloudSpend || 0,
    cloudCapacityUtilization: data.cloudCapacityUtilization || 0,
  };
}

export function convertProjectSummary(summaryData: any[], trendData: any[]) {
  const metrics: Record<string, number> = {};
  summaryData.forEach(item => {
    metrics[item.Metric] = item.Value;
  });
  
  return {
    inProgress: metrics.InProgress || 0,
    atRisk: metrics.AtRisk || 0,
    completed: metrics.Completed || 0,
    completionTrendByMonth: trendData.map(item => ({
      month: item.Month || item.month,
      completed: item.Completed || item.completed
    }))
  };
}

export function convertPortfolioPrograms(data: any[]) {
  return data.map(item => ({
    programName: item['Program Name'],
    budgetType: item['Budget Type'],
    annualBudget: item['Annual Budget ($M)'],
    ytdActual: item['YTD Actual ($M)'],
    targetYtd: item['Target YTD ($M)'],
    variance: item['Variance %'] || item['Variance%'] || item.Variance || 0,
    status: item.Status,
    poc: item.POC,
    top3Issues: item.Top3Issues ? item.Top3Issues.split('|').map((s: string) => s.trim()) : []
  }));
}

export function convertApplicationHealth(data: any[]) {
  return data.map(item => ({
    application: item.Application,
    domain: item.Domain,
    availability: item['Availability %'],
    incidents: item['Incidents (90 Days)'],
    patchCompliance: item['Patch Compliance %'],
    status: item.Status,
    downIncidences3Months: item.DownIncidences3Months
  }));
}

export function convertTechnologyProjects(data: any[]) {
  return data.map(item => ({
    domain: item.Domain,
    projectName: item['Project Name'],
    budget: item['Budget ($M)'],
    actual: item['Actual ($M)'],
    scheduleStatus: item['Schedule Status'],
    topIssue: item['Top Issue'],
    poc: item.POC
  }));
}

export function convertWorkforceMetrics(data: any[]) {
  return data.map(item => ({
    resourceType: item['Resource Type'],
    plannedHours: item['Planned Hours'],
    actualHours: item['Actual Hours'],
    variancePercent: item['Variance %'],
    openPositions: item['Open Positions'],
    utilizationRate: item.UtilizationRate
  }));
}

export function convertDeliveryPerformance(data: any[]) {
  return data.map(item => ({
    project: item.Project,
    milestonesOnTime: item['Milestones On-Time %'],
    scopeChanges90Days: item['Scope Changes (90 Days)'],
    budgetBurn: item['Budget Burn %'],
    hoursBurn: item['Hours Burn %'],
    avgDaysProcurementToWA: item.AvgDaysProcurementToWA
  }));
}
