// Mock data for CIO Dashboard MVP - Energy/Utilities Context

// EXECUTIVE SUMMARY KPIs
export interface ExecutiveSummary {
  yoyRevenueGrowth: number; // percentage
  totalITSpend: number; // in millions
  itSpendAsPercentRevenue: number; // percentage
  budgetUtilization: number; // percentage
  systemUptime: number; // percentage
  securityIncidentsMoM: number; // percentage change (negative is improvement)
  responseTimeMin: number; // in minutes
  cloudSpend: number; // in millions
  cloudCapacityUtilization: number; // percentage
}

// PROJECT STATUS SUMMARY
export interface ProjectSummary {
  inProgress: number;
  atRisk: number;
  completed: number;
  completionTrendByMonth: { month: string; count: number }[];
}

// CRITICAL VULNERABILITIES TREND
export interface VulnerabilityTrend {
  month: string;
  count: number;
}

// 1. Portfolio Summary / Program Health
export interface PortfolioProgram {
  programName: string;
  budgetType: 'Capital' | 'O&M';
  annualBudget: number; // in millions
  ytdActual: number; // in millions
  targetYTD: number; // in millions
  variance: number; // percentage
  status: 'Green' | 'Amber' | 'Red';
  poc: string; // Point of Contact
  top3Issues: string[];
}

// 2. Operations View – Apps, Network & Security
export interface ApplicationHealth {
  application: string;
  domain: string;
  availability: number; // percentage
  incidents90Days: number;
  patchCompliance: number; // percentage
  status: 'Green' | 'Amber' | 'Red';
  downIncidences3Months: number;
}

// 3. Technology Domains – Projects & Issues
export interface TechnologyProject {
  domain: string;
  projectName: string;
  budget: number; // in millions
  actual: number; // in millions
  scheduleStatus: 'Green' | 'Amber' | 'Red';
  topIssue: string;
  poc: string;
}

// 4. People Productivity Score (PPS)
export interface WorkforceMetric {
  resourceType: string;
  plannedHours: number;
  actualHours: number;
  variance: number; // percentage
  openPositions: number;
  utilizationRate: number; // percentage
}

// 5. Project Delivery Metrics
export interface DeliveryPerformance {
  project: string;
  milestonesOnTime: number; // percentage
  scopeChanges90Days: number;
  budgetBurn: number; // percentage
  hoursBurn: number; // percentage
  avgDaysProcurementToWA: number; // Average days from procurement to work authorization
}

// 6. Spend Analysis
export interface SpendCategory {
  category: string;
  spend: number; // in millions
  percentage: number;
}

// Additional supporting interfaces
export interface SpendTrend {
  month: string;
  planned: number;
  actual: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  age: string;
}

export interface SkillDistribution {
  skill: string;
  count: number;
}

// EXECUTIVE SUMMARY DATA
export const executiveSummary: ExecutiveSummary = {
  yoyRevenueGrowth: 16.2, // 16.2% YoY revenue growth
  totalITSpend: 53.4, // $53.4M total IT spend
  itSpendAsPercentRevenue: 4.1, // 4.1% of revenue
  budgetUtilization: 76.3, // 76.3% budget utilized
  systemUptime: 99.7, // 99.7% system uptime
  securityIncidentsMoM: -8.9, // -8.9% MoM (improvement)
  responseTimeMin: 17, // 17 minutes average response time
  cloudSpend: 12.1, // $12.1M cloud spend
  cloudCapacityUtilization: 33.6, // 33.6% capacity utilization
};

// PROJECT STATUS SUMMARY
export const projectSummary: ProjectSummary = {
  inProgress: 23,
  atRisk: 9,
  completed: 45,
  completionTrendByMonth: [
    { month: 'Jan', count: 3 },
    { month: 'Feb', count: 3 },
    { month: 'Mar', count: 2 },
    { month: 'Apr', count: 3 },
    { month: 'May', count: 4 },
    { month: 'Jun', count: 5 },
    { month: 'Jul', count: 6 },
    { month: 'Aug', count: 7 },
    { month: 'Sep', count: 8 },
    { month: 'Sep', count: 9 }, // Second entry for current month trend
  ],
};

