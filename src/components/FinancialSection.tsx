import React, { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign } from 'lucide-react';
import { 
  loadPortfolioPrograms, 
  loadSpendTrend, 
  loadSpendCategories, 
  loadWorkforceMetrics
} from '../services/dataService';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const FinancialSection: React.FC = () => {
  const [portfolioPrograms, setPortfolioPrograms] = useState<any[]>([]);
  const [spendTrend, setSpendTrend] = useState<any[]>([]);
  const [spendCategories, setSpendCategories] = useState<any[]>([]);
  const [workforceMetrics, setWorkforceMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [portfolioResponse, spendTrendResponse, spendCatResponse, workforceResponse] = await Promise.all([
          loadPortfolioPrograms(),
          loadSpendTrend(),
          loadSpendCategories(),
          loadWorkforceMetrics()
        ]);

        console.log('Portfolio Response:', portfolioResponse);
        console.log('Spend Trend Response:', spendTrendResponse);
        console.log('Spend Categories Response:', spendCatResponse);
        console.log('Workforce Response:', workforceResponse);

        // dataService extracts the data field, so use the response directly
        setPortfolioPrograms(portfolioResponse);
        setSpendTrend(spendTrendResponse);
        setSpendCategories(spendCatResponse);
        setWorkforceMetrics(workforceResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error loading portfolio data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="section">Loading...</div>;
  }

  if (!portfolioPrograms || portfolioPrograms.length === 0) {
    return <div className="section">Error loading portfolio data</div>;
  }

  // Calculate Portfolio KPIs
  const capitalPrograms = portfolioPrograms.filter(p => p.budgetType === 'Capital');
  const omPrograms = portfolioPrograms.filter(p => p.budgetType === 'O&M');
  
  const totalCapitalBudget = capitalPrograms.reduce((sum, p) => sum + (p.annualBudget || 0), 0);
  const totalCapitalActual = capitalPrograms.reduce((sum, p) => sum + (p.ytdActual || 0), 0);
  const capitalUtilization = totalCapitalBudget > 0 ? ((totalCapitalActual / totalCapitalBudget) * 100).toFixed(1) : '0.0';
  
  const totalOMBudget = omPrograms.reduce((sum, p) => sum + (p.targetYtd || 0), 0);
  const totalOMActual = omPrograms.reduce((sum, p) => sum + (p.ytdActual || 0), 0);
  const omExpenditure = totalOMBudget > 0 ? ((totalOMActual / totalOMBudget) * 100).toFixed(1) : '0.0';

  // Calculate FTE and Consultant Spend percentages
  const totalPlannedHours = workforceMetrics.reduce((sum, m) => sum + (m.plannedHours || 0), 0);
  const fteData = workforceMetrics.find(m => m.resourceType && m.resourceType.includes('FTE'));
  const consultantData = workforceMetrics.find(m => m.resourceType === 'Consultants');
  
  const fteSpendPercent = totalPlannedHours > 0 && fteData ? ((fteData.plannedHours / totalPlannedHours) * 100).toFixed(1) : '0';
  const consultantSpendPercent = totalPlannedHours > 0 && consultantData ? ((consultantData.plannedHours / totalPlannedHours) * 100).toFixed(1) : '0';

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
        <DollarSign size={24} />
        Portfolio Summary - Strategic View
      </h2>
      
      {/* KPI Cards Grid */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <h3>YTD Capital $ Utilization</h3>
            <span className="card-subtitle">(% of IT Capital Budget)</span>
          </div>
          <div className="card-value">{capitalUtilization}%</div>
          <div className="card-footer">
            Target: ${totalCapitalBudget.toFixed(0)}M | Actual: ${totalCapitalActual.toFixed(0)}M
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>YTD O&M $ Expenditure</h3>
            <span className="card-subtitle">(% of Allocated Budget)</span>
          </div>
          <div className="card-value">{omExpenditure}%</div>
          <div className="card-footer">
            Target: ${totalOMBudget.toFixed(0)}M | Actual: ${totalOMActual.toFixed(0)}M
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>YTD FTE Spend</h3>
            <span className="card-subtitle">(% of Overall Budget)</span>
          </div>
          <div className="card-value">{fteSpendPercent}%</div>
          <div className="card-footer">
            {fteData && `Target: ${fteData.plannedHours.toLocaleString()} hrs vs Actual: ${fteData.actualHours.toLocaleString()} hrs`}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>YTD Consultant Spend</h3>
            <span className="card-subtitle">(% of Overall Budget)</span>
          </div>
          <div className="card-value">{consultantSpendPercent}%</div>
          <div className="card-footer">
            {consultantData && `Target: ${consultantData.plannedHours.toLocaleString()} hrs vs Actual: ${consultantData.actualHours.toLocaleString()} hrs`}
          </div>
        </div>
      </div>

      {/* Portfolio Programs Table */}
      <div className="charts-grid">
        <div className="chart-container full-width">
          <h3 className="chart-title">Portfolio Summary / Program Health</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Budget Type</th>
                  <th>Annual Budget ($M)</th>
                  <th>YTD Actual ($M)</th>
                  <th>Target YTD ($M)</th>
                  <th>Variance %</th>
                  <th>Status</th>
                  <th>POC</th>
                </tr>
              </thead>
              <tbody>
                {portfolioPrograms.map((program, index) => (
                  <tr key={`program-${index}-${program.programName}`}>
                    <td><strong>{program.programName}</strong></td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: program.budgetType === 'Capital' ? '#dbeafe' : '#fef3c7',
                        color: program.budgetType === 'Capital' ? '#1e40af' : '#92400e'
                      }}>
                        {program.budgetType}
                      </span>
                    </td>
                    <td>${program.annualBudget}</td>
                    <td>${program.ytdActual}</td>
                    <td>${program.targetYtd}</td>
                    <td style={{ color: program.variance > 5 ? '#ef4444' : program.variance < -5 ? '#10b981' : '#f59e0b' }}>
                      {program.variance > 0 ? '+' : ''}{program.variance.toFixed(1)}%
                    </td>
                    <td>
                      <span style={{ color: getStatusColor(program.status), fontSize: '20px', marginRight: '4px' }}>
                        {getStatusIcon(program.status)}
                      </span>
                      <span style={{ color: getStatusColor(program.status), fontWeight: '600' }}>
                        {program.status}
                      </span>
                    </td>
                    <td>{program.poc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spend Trend Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Monthly Spend Trend ($M)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value}M`} />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} name="Planned" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spend by Category Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Spend by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} (${percentage}%)`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="spend"
              >
                {spendCategories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value}M`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialSection;
