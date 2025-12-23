import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Cloud } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  loadExecutiveSummary,
  convertExecutiveSummary,
  convertProjectSummary
} from '../services/dataService';

const ExecutiveSummary: React.FC = () => {
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [projectSummary, setProjectSummary] = useState<any>(null);
  const [vulnerabilityTrend, setVulnerabilityTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data from the executive summary endpoint
        const execData = await loadExecutiveSummary();
        
        // Extract the different data pieces from the response
        setExecutiveSummary(convertExecutiveSummary(execData));
        
        // Create project summary data
        const projSummaryData = [
          { Metric: 'InProgress', Value: execData.projectSummary?.inProgress || 0 },
          { Metric: 'AtRisk', Value: execData.projectSummary?.atRisk || 0 },
          { Metric: 'Completed', Value: execData.projectSummary?.completed || 0 }
        ];
        
        const projTrendData = execData.projectSummary?.completionTrend || [];
        setProjectSummary(convertProjectSummary(projSummaryData, projTrendData));
        
        // Set vulnerability trend
        setVulnerabilityTrend((execData.vulnerabilityTrend || []).map((item: any) => ({
          month: item.Month || item.month,
          count: item.Count || item.count
        })));
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading executive summary data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="section">Loading...</div>;
  }

  if (!executiveSummary || !projectSummary) {
    return <div className="section">Error loading data</div>;
  }

  return (
    <div className="dashboard-section">
      <h2>Executive Summary - KPIs for Utilities CIO</h2>

      {/* Summary Cards Row 1 */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-header">
            <TrendingUp size={24} className="icon" />
            <span className="summary-label">YoY Revenue Growth</span>
          </div>
          <div className="summary-value">{executiveSummary.yoyRevenueGrowth}%</div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <DollarSign size={24} className="icon" />
            <span className="summary-label">Total IT Spend</span>
          </div>
          <div className="summary-value">${executiveSummary.totalITSpend}M</div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <DollarSign size={24} className="icon" />
            <span className="summary-label">IT Spend as % (Rev.) <br/><small>As of now</small></span>
          </div>
          <div className="summary-value">{executiveSummary.itSpendAsPercentRevenue}%</div>
        </div>
      </div>

      {/* Budget Utilization Row */}
      <div className="budget-utilization-section">
        <h3>Budget Utilization</h3>
        <div className="budget-circle-container">
          <div className="budget-circle">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#1e293b"
                strokeWidth="20"
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${2 * Math.PI * 70 * (executiveSummary.budgetUtilization / 100)} ${2 * Math.PI * 70}`}
                strokeDashoffset={2 * Math.PI * 70 * 0.25}
                transform="rotate(-90 90 90)"
              />
              <text x="90" y="95" textAnchor="middle" fontSize="32" fill="#fff" fontWeight="bold">
                {executiveSummary.budgetUtilization}%
              </text>
            </svg>
          </div>
          <div className="budget-text">
            <div className="budget-value-large">{executiveSummary.budgetUtilization}%</div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-overview">
        <h3>Projects</h3>
        <div className="project-status-grid">
          <div className="project-status-item">
            <div className="status-dot blue"></div>
            <span className="status-label">In Progress</span>
            <div className="status-count">{projectSummary.inProgress}</div>
          </div>
          <div className="project-status-item">
            <div className="status-dot red"></div>
            <span className="status-label">At Risk</span>
            <div className="status-count">{projectSummary.atRisk}</div>
          </div>
          <div className="project-status-item">
            <div className="status-dot green"></div>
            <span className="status-label">Completed</span>
            <div className="status-count">{projectSummary.completed}</div>
          </div>
        </div>

        <h4>Project Completion Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={projectSummary.completionTrendByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Infrastructure & Security Section */}
      <div className="infrastructure-security">
        <h3>Infrastructure & Security</h3>
        
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">System Uptime</span>
            <div className="summary-value">{executiveSummary.systemUptime}%</div>
          </div>

          <div className="summary-card">
            <span className="summary-label">Security Incidents (MoM)</span>
            <div className="summary-value" style={{ color: '#10b981' }}>
              {executiveSummary.securityIncidentsMoM}%
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-label">Response Time (Min)</span>
            <div className="summary-value">{executiveSummary.responseTimeMin}</div>
          </div>
        </div>

        <h4>Critical Vulnerabilities</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={vulnerabilityTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cloud Utilization Section */}
      <div className="cloud-utilization">
        <h3>Cloud Utilization</h3>
        
        <div className="cloud-metrics-grid">
          <div className="summary-card">
            <div className="summary-header">
              <Cloud size={24} className="icon" />
              <span className="summary-label">Cloud Spend</span>
            </div>
            <div className="summary-value">${executiveSummary.cloudSpend}M</div>
          </div>

          <div className="summary-card">
            <span className="summary-label">Capacity Utilization</span>
            <div className="summary-value">{executiveSummary.cloudCapacityUtilization}%</div>
            <div className="cloud-capacity-visual">
              <svg width="300" height="200" viewBox="0 0 300 200">
                <polygon 
                  points="150,20 280,180 20,180" 
                  fill="#10b981"
                  opacity="0.8"
                />
                <text x="150" y="120" textAnchor="middle" fontSize="28" fill="#fff" fontWeight="bold">
                  {executiveSummary.cloudCapacityUtilization}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