// CRITICAL VULNERABILITIES TREND
export const vulnerabilityTrend: VulnerabilityTrend[] = [
  { month: 'Jan', count: 15 },
  { month: 'Feb', count: 12 },
  { month: 'Mar', count: 10 },
  { month: 'Apr', count: 8 },
  { month: 'May', count: 11 },
  { month: 'Jun', count: 9 },
  { month: 'Sep', count: 10 },
  { month: 'Aug', count: 9 },
  { month: 'Sep', count: 12 },
  { month: 'Oct', count: 8 },
  { month: 'Sep', count: 7 },
];

// 1. Portfolio Summary / Program Health Data
export const portfolioPrograms: PortfolioProgram[] = [
  { 
    programName: 'Grid Modernization', 
    budgetType: 'Capital', 
    annualBudget: 120, 
    ytdActual: 68, 
    targetYTD: 70, 
    variance: -2.8, 
    status: 'Green',
    poc: 'John Smith',
    top3Issues: ['Vendor delivery delays', 'Weather-related site delays', 'Equipment lead times']
  },
  { 
    programName: 'Cyber Security', 
    budgetType: 'O&M', 
    annualBudget: 45, 
    ytdActual: 38, 
    targetYTD: 35, 
    variance: 8.5, 
    status: 'Amber',
    poc: 'Sarah Johnson',
    top3Issues: ['Talent acquisition challenges', 'Increased threat landscape', 'Compliance requirements']
  },
  { 
    programName: 'Customer Digital', 
    budgetType: 'Capital', 
    annualBudget: 60, 
    ytdActual: 55, 
    targetYTD: 48, 
    variance: 14.6, 
    status: 'Red',
    poc: 'Mike Chen',
    top3Issues: ['Scope creep on mobile app', 'Integration complexity', 'User acceptance testing delays']
  },
  { 
    programName: 'Smart Metering', 
    budgetType: 'Capital', 
    annualBudget: 85, 
    ytdActual: 48, 
    targetYTD: 50, 
    variance: -4.0, 
    status: 'Green',
    poc: 'Lisa Anderson',
    top3Issues: ['None - on track', 'Minor scheduling adjustments', 'Meter availability']
  },
  { 
    programName: 'Data Analytics', 
    budgetType: 'O&M', 
    annualBudget: 30, 
    ytdActual: 24, 
    targetYTD: 23, 
    variance: 4.3, 
    status: 'Green',
    poc: 'David Park',
    top3Issues: ['Data quality improvements needed', 'Training requirements', 'Dashboard adoption']
  },
];

// 6. Spend Analysis Data
export const spendCategories: SpendCategory[] = [
  { category: 'Infrastructure', spend: 95, percentage: 38 },
  { category: 'Software & Licenses', spend: 62, percentage: 25 },
  { category: 'Vendors & Consultants', spend: 71, percentage: 28 },
  { category: 'Other', spend: 22, percentage: 9 },
];

// Supporting Data - Monthly Spend Trend
export const spendTrend: SpendTrend[] = [
  { month: 'Jan', planned: 20, actual: 19 },
  { month: 'Feb', planned: 20, actual: 21 },
  { month: 'Mar', planned: 21, actual: 20 },
  { month: 'Apr', planned: 21, actual: 22 },
  { month: 'May', planned: 22, actual: 21 },
  { month: 'Jun', planned: 22, actual: 22 },
  { month: 'Jul', planned: 21, actual: 20 },
  { month: 'Aug', planned: 22, actual: 23 },
  { month: 'Sep', planned: 23, actual: 22 },
  { month: 'Oct', planned: 23, actual: 24 },
  { month: 'Nov', planned: 22, actual: 21 },
  { month: 'Dec', planned: 23, actual: 22 },
];

