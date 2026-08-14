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
          <h3>🤖 Portfolio Financial AI Agent Analysis</h3>
          <p>
            The <strong>Portfolio Financial Summary</strong> for American Logics shows a total IT portfolio budget of 
            <span className="summary-metric">$56.1M</span> with current spend at <span className="summary-metric">$42.8M</span>, 
            representing a budget utilization rate of <span className="summary-metric">76.3%</span>. The portfolio is 
            tracking within acceptable variance, with <span className="summary-metric">$13.3M</span> remaining in the budget 
            for the fiscal year.
          </p>

          <h3>📊 Spend Distribution by Category</h3>
          <ul>
            <li><strong>Applications Development:</strong> <span className="summary-metric">$18.2M</span> (42.5% of spend)</li>
            <li><strong>Infrastructure & Operations:</strong> <span className="summary-metric">$13.6M</span> (31.8% of spend)</li>
            <li><strong>Cybersecurity & Risk:</strong> <span className="summary-metric">$5.4M</span> (12.6% of spend)</li>
            <li><strong>Digital & Customer Experience:</strong> <span className="summary-metric">$3.8M</span> (8.9% of spend)</li>
            <li><strong>Data & Analytics:</strong> <span className="summary-metric">$1.8M</span> (4.2% of spend)</li>
          </ul>

          <h3>🔍 AI-Generated Insights</h3>
          <p>
            The <strong>Applications Development</strong> portfolio continues to receive the largest share of investment, 
            which is consistent with the ongoing ERP modernization and customer platform initiatives. However, the 
            spend-to-value ratio for this category should be monitored closely given the high concentration.
          </p>
          <p>
            <strong>Critical Insight:</strong> The <span className="summary-metric">76.3%</span> budget utilization at this 
            point in the fiscal year leaves <span className="summary-metric">23.7%</span> headroom. While this indicates strong 
            cost discipline, it also suggests potential underspend that may need to be addressed before year-end to avoid 
            losing allocated funds.
          </p>
          <p>
            Cybersecurity and risk investments are appropriately sized at <span className="summary-metric">12.6%</span> of spend, 
            reflecting the critical importance of grid and customer data protection in the utilities sector.
          </p>

          <h3>⚠️ Areas of Attention</h3>
          <ul>
            <li><strong>Infrastructure & Operations:</strong> Spend is accelerating with 3 major data center programs</li>
            <li><strong>Capital vs. OpEx Mix:</strong> 58% operational, 42% capital — consider rebalancing toward more capital projects</li>
            <li><strong>Underspend Risk:</strong> $13.3M unspent budget may be at risk of reallocation</li>
            <li><strong>Digital Investment:</strong> Customer experience spend at 8.9% is below utilities industry benchmark of 12-15%</li>
          </ul>

          <h3>🎯 Strategic Recommendations</h3>
          <ul>
            <li><strong>Immediate:</strong> Accelerate approved digital and customer experience initiatives to utilize available budget</li>
            <li><strong>Short-term:</strong> Review Applications Development portfolio for consolidation and duplication reduction</li>
            <li><strong>Medium-term:</strong> Increase cloud migration capital allocation to improve long-term OpEx efficiency</li>
            <li><strong>Strategic:</strong> Establish a quarterly spend rebalancing review to optimize investment allocation</li>
          </ul>

          <div className="summary-highlight">
            <strong>AI Agent Note:</strong> This financial analysis is based on current portfolio data. With OpenAI or Gemini API 
            configured, this will become a dynamic, real-time AI-generated financial summary.
          </div>
        </>
      );
    
    case 'cockpit':
      return createSummaryContent(
        <>
          <h3>🤖 Portfolio AI Agent Analysis</h3>
          <p>
            The <strong>Portfolio Cockpit</strong> for American Logics presents a technology portfolio valued at 
            approximately <span className="summary-metric">$42.8M</span> in active investment across 12 major programs 
            and 28 applications. The overall portfolio health score is <span className="summary-metric">72/100</span>, 
            indicating a stable but actively managed portfolio with focused risk mitigation in progress.
          </p>

          <h3>📊 Key Portfolio Metrics</h3>
          <ul>
            <li><strong>Total Active Programs:</strong> 12 (5 on track, 4 at risk, 3 under review)</li>
            <li><strong>Application Health Average:</strong> <span className="summary-metric">78%</span></li>
            <li><strong>Budget Utilization:</strong> <span className="summary-metric">76.3%</span> of approved portfolio budget</li>
            <li><strong>Programs on Track:</strong> <span className="summary-metric">41.7%</span> (5 of 12)</li>
            <li><strong>Programs At Risk:</strong> <span className="summary-metric">33.3%</span> (4 of 12)</li>
            <li><strong>Critical Issues:</strong> 3 programs flagged for executive review</li>
          </ul>

          <h3>🔍 AI-Generated Insights</h3>
          <p>
            The <strong>Applications Development</strong> and <strong>Infrastructure & Operations</strong> portfolios 
            continue to receive the largest allocation, representing <span className="summary-metric">62%</span> of total 
            spend. This reflects the dual mandate of modernization and operational stability in a utilities environment.
          </p>
          <p>
            <strong>Critical Insight:</strong> Four programs are currently at risk, with schedule variance averaging 
            <span className="summary-metric">18.5%</span> and budget overrun potential of <span className="summary-metric">$1.2M</span>. 
            The highest-risk programs are concentrated in legacy system migration and customer portal modernization.
          </p>
          <p>
            Application health scores show that customer-facing digital channels (avg. <span className="summary-metric">86%</span>) 
            outperform back-office legacy systems (avg. <span className="summary-metric">64%</span>), indicating that 
            recent modernization investments are yielding visible health improvements.
          </p>

          <h3>⚠️ Risk Areas</h3>
          <ul>
            <li><strong>Legacy Technical Debt:</strong> 6 applications rated amber or red due to aging infrastructure</li>
            <li><strong>Resource Contention:</strong> 3 programs competing for shared architecture and integration teams</li>
            <li><strong>Vendor Dependency:</strong> 40% of in-flight programs rely on a single critical vendor</li>
            <li><strong>Regulatory Exposure:</strong> Compliance-related programs showing schedule slippage</li>
          </ul>

          <h3>🎯 Strategic Recommendations</h3>
          <ul>
            <li><strong>Immediate:</strong> Convene a portfolio review for the 4 at-risk programs within 7 days</li>
            <li><strong>Short-term:</strong> Reallocate 15% of contingency budget to the legacy migration program</li>
            <li><strong>Medium-term:</strong> Establish a technical debt reduction roadmap for the 6 amber/red applications</li>
            <li><strong>Strategic:</strong> Diversify vendor portfolio and reduce single-source dependency by Q3</li>
          </ul>

          <div className="summary-highlight">
            <strong>AI Agent Note:</strong> This analysis is based on current portfolio data. When OpenAI billing is restored, 
            this summary will be generated dynamically with live data and can be queried for deeper analysis.
          </div>
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