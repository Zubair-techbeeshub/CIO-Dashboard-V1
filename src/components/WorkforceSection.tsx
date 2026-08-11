import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, Award } from 'lucide-react';
import { 
  loadWorkforceMetrics, 
  loadSkillDistribution
} from '../services/dataService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const WorkforceSection: React.FC = () => {
  const [workforceMetrics, setWorkforceMetrics] = useState<any[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workforceResponse, skillsResponse] = await Promise.all([
          loadWorkforceMetrics(),
          loadSkillDistribution()
        ]);

        console.log('Workforce Metrics Response:', workforceResponse);
        console.log('Skill Distribution Response:', skillsResponse);

        setWorkforceMetrics(workforceResponse.data || workforceResponse);
        setSkillDistribution(skillsResponse.data || skillsResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error loading workforce data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="section">Loading...</div>;
  }

  if (!workforceMetrics || workforceMetrics.length === 0) {
    return <div className="section">Error loading workforce data</div>;
  }

  // Calculate totals
  const totalPlannedHours = workforceMetrics.reduce((sum, m) => sum + (m.plannedHours || 0), 0);
  const totalActualHours = workforceMetrics.reduce((sum, m) => sum + (m.actualHours || 0), 0);
  const variancePercent = totalPlannedHours > 0 ? ((totalActualHours - totalPlannedHours) / totalPlannedHours * 100) : 0;

  // Calculate weighted average utilization
  const avgUtilization = totalPlannedHours > 0 
    ? workforceMetrics.reduce((sum, m) => sum + (m.utilizationRate || 0) * (m.plannedHours || 0), 0) / totalPlannedHours
    : 0;

  // Get FTE and Consultant metrics
  const fteMetrics = workforceMetrics.filter(m => m.resourceType && m.resourceType.includes('FTE'));
  const consultantMetrics = workforceMetrics.filter(m => m.resourceType === 'Consultants');
  const totalFTEPositions = fteMetrics.reduce((sum, m) => sum + (m.openPositions || 0), 0);
  const totalConsultantPositions = consultantMetrics.reduce((sum, m) => sum + (m.openPositions || 0), 0);



  return (
    <div className="section">
      <h2 className="section-title">
        <Users size={24} />
        People Productivity Score (PPS)
      </h2>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <h3>Open FTE Resource Positions</h3>
          </div>
          <div className="card-value">{totalFTEPositions}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Open Consultant Resource Positions</h3>
          </div>
          <div className="card-value">{totalConsultantPositions}</div>
        </div>

        <div className="card highlight">
          <div className="card-header">
            <h3>Average Utilization Rate</h3>
            <TrendingUp className="card-icon" />
          </div>
          <div className="card-value">{avgUtilization.toFixed(1)}%</div>
          <div className="card-footer" style={{ color: avgUtilization >= 90 && avgUtilization <= 105 ? '#10b981' : '#f59e0b' }}>
            {avgUtilization >= 90 && avgUtilization <= 105 ? 'Optimal' : 'Needs Attention'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Hours Variance</h3>
            <Award className="card-icon" />
          </div>
          <div className="card-value">{variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%</div>
          <div className="card-footer">Actual vs Planned</div>
        </div>
      </div>

      {/* FTE Resource Hours Planned vs. Actuals */}
      <div className="workforce-section">
        <h3>FTE Resource Hours Planned vs. Actuals</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource Type</th>
                <th>Planned Hours</th>
                <th>Actual Hours</th>
                <th>Variance</th>
                <th>Open Positions</th>
                <th>Utilization Rate</th>
              </tr>
            </thead>
            <tbody>
              {fteMetrics.map((metric, index) => {
                const variance = metric.plannedHours > 0 ? ((metric.actualHours - metric.plannedHours) / metric.plannedHours * 100) : 0;
                return (
                  <tr key={`fte-${index}-${metric.resourceType}`}>
                    <td><strong>{metric.resourceType}</strong></td>
                    <td>{metric.plannedHours.toLocaleString()}</td>
                    <td>{metric.actualHours.toLocaleString()}</td>
                    <td style={{ color: variance > 0 ? '#ef4444' : '#10b981' }}>
                      {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                    </td>
                    <td>{metric.openPositions}</td>
                    <td style={{ 
                      color: metric.utilizationRate >= 90 && metric.utilizationRate <= 105 ? '#10b981' : 
                             metric.utilizationRate >= 80 && metric.utilizationRate < 90 ? '#f59e0b' : 
                             metric.utilizationRate > 105 && metric.utilizationRate <= 110 ? '#f59e0b' : 
                             '#ef4444' 
                    }}>
                      {metric.utilizationRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultant Hours Planned vs. Actuals */}
      <div className="workforce-section">
        <h3>Consultant Hours Planned vs. Actuals</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource Type</th>
                <th>Planned Hours</th>
                <th>Actual Hours</th>
                <th>Variance</th>
                <th>Open Positions</th>
                <th>Utilization Rate</th>
              </tr>
            </thead>
            <tbody>
              {consultantMetrics.map((metric, index) => {
                const variance = metric.plannedHours > 0 ? ((metric.actualHours - metric.plannedHours) / metric.plannedHours * 100) : 0;
                return (
                  <tr key={`consultant-${index}-${metric.resourceType}`}>
                    <td><strong>{metric.resourceType}</strong></td>
                    <td>{metric.plannedHours.toLocaleString()}</td>
                    <td>{metric.actualHours.toLocaleString()}</td>
                    <td style={{ color: variance > 0 ? '#ef4444' : '#10b981' }}>
                      {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                    </td>
                    <td>{metric.openPositions}</td>
                    <td style={{ 
                      color: metric.utilizationRate >= 90 && metric.utilizationRate <= 105 ? '#10b981' : 
                             metric.utilizationRate >= 80 && metric.utilizationRate < 90 ? '#f59e0b' : 
                             metric.utilizationRate > 105 && metric.utilizationRate <= 110 ? '#f59e0b' : 
                             '#ef4444' 
                    }}>
                      {metric.utilizationRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills Distribution Chart */}
      <div className="workforce-section">
        <h3>Skills Distribution Across Organization</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={skillDistribution} layout="vertical" margin={{ left: 150 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="skill" type="category" stroke="#9ca3af" width={140} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {skillDistribution.map((item, index) => (
                <Cell key={`skill-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkforceSection;
