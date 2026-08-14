import React from 'react';
import { SectionSummary } from '../services/summaryService';

const createSummaryContent = (children: React.ReactNode): SectionSummary => ({
  title: '',
  content: <div className="summary-content">{children}</div>
});

export const getDashboardSummary = (sectionId: string): SectionSummary => {
  switch (sectionId) {
    case 'executive':
      return createSummaryContent(
        <>
          <h3>📊 Key Takeaways</h3>
          <p>
            The <strong>CIO Dashboard</strong> for American Logics reflects a healthy yet cautiously optimistic 
            technology portfolio. IT spend is well within budget, with a <span className="summary-metric">76.3%</span> budget 
            utilization rate and strong <span className="summary-metric">99.7%</span> system uptime. Revenue growth 
            of <span className="summary-metric">16.2%</span> YoY indicates the technology investments are supporting 
            business expansion effectively.
          </p>
          
          <div className="summary-highlight">
            <strong>Critical Insight:</strong> IT spend as a percentage of revenue remains at 4.1%, showing 
            efficient cost management while scaling technology capabilities.
          </div>
          
          <h3>⚠️ Areas of Attention</h3>
          <ul>
            <li>Security incidents are down <strong>8.9% MoM</strong>, but continued vigilance is essential.</li>
            <li>Budget utilization is healthy; however, spending acceleration may be needed to capitalize on growth.</li>
            <li>Response time improvements should be maintained as the portfolio scales.</li>
          </ul>
          
          <h3>🎯 Recommended Actions</h3>
          <ul>
            <li>Continue monitoring security posture and incident response readiness.</li>
            <li>Allocate remaining budget to high-impact modernization initiatives.</li>
            <li>Leverage revenue growth to invest in predictive analytics and AI capabilities.</li>
          </ul>
        </>
      );
    
    case 'portfolio':
      return createSummaryContent(
        <>
          <h3>💰 Financial Health</h3>
          <p>
            The portfolio financials show a well-distributed investment across major IT categories. 
            <strong>Applications Development</strong> and <strong>Infrastructure & Operations</strong> continue 
            to dominate the spend profile, reflecting ongoing modernization and stability needs. The spend trend 
            indicates consistent investment levels with manageable quarter-over-quarter variation.
          </p>
          
          <div className="summary-highlight">
            <strong>Key Observation:</strong> The spend distribution aligns with a typical utilities portfolio, 
            prioritizing reliability, compliance, and customer-facing digital services.
          </div>
          
          <h3>📈 Spend Trends</h3>
          <ul>
            <li>Monthly spend is within expected variance bands.</li>
            <li>Capital vs. operational spend mix supports asset lifecycle goals.</li>
            <li>No major budget overruns detected in the current period.</li>
          </ul>
          
          <h3>🎯 Strategic Recommendations</h3>
          <ul>
            <li>Review high-cost application portfolios for consolidation opportunities.</li>
            <li>Shift more spend toward cloud and digital customer experiences if business case supports it.</li>
            <li>Maintain reserve capacity for regulatory and cybersecurity requirements.</li>
          </ul>
        </>
      );
    
    case 'cockpit':
      return createSummaryContent(
        <>
          <h3>🎯 Portfolio Overview</h3>
          <p>
            The <strong>Portfolio Cockpit</strong> shows a balanced mix of active programs, applications, and 
            initiatives. Most programs are in <strong>"On Track"</strong> or <strong>"At Risk"</strong> status, 
            with a few requiring executive attention. The health distribution indicates active risk management 
            across the portfolio.
          </p>
          
          <div className="summary-highlight">
            <strong>Status Alert:</strong> Programs showing red or amber health should be reviewed in the next 
            portfolio governance meeting for mitigation planning.
          </div>
          
          <h3>🛡️ Application Health</h3>
          <ul>
            <li>Application health scores are within acceptable ranges overall.</li>
            <li>Legacy systems continue to represent the highest technical debt concentration.</li>
            <li>Customer-facing applications are generally in better health than internal systems.</li>
          </ul>
          
          <h3>🎯 Next Steps</h3>
          <ul>
            <li>Schedule deep-dive reviews for at-risk programs within the next 2 weeks.</li>
            <li>Reallocate resources from healthy programs to struggling ones if possible.</li>
            <li>Update risk registers and mitigation plans for amber programs.</li>
          </ul>
        </>
      );
    
    case 'operations':
      return createSummaryContent(
        <>
          <h3>🔧 Program Health</h3>
          <p>
            The <strong>Program Health Section</strong> reveals a technology project portfolio with mixed delivery 
            performance. Some technology initiatives are advancing well, while others are experiencing schedule or 
            quality challenges. The delivery performance indicators suggest the need for tighter milestone management.
          </p>
          
          <div className="summary-highlight">
            <strong>Risk Area:</strong> Projects with delivery variance above 10% should be flagged for immediate 
            review with program managers and stakeholders.
          </div>
          
          <h3>📋 Delivery Performance</h3>
          <ul>
            <li>Most active projects are progressing within acceptable variance.</li>
            <li>Incidents are being managed effectively with low active counts.</li>
            <li>Technology stack diversity is increasing, which may require architecture governance.</li>
          </ul>
          
          <h3>🎯 Action Items</h3>
          <ul>
            <li>Implement weekly delivery pulse checks for high-risk projects.</li>
            <li>Reinforce change control and dependency management practices.</li>
            <li>Focus on knowledge transfer to reduce single points of failure.</li>
          </ul>
        </>
      );
    
    case 'workforce':
      return createSummaryContent(
        <>
          <h3>👥 Workforce Insights</h3>
          <p>
            The <strong>People Productivity Section</strong> shows a workforce operating at strong utilization 
            rates with a diverse skill distribution. The team is managing planned vs. actual hours effectively, 
            though some variance exists in specific resource categories. The skill distribution highlights strengths 
            in core utility technology competencies.
          </p>
          
          <div className="summary-highlight">
            <strong>Talent Insight:</strong> Utilization rates are healthy, but certain in-demand skills show 
            potential capacity constraints that could impact future project delivery.
          </div>
          
          <h3>📊 Key Metrics</h3>
          <ul>
            <li>Workforce utilization is within the target range for most resource types.</li>
            <li>Open positions exist in specialized technology areas.</li>
            <li>Planned vs. actual hours variance is manageable but needs monitoring.</li>
          </ul>
          
          <h3>🎯 Recommendations</h3>
          <ul>
            <li>Accelerate hiring for critical skill gaps (cloud, cybersecurity, data engineering).</li>
            <li>Launch targeted upskilling programs to build internal capability.</li>
            <li>Review resource allocation to balance utilization across teams.</li>
          </ul>
        </>
      );
    
    default:
      return createSummaryContent(
        <>
          <h3>🤖 AI Summary</h3>
          <p>
            This section provides a comprehensive view of your CIO dashboard data. Use the tabs to navigate 
            between different areas including executive summary, portfolio, operations, workforce, and financials.
          </p>
          <p>
            Each section is designed to give you quick, actionable insights into your IT organization's performance 
            and health.
          </p>
        </>
      );
  }
};

export default getDashboardSummary;