// Get tenant ID from current domain
function getTenantId(): string {
  const envTenant = import.meta.env.VITE_TENANT_ID;
  if (envTenant && envTenant.trim()) {
    return envTenant.trim();
  }

  return 'american_logics';
}

// Get API base URL - now defaults to Vite proxy for local development
function getApiBaseUrl(): string {
  // If VITE_API_URL is set, use it (for production)
  // Otherwise use empty string to leverage Vite proxy (for local development)
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim()) {
    return envApiUrl.replace(/\/$/, '');
  }
  return ''; // Empty string means use Vite proxy
}

// Global variable to store the token function
let getTokenFunction: (() => Promise<string | null>) | null = null;

// Function to set the token function (called by AuthContext)
export function setTokenFunction(fn: () => Promise<string | null>) {
  getTokenFunction = fn;
}

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_BASE_URL = getApiBaseUrl();
  const tenantId = getTenantId();
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  console.log(`API Call: ${url}, Tenant: ${tenantId}`);

  try {
    // Get Firebase ID token if available
    let token: string | null = null;
    if (getTokenFunction) {
      try {
        token = await getTokenFunction();
      } catch (error) {
        console.log('Error getting Firebase token:', error);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      ...options.headers as Record<string, string>,
    };

    // Add Firebase token to Authorization header if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response for ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
}

// Data loading functions - Now using backend API
export async function loadExecutiveSummary() {
  try {
    const response = await apiCall('/api/dashboard/all');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading executive summary from API:', error);
    throw error;
  }
}

export async function loadProjectSummary() {
  try {
    const response = await apiCall('/api/dashboard/all');
    if (response.success && response.data && response.data.projectSummary) {
      return [
        { Metric: 'InProgress', Value: response.data.projectSummary.inProgress || 0 },
        { Metric: 'AtRisk', Value: response.data.projectSummary.atRisk || 0 },
        { Metric: 'Completed', Value: response.data.projectSummary.completed || 0 }
      ];
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading project summary from API:', error);
    throw error;
  }
}

export async function loadProjectCompletionTrend() {
  try {
    const response = await apiCall('/api/dashboard/all');
    if (response.success && response.data && response.data.projectSummary) {
      return response.data.projectSummary.completionTrend || [];
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading project completion trend from API:', error);
    throw error;
  }
}

export async function loadVulnerabilityTrend() {
  try {
    const response = await apiCall('/api/dashboard/all');
    if (response.success && response.data && response.data.vulnerabilityTrend) {
      return response.data.vulnerabilityTrend;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading vulnerability trend from API:', error);
    throw error;
  }
}

export async function loadPortfolioPrograms() {
  try {
    const response = await apiCall('/api/portfolio/programs');
    if (response.success && response.data) {
      return convertPortfolioPrograms(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading portfolio programs from API:', error);
    throw error;
  }
}

export async function loadApplicationHealth() {
  try {
    const response = await apiCall('/api/portfolio/applications');
    if (response.success && response.data) {
      return convertApplicationHealth(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading application health from API:', error);
    throw error;
  }
}

export async function loadTechnologyProjects() {
  try {
    const response = await apiCall('/api/projects/technology');
    if (response.success && response.data) {
      return convertTechnologyProjects(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading technology projects from API:', error);
    throw error;
  }
}

export async function loadWorkforceMetrics() {
  try {
    const response = await apiCall('/api/workforce/metrics');
    if (response.success && response.data) {
      return convertWorkforceMetrics(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading workforce metrics from API:', error);
    throw error;
  }
}

export async function loadDeliveryPerformance() {
  try {
    const response = await apiCall('/api/projects/delivery-performance');
    if (response.success && response.data) {
      return convertDeliveryPerformance(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading delivery performance from API:', error);
    throw error;
  }
}

export async function loadSpendTrend() {
  try {
    const response = await apiCall('/api/portfolio/spend-trend');
    if (response.success && response.data) {
      return convertSpendTrend(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading spend trend from API:', error);
    throw error;
  }
}

export async function loadSpendCategories() {
  try {
    const response = await apiCall('/api/portfolio/spend-categories');
    if (response.success && response.data) {
      return convertSpendCategories(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading spend categories from API:', error);
    throw error;
  }
}

export async function loadActiveIncidents() {
  try {
    const response = await apiCall('/api/dashboard/incidents');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading active incidents from API:', error);
    throw error;
  }
}

export async function loadSkillDistribution() {
  try {
    const response = await apiCall('/api/workforce/skills');
    if (response.success && response.data) {
      return convertSkillDistribution(response.data);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error loading skill distribution from API:', error);
    throw error;
  }
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
    const metric = item.Metric || item.metric;
    const value = item.Value || item.value;
    metrics[metric] = value;
  });
  
  return {
    inProgress: metrics.InProgress || metrics.inProgress || 0,
    atRisk: metrics.AtRisk || metrics.atRisk || 0,
    completed: metrics.Completed || metrics.completed || 0,
    completionTrendByMonth: trendData // Already converted in component
  };
}

export function convertPortfolioPrograms(data: any[]) {
  return data.map(item => ({
    programName: item.programName || item['Program Name'],
    budgetType: item.budgetType || item['Budget Type'],
    annualBudget: item.annualBudget || item['Annual Budget ($M)'],
    ytdActual: item.ytdActual || item['YTD Actual ($M)'],
    targetYtd: item.targetYtd || item['Target YTD ($M)'],
    variance: item.variance || item['Variance %'] || item['Variance%'] || item.Variance || 0,
    status: item.status || item.Status,
    poc: item.poc || item.POC,
    top3Issues: item.top3Issues || (item.Top3Issues ? item.Top3Issues.split('|').map((s: string) => s.trim()) : [])
  }));
}

export function convertApplicationHealth(data: any[]) {
  return data.map(item => ({
    application: item.application || item.Application,
    domain: item.domain || item.Domain,
    availability: item.availability || item['Availability %'],
    incidents: item.incidents || item['Incidents (90 Days)'],
    patchCompliance: item.patchCompliance || item['Patch Compliance %'],
    status: item.status || item.Status,
    downIncidences3Months: item.downIncidences3Months || item.DownIncidences3Months
  }));
}

export function convertTechnologyProjects(data: any[]) {
  return data.map(item => ({
    domain: item.domain || item.Domain,
    projectName: item.projectName || item['Project Name'],
    budget: item.budget || item['Budget ($M)'],
    actual: item.actual || item['Actual ($M)'],
    scheduleStatus: item.scheduleStatus || item['Schedule Status'],
    topIssue: item.topIssue || item['Top Issue'],
    poc: item.poc || item.POC
  }));
}

export function convertWorkforceMetrics(data: any[]) {
  return data.map(item => ({
    resourceType: item.resourceType || item['Resource Type'],
    plannedHours: item.plannedHours || item['Planned Hours'],
    actualHours: item.actualHours || item['Actual Hours'],
    variancePercent: item.variancePercent || item['Variance %'],
    openPositions: item.openPositions || item['Open Positions'],
    utilizationRate: item.utilizationRate || item.UtilizationRate
  }));
}

export function convertDeliveryPerformance(data: any[]) {
  return data.map(item => ({
    project: item.project || item.Project,
    milestonesOnTime: item.milestonesOnTime || item['Milestones On-Time %'],
    scopeChanges90Days: item.scopeChanges90Days || item['Scope Changes (90 Days)'],
    budgetBurn: item.budgetBurn || item['Budget Burn %'],
    hoursBurn: item.hoursBurn || item['Hours Burn %'],
    avgDaysProcurementToWA: item.avgDaysProcurementToWA || item.AvgDaysProcurementToWA
  }));
}

export function convertSpendTrend(data: any[]) {
  return data.map(item => ({
    month: item.month || item.Month,
    planned: item.planned || item['Planned ($M)'],
    actual: item.actual || item['Actual ($M)']
  }));
}

export function convertSpendCategories(data: any[]) {
  return data.map(item => ({
    category: item.category || item['Spend Category'],
    spend: item.spend || item['Spend ($M)'],
    percentOfTotal: item.percentOfTotal || item['% of Total'],
    percentage: item.percentOfTotal || item['% of Total'] // For the chart label
  }));
}

export function convertSkillDistribution(data: any[]) {
  return data.map(item => ({
    skill: item.skill || item.Skill,
    count: item.count || item.Count
  }));
}
