# CIO Dashboard - Complete Data Template

## How to Use This Template

### For Business Users (Non-Technical)
1. **Create Excel Workbook**: Create a new Excel file named `CIO_Dashboard_Data.xlsx`
2. **Add Sheets**: Create 9 sheets using the tab names below
3. **Copy Data**: Copy the tables below into each corresponding sheet
4. **Edit Values**: Update the numbers, status, and text as needed
5. **Save & Share**: Save the file and share with your development team
6. **Refresh Dashboard**: Dev team will update the dashboard with your data

### For Developers
1. **Receive Excel File**: Get the updated Excel workbook from business users
2. **Export to CSV**: Save each sheet as individual CSV files in `data/` folder
3. **Update Code**: Copy data to `src/data/mockData.ts` (or implement CSV loader)
4. **Test**: Run `npm run dev` and verify changes
5. **Deploy**: Commit and deploy the updated dashboard

---

## SHEET 1: Portfolio Programs

**Tab Name:** `Portfolio_Programs`

| Program Name | Budget Type | Annual Budget ($M) | YTD Actual ($M) | Target YTD ($M) | Variance % | Status |
|--------------|-------------|-------------------|-----------------|-----------------|------------|--------|
| Grid Modernization | Capital | 120 | 68 | 70 | -2.8 | Green |
| Cyber Security | O&M | 45 | 38 | 35 | 8.5 | Amber |
| Customer Digital | Capital | 60 | 55 | 48 | 14.6 | Red |
| Smart Metering | Capital | 85 | 48 | 50 | -4.0 | Green |
| Data Analytics | O&M | 30 | 24 | 23 | 4.3 | Green |

**Excel Formula for Variance %:**
```excel
=((D2-E2)/E2)*100
```

**Conditional Formatting:**
- Green: Variance % between -5 and 5
- Amber: Variance % between 5 and 10
- Red: Variance % > 10

---

## SHEET 2: Application Health

**Tab Name:** `Application_Health`

| Application | Domain | Availability % | Incidents (90 Days) | Patch Compliance % | Status |
|-------------|--------|---------------|---------------------|-------------------|--------|
| Energy Billing | Customer Tech | 99.8 | 1 | 96 | Green |
| SCADA Core | Ops Tech | 97.2 | 4 | 88 | Amber |
| Asset Mgmt | IT Shared | 95.5 | 6 | 82 | Red |
| Outage Management | Ops Tech | 99.5 | 2 | 94 | Green |
| Customer Portal | Customer Tech | 98.8 | 3 | 90 | Green |
| Field Mobility | Ops Tech | 96.5 | 5 | 85 | Amber |

**Data Validation:**
- Domain: Customer Tech, Ops Tech, IT Shared, Security
- Status: Green, Amber, Red
- Availability: 90.0 to 100.0

---

## SHEET 3: Technology Projects

**Tab Name:** `Technology_Projects`

| Domain | Project Name | Budget ($M) | Actual ($M) | Schedule Status | Top Issue |
|--------|--------------|-------------|-------------|----------------|-----------|
| Ops Tech | Substation Automation | 25 | 22 | Green | Vendor delay |
| Customer Tech | Mobile App Revamp | 18 | 20 | Amber | Scope creep |
| IT Services | ERP Upgrade | 30 | 35 | Red | Resource shortage |
| Ops Tech | Grid Analytics Platform | 22 | 20 | Green | None |
| Customer Tech | Portal Enhancement | 15 | 14 | Green | None |
| Security | Firewall Replacement | 12 | 13 | Amber | Integration issues |

**Data Validation:**
- Domain: Ops Tech, Customer Tech, IT Services, Security
- Schedule Status: Green, Amber, Red

---

## SHEET 4: Workforce Metrics

**Tab Name:** `Workforce_Metrics`

| Resource Type | Planned Hours | Actual Hours | Variance % | Open Positions |
|---------------|---------------|--------------|------------|----------------|
| FTE | 120000 | 115000 | -4.2 | 14 |
| Consultants | 45000 | 52000 | 15.5 | 9 |
| Contractors | 30000 | 28500 | -5.0 | 5 |

**Excel Formula for Variance %:**
```excel
=((C2-B2)/B2)*100
```

**Utilization Formula:**
```excel
=(C2/B2)*100
```

---

## SHEET 5: Delivery Performance

**Tab Name:** `Delivery_Performance`

| Project | Milestones On-Time % | Scope Changes (90 Days) | Budget Burn % | Hours Burn % |
|---------|---------------------|------------------------|--------------|--------------|
| Grid Modernization | 92 | 1 | 58 | 61 |
| Cyber Security | 78 | 3 | 84 | 89 |
| Digital Customer | 65 | 4 | 91 | 97 |
| Smart Metering | 88 | 2 | 62 | 65 |
| Data Analytics | 95 | 0 | 55 | 58 |

