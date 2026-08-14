import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, Home, Briefcase, Target, Activity, Users, LogOut, Sparkles } from 'lucide-react';
import ExecutiveSummary from './ExecutiveSummary';
import FinancialSection from './FinancialSection';
import PortfolioCockpit from './PortfolioCockpit';
import ProjectSection from './ProjectSection';
import WorkforceSection from './WorkforceSection';
import SummaryPanel from './SummaryPanel';
import Chatbot from './Chatbot';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { generateSummary, SectionSummary, getSectionTitle } from '../services/summaryService';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<SectionSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSummary = async () => {
    setSummaryOpen(true);
    setSummaryLoading(true);
    try {
      const summary = await generateSummary(activeTab);
      setSummaryData(summary);
    } catch (error) {
      console.error('Summary error:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setSummaryOpen(false);
    setSummaryData(null);
  };

  const tabs = [
    { id: 'executive', label: 'Executive Summary', icon: Home },
    { id: 'portfolio', label: 'Portfolio Summary', icon: Briefcase },
    { id: 'cockpit', label: 'Portfolio Cockpit', icon: Target },
    { id: 'operations', label: 'Program Health (PHS)', icon: Activity },
    { id: 'workforce', label: 'People Productivity (PPS)', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveSummary />;
      case 'portfolio':
        return <FinancialSection />;
      case 'cockpit':
        return <PortfolioCockpit />;
      case 'operations':
        return <ProjectSection />;
      case 'workforce':
        return <WorkforceSection />;
      default:
        return <ExecutiveSummary />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
            </button>
            <LayoutDashboard size={32} />
            <div>
              <h1>CIO Dashboard - American Logics</h1>
              <p className="subtitle">KPIs for Utilities CIO</p>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="summary-button"
              onClick={handleSummary}
              title="Get AI Summary"
            >
              <Sparkles size={18} />
              <span>Summary</span>
            </button>
            <div className="user-info">
              <div className="user-avatar">A</div>
              <div>
                <div className="user-name">{user?.email || 'American Logics'}</div>
                <div className="user-role">CIO Dashboard</div>
              </div>
            </div>
            <button 
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Left Sidebar Navigation */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-wrapper">
            {renderContent()}
          </div>

          {/* Footer */}
          <footer className="content-footer">
            <div className="footer-content">
              <p>&copy; 2024 American Logics. All rights reserved.</p>
              <p>Last Updated: {new Date().toLocaleString()}</p>
            </div>
          </footer>
        </main>
      </div>

      {/* AI Summary Panel */}
      <SummaryPanel
        isOpen={summaryOpen}
        onClose={handleCloseSummary}
        title={getSectionTitle(activeTab)}
        isLoading={summaryLoading}
      >
        {summaryData?.content}
      </SummaryPanel>

      {/* Portfolio AI Chatbot - Only on portfolio and cockpit pages */}
      {(activeTab === 'portfolio' || activeTab === 'cockpit') && <Chatbot />}
    </div>
  );
};

export default Dashboard;