// 2. Operations View – Apps, Network & Security Data
export const applicationHealth: ApplicationHealth[] = [
  { application: 'Energy Billing', domain: 'Customer Tech', availability: 99.8, incidents90Days: 1, patchCompliance: 96, status: 'Green', downIncidences3Months: 1 },
  { application: 'SCADA Core', domain: 'Ops Tech', availability: 97.2, incidents90Days: 4, patchCompliance: 88, status: 'Amber', downIncidences3Months: 3 },
  { application: 'Asset Mgmt', domain: 'IT Shared', availability: 95.5, incidents90Days: 6, patchCompliance: 82, status: 'Red', downIncidences3Months: 5 },
  { application: 'Outage Management', domain: 'Ops Tech', availability: 99.5, incidents90Days: 2, patchCompliance: 94, status: 'Green', downIncidences3Months: 1 },
  { application: 'Customer Portal', domain: 'Customer Tech', availability: 98.8, incidents90Days: 3, patchCompliance: 90, status: 'Green', downIncidences3Months: 2 },
  { application: 'Field Mobility', domain: 'Ops Tech', availability: 96.5, incidents90Days: 5, patchCompliance: 85, status: 'Amber', downIncidences3Months: 4 },
];

// 3. Technology Domains – Projects & Issues Data
export const technologyProjects: TechnologyProject[] = [
  { domain: 'Ops Tech', projectName: 'Substation Automation', budget: 25, actual: 22, scheduleStatus: 'Green', topIssue: 'Vendor delay', poc: 'Tom Wilson' },
  { domain: 'Customer Tech', projectName: 'Mobile App Revamp', budget: 18, actual: 20, scheduleStatus: 'Amber', topIssue: 'Scope creep', poc: 'Emma Davis' },
  { domain: 'IT Services', projectName: 'ERP Upgrade', budget: 30, actual: 35, scheduleStatus: 'Red', topIssue: 'Resource shortage', poc: 'James Brown' },
  { domain: 'Ops Tech', projectName: 'Grid Analytics Platform', budget: 22, actual: 20, scheduleStatus: 'Green', topIssue: 'None', poc: 'Rachel Green' },
  { domain: 'Customer Tech', projectName: 'Portal Enhancement', budget: 15, actual: 14, scheduleStatus: 'Green', topIssue: 'None', poc: 'Chris Martin' },
  { domain: 'Security', projectName: 'Firewall Replacement', budget: 12, actual: 13, scheduleStatus: 'Amber', topIssue: 'Integration issues', poc: 'Alex Turner' },
];

// Supporting Data - Active Incidents
export const incidents: Incident[] = [
  { id: 'INC-001', title: 'SCADA Core Performance Degradation', severity: 'High', status: 'In Progress', age: '2h' },
  { id: 'INC-002', title: 'Asset Mgmt Database Sync Issue', severity: 'High', status: 'Open', age: '4h' },
  { id: 'INC-003', title: 'Field App Login Delays', severity: 'Medium', status: 'In Progress', age: '6h' },
  { id: 'INC-004', title: 'Customer Portal Certificate Warning', severity: 'Low', status: 'Open', age: '1d' },
];

// Supporting Data - Monthly Incidents
export const monthlyIncidents = [
  { month: 'Jan', critical: 1, high: 3, medium: 8, low: 6 },
  { month: 'Feb', critical: 0, high: 2, medium: 7, low: 8 },
  { month: 'Mar', critical: 2, high: 4, medium: 10, low: 5 },
  { month: 'Apr', critical: 1, high: 3, medium: 9, low: 7 },
  { month: 'May', critical: 0, high: 2, medium: 6, low: 9 },
  { month: 'Jun', critical: 1, high: 3, medium: 8, low: 7 },
];

