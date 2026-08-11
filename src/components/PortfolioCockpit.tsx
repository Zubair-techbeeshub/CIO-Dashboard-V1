import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { 
  loadApplicationHealth, 
  loadTechnologyProjects
} from '../services/dataService';

const PortfolioCockpit: React.FC = () => {
  const [applicationHealth, setApplicationHealth] = useState<any[]>([]);
  const [technologyProjects, setTechnologyProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appHealthResponse, projectsResponse] = await Promise.all([
          loadApplicationHealth(),
          loadTechnologyProjects()
        ]);

        console.log('Application Health Response:', appHealthResponse);
        console.log('Technology Projects Response:', projectsResponse);

        // The dataService already extracts the data field, so use the response directly
        setApplicationHealth(appHealthResponse);
        setTechnologyProjects(projectsResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error loading cockpit data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="section">Loading...</div>;
  }

  if (!applicationHealth || applicationHealth.length === 0) {
    return <div className="section">Error loading application health data</div>;
  }

  // Calculate critical metrics
  const criticalApps = applicationHealth.filter(app => app.status === 'Red');
  const healthyApps = applicationHealth.filter(app => app.status === 'Green');
  const avgAvailability = applicationHealth.length > 0 ? (applicationHealth.reduce((sum, app) => sum + (app.availability || 0), 0) / applicationHealth.length).toFixed(1) : '0.0';
  const totalIncidents90Days = applicationHealth.reduce((sum, app) => sum + (app.incidents || 0), 0);
  const avgPatchCompliance = applicationHealth.length > 0 ? (applicationHealth.reduce((sum, app) => sum + (app.patchCompliance || 0), 0) / applicationHealth.length).toFixed(1) : '0.0';
  const totalDownIncidences = applicationHealth.reduce((sum, app) => sum + (app.downIncidences3Months || 0), 0);
  
  // Top 3 projects by budget
  const top3Projects = [...technologyProjects]
    .sort((a, b) => (b.budget || 0) - (a.budget || 0))
    .slice(0, 3);

  // Mock IT Procurement metric
  const avgDaysToPO = 15; // Average days to issue PO

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

  return (
    <div className="section">
      <h2 className="section-title">
        <Shield size={24} />
        Portfolio Cockpit View
      </h2>

      {/* Critical App and Network Status */}
      <div className="cockpit-section">
        <h3>Critical App and Network Status</h3>
        <div className="cards-grid">
          <div className="card">
            <h4>Available / Unavailable</h4>
            <div className="status-row">
              <span className="status-count green">{healthyApps.length} Available</span>
              <span className="status-count red">{criticalApps.length} Unavailable</span>
            </div>
            <div className="card-footer">Avg Availability: {avgAvailability}%</div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Domain</th>
                <th>Availability %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applicationHealth.map((app, index) => (
                <tr key={`app-${index}-${app.application}`}>
                  <td><strong>{app.application}</strong></td>
                  <td>{app.domain}</td>
                  <td>{app.availability}%</td>
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

      {/* Security Incidents */}
      <div className="cockpit-section">
        <h3>Security Incidents in last 3 months</h3>
        <div className="cards-grid">
          <div className="card">
            <div className="card-header">
              <AlertTriangle className="card-icon" />
              <span>Total Incidents (90 Days)</span>
            </div>
            <div className="card-value">{totalIncidents90Days}</div>
          </div>
          <div className="card">
            <div className="card-header">
              <Shield className="card-icon" />
              <span>Patch Compliance</span>
            </div>
            <div className="card-value">{avgPatchCompliance}%</div>
          </div>
        </div>
      </div>

      {/* Critical Application Down Incidences */}
      <div className="cockpit-section">
        <h3>Critical Application Down Incidences in last 3 months</h3>
        <div className="card">
          <div className="card-value">{totalDownIncidences}</div>
          <div className="card-footer">Total downtime incidents across all applications</div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Down Incidents</th>
                <th>Domain</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applicationHealth
                .sort((a, b) => (b.downIncidences3Months || 0) - (a.downIncidences3Months || 0))
                .map((app, index) => (
                  <tr key={`down-${index}-${app.application}`}>
                    <td><strong>{app.application}</strong></td>
                    <td>
                      <span style={{ 
                        color: (app.downIncidences3Months || 0) > 3 ? '#ef4444' : (app.downIncidences3Months || 0) > 1 ? '#f59e0b' : '#10b981',
                        fontWeight: '600'
                      }}>
                        {app.downIncidences3Months || 0}
                      </span>
                    </td>
                    <td>{app.domain}</td>
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

      {/* Top 3 Projects Status */}
      <div className="cockpit-section">
        <h3>Top 3 Projects Status</h3>
        <p className="section-subtitle">Budget vs. Actual & Status (Traffic Light Symbols)</p>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Domain</th>
                <th>Budget ($M)</th>
                <th>Actual ($M)</th>
                <th>Variance ($M)</th>
                <th>Schedule Status</th>
                <th>Top Issue</th>
              </tr>
            </thead>
            <tbody>
              {top3Projects.map((project, index) => {
                const variance = (project.actual || 0) - (project.budget || 0);
                return (
                  <tr key={`top3-${index}-${project.projectName}`}>
                    <td><strong>{project.projectName}</strong></td>
                    <td>{project.domain}</td>
                    <td>${project.budget || 0}</td>
                    <td>${project.actual || 0}</td>
                    <td style={{ color: variance > 0 ? '#ef4444' : '#10b981' }}>
                      {variance > 0 ? '+' : ''}${variance.toFixed(1)}
                    </td>
                    <td>
                      <span style={{ color: getStatusColor(project.scheduleStatus), fontSize: '20px', marginRight: '4px' }}>
                        {getStatusIcon(project.scheduleStatus)}
                      </span>
                      <span style={{ color: getStatusColor(project.scheduleStatus), fontWeight: '600' }}>
                        {project.scheduleStatus}
                      </span>
                    </td>
                    <td>{project.topIssue || 'None'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* IT Procurement */}
      <div className="cockpit-section">
        <h3>IT Procurement</h3>
        <div className="card">
          <div className="card-header">
            <Clock className="card-icon" />
            <span>Average # of days taking to issue PO to vendors</span>
          </div>
          <div className="card-value">{avgDaysToPO} days</div>
          <div className="card-footer">Target: &lt;20 days</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCockpit;
