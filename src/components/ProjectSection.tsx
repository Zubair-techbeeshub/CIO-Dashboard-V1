import React, { useEffect, useState } from 'react';
// No recharts imports needed for this component
import { Briefcase } from 'lucide-react';
import { 
  loadTechnologyProjects, 
  loadDeliveryPerformance, 
  loadPortfolioPrograms
} from '../services/dataService';

const ProjectSection: React.FC = () => {
  const [technologyProjects, setTechnologyProjects] = useState<any[]>([]);
  const [deliveryPerformance, setDeliveryPerformance] = useState<any[]>([]);
  const [portfolioPrograms, setPortfolioPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, deliveryData, portfolioData] = await Promise.all([
          loadTechnologyProjects(),
          loadDeliveryPerformance(),
          loadPortfolioPrograms()
        ]);

        setTechnologyProjects(projectsData);
        setDeliveryPerformance(deliveryData);
        setPortfolioPrograms(portfolioData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading project data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="section">Loading...</div>;
  }

  // Group projects by domain
  const opsTechProjects = technologyProjects.filter(p => p.domain === 'Ops Tech' || p.domain === 'Ops Tech');
  const customerTechProjects = technologyProjects.filter(p => p.domain === 'Customer Tech');
  const itServicesProjects = technologyProjects.filter(p => p.domain === 'IT Services' || p.domain === 'Security');

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

  // Find corresponding programs
  const gridModProgram = portfolioPrograms.find(p => p.programName === 'Grid Modernization');
  const cyberProgram = portfolioPrograms.find(p => p.programName === 'Cyber Security');
  const customerProgram = portfolioPrograms.find(p => p.programName === 'Customer Digital');

  // Function to render project group
  const renderProjectGroup = (title: string, projects: typeof technologyProjects, program: typeof portfolioPrograms[0] | undefined) => (
    <div className="program-section" key={title}>
      <h3>{title}</h3>
      
      <div className="table-container">
        <h4>Key projects (Budget Spend and Status)</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Budget ($M)</th>
              <th>Actual ($M)</th>
              <th>Variance ($M)</th>
              <th>Schedule Status</th>
              <th>POC</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const variance = project.actual - project.budget;
              return (
                <tr key={project.projectName}>
                  <td><strong>{project.projectName}</strong></td>
                  <td>${project.budget}</td>
                  <td>${project.actual}</td>
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
                  <td>{project.poc}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {program && (
          <>
            <h4 className="mt-4">Top 3 issues</h4>
            <ul className="issues-list">
              {program.top3Issues.map((issue: string, idx: number) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>

            <h4 className="mt-4">POCs</h4>
            <p className="poc-info">{program.poc}</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="section">
      <h2 className="section-title">
        <Briefcase size={24} />
        Program Health Score (PHS) - Operations View
      </h2>

      {/* Operations Technology */}
      {renderProjectGroup('Operations Technology', opsTechProjects, gridModProgram)}

      {/* Customer Technology */}
      {renderProjectGroup('Customer Technology', customerTechProjects, customerProgram)}

      {/* Information Technology / Shared Services */}
      {renderProjectGroup('Information Technology / Shared Services', itServicesProjects, cyberProgram)}

      {/* Project Delivery Section */}
      <div className="program-section">
        <h3>Project Delivery - Leading KPIs for Top 3 Projects</h3>
        
        <div className="cards-grid">
          <div className="card">
            <h4>Milestone achievement rate</h4>
            <p className="card-subtitle">% completed on time</p>
            <div className="card-value">{deliveryPerformance.length > 0 ? (deliveryPerformance.map(p => p.milestonesOnTime).reduce((a, b) => a + b, 0) / deliveryPerformance.length).toFixed(1) : '0.0'}%</div>
          </div>

          <div className="card">
            <h4>Scope change frequency</h4>
            <p className="card-subtitle">Scope changed in last 3 months</p>
            <div className="card-value">{deliveryPerformance.map(p => p.scopeChanges90Days).reduce((a, b) => a + b, 0)}</div>
          </div>

          <div className="card">
            <h4>Hours Burn rate</h4>
            <p className="card-subtitle">Resource hours burn rate (planned vs. actual)</p>
            <div className="card-value">{deliveryPerformance.length > 0 ? (deliveryPerformance.map(p => p.hoursBurn).reduce((a, b) => a + b, 0) / deliveryPerformance.length).toFixed(1) : '0.0'}%</div>
          </div>

          <div className="card">
            <h4>Budget Burn rate</h4>
            <div className="card-value">{deliveryPerformance.length > 0 ? (deliveryPerformance.map(p => p.budgetBurn).reduce((a, b) => a + b, 0) / deliveryPerformance.length).toFixed(1) : '0.0'}%</div>
          </div>

          <div className="card">
            <h4>Procurement to WA</h4>
            <p className="card-subtitle">Average # of days in creating WA from procurement</p>
            <div className="card-value">{deliveryPerformance.length > 0 ? (deliveryPerformance.map(p => p.avgDaysProcurementToWA).reduce((a, b) => a + b, 0) / deliveryPerformance.length).toFixed(0) : '0'} days</div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Milestones On-Time %</th>
                <th>Scope Changes (90 Days)</th>
                <th>Budget Burn %</th>
                <th>Hours Burn %</th>
                <th>Avg Days Procurement to WA</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {deliveryPerformance.map((project) => {
                const isHealthy = project.milestonesOnTime >= 85 && project.budgetBurn <= 70 && project.hoursBurn <= 75;
                const isAtRisk = project.milestonesOnTime >= 70 || (project.budgetBurn > 70 && project.budgetBurn < 90) || (project.hoursBurn > 75 && project.hoursBurn < 90);
                const health = isHealthy ? 'Green' : isAtRisk ? 'Amber' : 'Red';
                
                return (
                  <tr key={project.project}>
                    <td><strong>{project.project}</strong></td>
                    <td style={{ color: project.milestonesOnTime >= 85 ? '#10b981' : project.milestonesOnTime >= 70 ? '#f59e0b' : '#ef4444' }}>
                      {project.milestonesOnTime}%
                    </td>
                    <td>{project.scopeChanges90Days}</td>
                    <td style={{ color: project.budgetBurn <= 70 ? '#10b981' : project.budgetBurn <= 85 ? '#f59e0b' : '#ef4444' }}>
                      {project.budgetBurn}%
                    </td>
                    <td style={{ color: project.hoursBurn <= 75 ? '#10b981' : project.hoursBurn <= 85 ? '#f59e0b' : '#ef4444' }}>
                      {project.hoursBurn}%
                    </td>
                    <td>{project.avgDaysProcurementToWA} days</td>
                    <td>
                      <span style={{ color: getStatusColor(health), fontSize: '20px', marginRight: '4px' }}>
                        {getStatusIcon(health)}
                      </span>
                      <span style={{ color: getStatusColor(health), fontWeight: '600' }}>
                        {health}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spend Analysis */}
      <div className="program-section">
        <h3>Major Spend Areas - Spend Analysis</h3>
        <p className="section-subtitle">Key Spend Categories</p>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>$ Spend ($ millions)</th>
                <th>% of overall budget</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Infrastructure</strong></td>
                <td>$95M</td>
                <td>38%</td>
              </tr>
              <tr>
                <td><strong>Software & Licenses</strong></td>
                <td>$62M</td>
                <td>25%</td>
              </tr>
              <tr>
                <td><strong>Vendors & Consultants</strong></td>
                <td>$71M</td>
                <td>28%</td>
              </tr>
              <tr>
                <td><strong>Other</strong></td>
                <td>$22M</td>
                <td>9%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectSection;
