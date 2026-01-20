# CIO Dashboard MVP

A comprehensive executive dashboard for Chief Information Officers, providing real-time visibility into:

- **Portfolio & Financial Visibility**: Budget tracking, spend analysis, and cost optimization
- **Operational Health**: System uptime, incident management, and service performance
- **Project Delivery Performance**: Project status, timeline tracking, and risk management
- **Workforce Productivity**: Team utilization, skills distribution, and resource allocation

## 🚀 Quick Deployment

### Deploy to Google Cloud Platform (Recommended)

One-command deployment to GCP using Cloud Run and Firebase:

```bash
# 1. Enable services
./deploy/enable-services.sh

# 2. Deploy everything
./deploy/deploy-all.sh YOUR_PROJECT_ID
```

**Cost:** $0-5/month (development) or $60-130/month (production)

📖 **[Complete GCP Deployment Guide](docs/MANUAL_DEPLOYMENT_GCP.md)**

### Alternative Deployment Options

- **Vercel + Railway/Heroku**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **AWS EC2**: See [MIGRATION_EC2_TO_GCP.md](docs/MIGRATION_EC2_TO_GCP.md)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.8+ (for backend)
- YugabyteDB or PostgreSQL (for data storage)

### Installation

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment (see YugabyteDB setup below)
cp .env.example .env
# Edit .env with your database credentials

# Start backend server
python main.py
```

#### Database Setup
See [YUGABYTEDB_SETUP.md](YUGABYTEDB_SETUP.md) for detailed database setup instructions.

**Quick Setup:**
```bash
cd backend
python setup_database.py  # Creates database, schema, and migrates data
```

## Features

### 1. Portfolio & Financial Visibility
- Program health tracking with Capital/O&M budget types
- Budget vs Actual variance analysis with Green/Amber/Red status
- Spend analysis by category (Infrastructure, Software, Vendors, Other)
- Monthly spend trend tracking

### 2. Operational Health
- Application availability monitoring (Customer Tech, Ops Tech, IT Shared)
- Active incident tracking with severity levels
- Patch compliance across critical systems
- System health indicators (SCADA, Billing, Asset Management)

### 3. Project Delivery Performance
- Technology domain project tracking (Ops Tech, Customer Tech, Security, IT Services)
- Schedule status with top issues identification
- Budget vs Actual with variance tracking
- Delivery metrics: Milestones on-time, Budget burn, Hours burn, Scope changes

### 4. Workforce Productivity (PPS)
- Resource utilization by type (FTE, Consultants, Contractors)
- Planned vs Actual hours tracking
- Open positions monitoring
- Skills distribution across organization

## Technology Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/           # Dashboard components
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── FinancialSection.tsx
│   ├── OperationalSection.tsx
│   ├── ProjectSection.tsx
│   └── WorkforceSection.tsx
├── data/                # Mock data
│   └── mockData.ts
├── styles/              # CSS styles
│   └── Dashboard.css
├── App.tsx              # Root component
└── main.tsx            # Entry point

data/                    # Excel-friendly CSV files
├──Data Management

All dashboard data is available in **Excel-friendly CSV format** in the `data/` folder:

### Quick Update Process
1. Open CSV files in Excel (or use the master workbook template)
2. Edit your metrics, status, and values
3. Save as CSV
4. Copy data to `src/data/mockData.ts` or integrate CSV loader
5. Run `npm run dev` to see changes

### Excel Workbook Template
See `data/EXCEL_WORKFLOW.md` for:
- Master workbook structure with all data sheets
- Excel formulas for automatic calculations
- Conditional formatting for status colors
- Data validation rules
- Future integration options (CSV import, Excel API)

### Data Files Included
- Portfolio programs with budget tracking
- Application health metrics
- Technology projects with delivery performance
- Workforce utilization and skills
- Spend analysis and trends
- Active incidents tracking

## Future Enhancements

- **Excel Integration**: Direct CSV import or Microsoft Graph API for Excel Online
- Real-time data integration with backend APIs
- Advanced filtering and drill-down capabilities
- Export functionality (PDF, Excel)
- Custom alert configuration and thresholds
- Role-based access control
- Enhanced mobile responsiveness
- Historical data trending and analytic
├── skills_distribution.csv
├── README.md           # Data files documentation
└── EXCEL_WORKFLOW.md   # Excel integration guide
```

## Future Enhancements

- Real-time data integration with backend APIs
- Advanced filtering and drill-down capabilities
- Export functionality (PDF, Excel)
- Custom alert configuration
- Role-based access control
- Mobile responsiveness improvements

## 📚 Documentation

### Deployment Guides
- **[GCP Deployment (Recommended)](docs/MANUAL_DEPLOYMENT_GCP.md)** - Deploy to Cloud Run + Firebase
- **[Vercel/Railway Deployment](DEPLOYMENT.md)** - Alternative deployment options
- **[EC2 to GCP Migration](docs/MIGRATION_EC2_TO_GCP.md)** - Migrate from AWS to GCP

### Configuration & Cost
- **[Cloud Run Configuration](docs/CLOUD_RUN_CONFIGURATION.md)** - Understanding Cloud Run settings
- **[GCP Cost Estimates](docs/GCP_COST_ESTIMATE.md)** - Detailed pricing breakdown
- **[Troubleshooting GCP](docs/TROUBLESHOOTING_GCP.md)** - Common issues and solutions

### Setup Guides
- **[Full-Stack Setup](FULLSTACK_SETUP.md)** - Local development setup
- **[YugabyteDB Setup](YUGABYTEDB_SETUP.md)** - Database configuration
- **[Authentication Setup](AUTH_SETUP.md)** - User authentication
- **[Multi-Tenant Deployment](MULTI_TENANT_DEPLOYMENT.md)** - Multi-client setup

### Data Management
- **[Excel Workflow](data/EXCEL_WORKFLOW.md)** - Excel integration guide
- **[Excel Templates](data/EXCEL_TEMPLATE.md)** - Data templates
- **[Excel Formulas](data/EXCEL_FORMULAS.md)** - Calculation formulas

## License

Proprietary - American Logics
