import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, Home, Briefcase, Target, Activity, Users, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ExecutiveSummary from './ExecutiveSummary';
import FinancialSection from './FinancialSection';
import PortfolioCockpit from './PortfolioCockpit';
import ProjectSection from './ProjectSection';
import WorkforceSection from './WorkforceSection';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

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
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.email || ''}</div>
              </div>
            </div>
            <button
              className="logout-button"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={20} />
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
    </div>
  );
};

export default Dashboard;
