# CIO Dashboard - Data Files

This folder contains all the mock data for the CIO Dashboard in CSV format. These files can be easily edited in Microsoft Excel, Google Sheets, or any spreadsheet application.

## Data Files Overview

### 1. Portfolio & Financial Data
- **portfolio_programs.csv** - Program health and budget tracking
- **spend_categories.csv** - IT spend breakdown by category
- **monthly_spend_trend.csv** - Monthly planned vs actual spend

### 2. Operational Health Data
- **application_health.csv** - Application availability and health metrics
- **active_incidents.csv** - Current active incidents

### 3. Project Delivery Data
- **technology_projects.csv** - Key projects by technology domain
- **delivery_performance.csv** - Project delivery metrics

### 4. Workforce Data
- **workforce_metrics.csv** - Resource utilization by type
- **skills_distribution.csv** - Skills across the organization

## How to Update Data

### Option 1: Edit CSV Files Directly
1. Open any CSV file in Excel
2. Make your changes
3. Save as CSV (Comma delimited)
4. The React app will need to be updated to read these files

### Option 2: Copy/Paste from Excel
1. Open the CSV file in Excel
2. Make changes in Excel
3. Copy the data
4. Update the corresponding section in `src/data/mockData.ts`

### Option 3: Excel Integration (Future Enhancement)
For production use, consider integrating with:
- Excel Online via Microsoft Graph API
- Google Sheets API
- Backend database with Excel export functionality

## Data Validation Rules

### Status Values
- **Green**: On track, healthy, within acceptable range
- **Amber**: Warning, needs attention, approaching threshold
- **Red**: Critical, requires immediate action, exceeds threshold

### Budget Type
- **Capital**: Capital expenditure projects
- **O&M**: Operations & Maintenance costs

### Domain Values
- **Ops Tech**: Operational Technology (SCADA, Grid, Field)
- **Customer Tech**: Customer-facing systems
- **IT Shared**: Shared IT services
- **Security**: Cybersecurity systems

### Schedule Status
- **Green**: On schedule
- **Amber**: Minor delays
- **Red**: Significant delays

## Sample Data Notes

All data is illustrative for demo purposes:
- Numbers are rounded for simplicity
- Trends show realistic patterns
- Health indicators support executive decision-making
- Energy/Utilities industry context