**Health Status Logic:**
```excel
=IF(AND(B2>=85, D2<=70, E2<=75), "Green", IF(OR(B2<70, D2>90, E2>90), "Red", "Amber"))
```

---

## SHEET 6: Spend Categories

**Tab Name:** `Spend_Categories`

| Spend Category | Spend ($M) | % of Total |
|----------------|------------|------------|
| Infrastructure | 95 | 38 |
| Software & Licenses | 62 | 25 |
| Vendors & Consultants | 71 | 28 |
| Other | 22 | 9 |

**Excel Formula for % of Total:**
```excel
=B2/SUM($B$2:$B$5)*100
```

---

## SHEET 7: Monthly Spend Trend

**Tab Name:** `Monthly_Spend_Trend`

| Month | Planned ($M) | Actual ($M) |
|-------|-------------|-------------|
| Jan | 20 | 19 |
| Feb | 20 | 21 |
| Mar | 21 | 20 |
| Apr | 21 | 22 |
| May | 22 | 21 |
| Jun | 22 | 22 |
| Jul | 21 | 20 |
| Aug | 22 | 23 |
| Sep | 23 | 22 |
| Oct | 23 | 24 |
| Nov | 22 | 21 |
| Dec | 23 | 22 |

**Variance Formula:**
```excel
=C2-B2
```

---

## SHEET 8: Active Incidents

**Tab Name:** `Active_Incidents`

| ID | Title | Severity | Status | Age |
|----|-------|----------|--------|-----|
| INC-001 | SCADA Core Performance Degradation | High | In Progress | 2h |
| INC-002 | Asset Mgmt Database Sync Issue | High | Open | 4h |
| INC-003 | Field App Login Delays | Medium | In Progress | 6h |
| INC-004 | Customer Portal Certificate Warning | Low | Open | 1d |

**Data Validation:**
- Severity: High, Medium, Low
- Status: Open, In Progress, Resolved
- Age Format: #h (hours), #d (days), #w (weeks)

---

## SHEET 9: Skills Distribution

**Tab Name:** `Skills_Distribution`

| Skill | Count |
|-------|-------|
| SCADA/OT Systems | 85 |
| Cloud Infrastructure | 70 |
| Cybersecurity | 55 |
| Data Analytics | 45 |
| IoT/Smart Meters | 60 |
| Network Engineering | 80 |
| AI/ML | 30 |
| Mobile Development | 40 |

---

## Excel Tips & Best Practices

### 1. Use Data Validation Lists
Create dropdown lists for consistent data entry:
- **Status**: Green, Amber, Red
- **Domain**: Ops Tech, Customer Tech, IT Services, Security
- **Severity**: High, Medium, Low

### 2. Apply Conditional Formatting
Set up color coding:
- **Green cells**: RGB(220, 252, 231) / Light green
- **Amber cells**: RGB(254, 243, 199) / Light yellow
- **Red cells**: RGB(254, 226, 226) / Light red

### 3. Protect Headers
Lock the header rows to prevent accidental changes:
- Select header row → Review tab → Protect Sheet

### 4. Use Named Ranges
Create named ranges for easier formula references:
- Select data range → Formulas tab → Define Name

### 5. Add Comments/Notes
Document important context:
- Right-click cell → Insert Comment

---

## Summary Dashboard (Optional Sheet)

**Tab Name:** `Summary_KPIs`

Add a summary sheet with key metrics:

| Metric | Value | Status |
|--------|-------|--------|
| Total Programs | 5 | - |
| Green Programs | 3 | Green |
| Amber Programs | 1 | Amber |
| Red Programs | 1 | Red |
| Capital Utilization % | 62 | Green |
| O&M Spend vs Target % | 107 | Amber |
| Avg Application Availability % | 97.9 | Green |
| Active Incidents | 4 | Amber |
| Total Projects | 6 | - |
| Avg Milestones On-Time % | 84 | Amber |
| Total IT Spend YTD ($M) | 250 | - |
| FTE Utilization % | 96 | Green |
| Open Positions | 28 | Amber |

---

## Next Steps

1. **Create your Excel workbook** using this template
2. **Customize the data** for your organization
3. **Save the file** as `CIO_Dashboard_Data.xlsx`
4. **Share with developers** for dashboard integration
5. **Update regularly** - recommend monthly updates for accurate tracking

Need help? See `data/EXCEL_WORKFLOW.md` for detailed integration options.