// 5. Project Delivery Metrics Data
export const deliveryPerformance: DeliveryPerformance[] = [
  { project: 'Grid Modernization', milestonesOnTime: 92, scopeChanges90Days: 1, budgetBurn: 58, hoursBurn: 61, avgDaysProcurementToWA: 12 },
  { project: 'Cyber Security', milestonesOnTime: 78, scopeChanges90Days: 3, budgetBurn: 84, hoursBurn: 89, avgDaysProcurementToWA: 18 },
  { project: 'Digital Customer', milestonesOnTime: 65, scopeChanges90Days: 4, budgetBurn: 91, hoursBurn: 97, avgDaysProcurementToWA: 22 },
  { project: 'Smart Metering', milestonesOnTime: 88, scopeChanges90Days: 2, budgetBurn: 62, hoursBurn: 65, avgDaysProcurementToWA: 14 },
  { project: 'Data Analytics', milestonesOnTime: 95, scopeChanges90Days: 0, budgetBurn: 55, hoursBurn: 58, avgDaysProcurementToWA: 10 },
];

export const projectTimeline = [
  { month: 'Q1', completed: 8, onTrack: 12, atRisk: 3, delayed: 2 },
  { month: 'Q2', completed: 10, onTrack: 14, atRisk: 2, delayed: 1 },
  { month: 'Q3', completed: 12, onTrack: 16, atRisk: 3, delayed: 1 },
  { month: 'Q4', completed: 10, onTrack: 15, atRisk: 3, delayed: 2 },
];

// 4. People Productivity Score (PPS) Data
export const workforceMetrics: WorkforceMetric[] = [
  { resourceType: 'FTE', plannedHours: 120000, actualHours: 115000, variance: -4.2, openPositions: 14, utilizationRate: 96 },
  { resourceType: 'Consultants', plannedHours: 45000, actualHours: 52000, variance: 15.5, openPositions: 9, utilizationRate: 116 },
  { resourceType: 'Contractors', plannedHours: 30000, actualHours: 28500, variance: -5.0, openPositions: 5, utilizationRate: 95 },
];

// Supporting Data - Skills Distribution
export const skillDistribution: SkillDistribution[] = [
  { skill: 'SCADA/OT Systems', count: 85 },
  { skill: 'Cloud Infrastructure', count: 70 },
  { skill: 'Cybersecurity', count: 55 },
  { skill: 'Data Analytics', count: 45 },
  { skill: 'IoT/Smart Meters', count: 60 },
  { skill: 'Network Engineering', count: 80 },
  { skill: 'AI/ML', count: 30 },
  { skill: 'Mobile Development', count: 40 },
];

// Summary KPIs and Derived Metrics
export const summaryMetrics = {
  portfolio: {
    capitalUtilization: 62, // percentage - Capital programs YTD actual vs annual budget
    omSpendVsTarget: 107, // percentage - O&M programs actual vs target
    programHealthScore: 75, // composite score 0-100
    totalPrograms: 5,
    greenPrograms: 3,
    amberPrograms: 1,
    redPrograms: 1,
  },
  operations: {
    averageAvailability: 97.9, // percentage across all applications
    totalIncidents90Days: 21,
    criticalIncidents: 4,
    patchComplianceAvg: 89, // percentage
    greenApps: 3,
    amberApps: 2,
    redApps: 1,
  },
  projects: {
    totalProjects: 6,
    greenSchedule: 3,
    amberSchedule: 2,
    redSchedule: 1,
    avgMilestonesOnTime: 84, // percentage
    totalBudget: 122, // millions
    totalActual: 124, // millions
  },
  workforce: {
    totalPlannedHours: 195000,
    totalActualHours: 195500,
    variancePercent: 0.3,
    totalOpenPositions: 28,
    fteUtilization: 96, // percentage (115k actual / 120k planned * 100)
    consultantUtilization: 116, // percentage (52k actual / 45k planned * 100)
  },
  spend: {
    totalSpend: 250, // millions
    infrastructurePercent: 38,
    vendorConsultantPercent: 28,
    ytdVsPlan: 102, // percentage
  },
};
