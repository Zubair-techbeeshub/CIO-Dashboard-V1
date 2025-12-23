import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, Shield } from 'lucide-react';
import { applicationHealth, incidents, monthlyIncidents, summaryMetrics } from '../data/mockData';

const OperationalSection: React.FC = () => {
  const { averageAvailability, totalIncidents90Days, patchComplianceAvg, greenApps, amberApps, redApps } = summaryMetrics.operations;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Green': return '#10b981';
      case 'Amber': return '#f59e0b';
      case 'Red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Green': return '●';
      case 'Amber': return '▲';
      case 'Red': return '■';
      default: return '○';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        <Activity size={24} />
        Operational Health - Apps, Network & Security
      </h2>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="card highlight">
          <div className="card-header">
            <h3>Average Availability</h3>
            <Activity className="card-icon" />
          </div>
          <div className="card-value">{averageAvailability.toFixed(1)}%</div>
          <div className="card-footer" style={{ color: averageAvailability > 98 ? '#10b981' : '#f59e0b' }}>
            Across All Applications
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Incidents (90 Days)</h3>
            <AlertTriangle className="card-icon" />
          </div>
          <div className="card-value">{totalIncidents90Days}</div>
          <div className="card-footer">{greenApps} Green | {amberApps} Amber | {redApps} Red</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Patch Compliance</h3>
            <Shield className="card-icon" />
          </div>
          <div className="card-value">{patchComplianceAvg}%</div>
          <div className="card-footer" style={{ color: patchComplianceAvg > 90 ? '#10b981' : '#f59e0b' }}>
            Average Across Systems
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Active Incidents</h3>
            <AlertTriangle className="card-icon" />
          </div>
          <div className="card-value">{incidents.length}</div>
          <div className="card-footer">Currently Open</div>
        </div>
      </div>

      {/* Application Health Table */}
      <div className="charts-grid">
        <div className="chart-container full-width">
          <h3 className="chart-title">Application & Network Health</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Domain</th>
                  <th>Availability %</th>
                  <th>Incidents (90 Days)</th>
                  <th>Patch Compliance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applicationHealth.map((app) => (
                  <tr key={app.application}>
                    <td><strong>{app.application}</strong></td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: app.domain === 'Customer Tech' ? '#dbeafe' : 
                                        app.domain === 'Ops Tech' ? '#fef3c7' : '#f3f4f6',
                        color: app.domain === 'Customer Tech' ? '#1e40af' : 
                               app.domain === 'Ops Tech' ? '#92400e' : '#374151'
                      }}>
                        {app.domain}
                      </span>
                    </td>
                    <td style={{ color: app.availability >= 99 ? '#10b981' : app.availability >= 97 ? '#f59e0b' : '#ef4444' }}>
                      {app.availability.toFixed(1)}%
                    </td>
                    <td>{app.incidents90Days}</td>
                    <td style={{ color: app.patchCompliance >= 95 ? '#10b981' : app.patchCompliance >= 85 ? '#f59e0b' : '#ef4444' }}>
                      {app.patchCompliance}%
                    </td>
                    <td>
                      <span style={{ color: getStatusColor(app.status), fontSize: '20px', marginRight: '4px' }}>
                        {getStatusIcon(app.status)}
                      </span>
                      <span style={{ color: getStatusColor(app.status), fontWeight: '600' }}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Incident Trend */}
        <div className="chart-container">
          <h3 className="chart-title">Monthly Incident Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyIncidents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
              <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
              <Bar dataKey="medium" stackId="a" fill="#3b82f6" name="Medium" />
              <Bar dataKey="low" stackId="a" fill="#10b981" name="Low" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Incidents Table */}
        <div className="chart-container">
          <h3 className="chart-title">Active Incidents</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td><strong>{incident.id}</strong></td>
                    <td>{incident.title}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getSeverityColor(incident.severity) + '20',
                        color: getSeverityColor(incident.severity)
                      }}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>{incident.status}</td>
                    <td>{incident.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalSection;
