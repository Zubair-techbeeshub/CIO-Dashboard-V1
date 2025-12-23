# CIO Dashboard Data Management Guide

## Excel Workbook Structure

You can create a single Excel workbook with multiple sheets, each containing one data table. Here's the recommended structure:

### Excel Workbook: `CIO_Dashboard_Data.xlsx`

#### Sheet 1: Portfolio Programs
| Program Name | Budget Type | Annual Budget ($M) | YTD Actual ($M) | Target YTD ($M) | Variance % | Status |
|--------------|-------------|-------------------|-----------------|-----------------|------------|--------|
| Grid Modernization | Capital | 120 | 68 | 70 | -2.8 | Green |
| Cyber Security | O&M | 45 | 38 | 35 | 8.5 | Amber |

#### Sheet 2: Application Health
| Application | Domain | Availability % | Incidents (90 Days) | Patch Compliance % | Status |
|-------------|--------|---------------|---------------------|-------------------|--------|
| Energy Billing | Customer Tech | 99.8 | 1 | 96 | Green |

#### Sheet 3: Technology Projects
| Domain | Project Name | Budget ($M) | Actual ($M) | Schedule Status | Top Issue |
|--------|--------------|-------------|-------------|----------------|-----------|
| Ops Tech | Substation Automation | 25 | 22 | Green | Vendor delay |

#### Sheet 4: Workforce Metrics
| Resource Type | Planned Hours | Actual Hours | Variance % | Open Positions |
|---------------|---------------|--------------|------------|----------------|
| FTE | 120000 | 115000 | -4.2 | 14 |

#### Sheet 5: Delivery Performance
| Project | Milestones On-Time % | Scope Changes (90 Days) | Budget Burn % | Hours Burn % |
|---------|---------------------|------------------------|--------------|--------------|
| Grid Modernization | 92 | 1 | 58 | 61 |

#### Sheet 6: Spend Categories
| Spend Category | Spend ($M) | % of Total |
|----------------|------------|------------|
| Infrastructure | 95 | 38 |

#### Sheet 7: Monthly Spend Trend
| Month | Planned ($M) | Actual ($M) |
|-------|-------------|-------------|
| Jan | 20 | 19 |

#### Sheet 8: Active Incidents
| ID | Title | Severity | Status | Age |
|----|-------|----------|--------|-----|
| INC-001 | SCADA Core Performance Degradation | High | In Progress | 2h |

#### Sheet 9: Skills Distribution
| Skill | Count |
|-------|-------|
| SCADA/OT Systems | 85 |

## Workflow Options

### Current Setup (MVP)
1. Data is hardcoded in `src/data/mockData.ts`
2. CSV files provided for easy editing in Excel
3. Manual copy/paste from Excel to TypeScript

### How to Update Dashboard Data

1. **Edit CSV Files in Excel**
   - Open any CSV file from the `data/` folder
   - Make your changes
   - Save as CSV

2. **Update TypeScript Code**
   - Open `src/data/mockData.ts`
   - Find the corresponding data array
   - Update values manually

3. **Test Changes**
   ```bash
   npm run dev
   ```

### Future: Automated Excel Integration

For production, consider these approaches:

#### Option A: CSV Import at Runtime
```typescript
// Install: npm install papaparse
import Papa from 'papaparse';

async function loadCSVData(filename: string) {
  const response = await fetch(`/data/${filename}`);
  const csvText = await response.text();
  const result = Papa.parse(csvText, { header: true });
  return result.data;
}
```

#### Option B: Excel API Integration
```typescript
// Microsoft Graph API for Excel Online
// Google Sheets API
// Backend API with Excel export
```

#### Option C: Build-Time CSV Processing
```typescript
// Use Vite plugin to process CSV during build
import { defineConfig } from 'vite';
import dsv from '@rollup/plugin-dsv';

export default defineConfig({
  plugins: [dsv()]
});
```

## Data Entry Best Practices

### Status Values
- Use dropdown in Excel: Green, Amber, Red
- Conditional formatting for visual indicators

### Numeric Fields
- Budget/Spend: Millions (M)
- Hours: Actual numbers (e.g., 120000)
- Percentages: Numbers without % sign (e.g., 92 for 92%)

### Date/Time Fields
- Age format: #h (hours), #d (days)
- Use consistent format across all sheets

### Text Fields
- Keep descriptions concise
- Use consistent terminology
- "None" for empty Top Issue field

## Quick Start for Business Users

1. **Download** all CSV files from `data/` folder
2. **Open in Excel** - Open each CSV or combine into one workbook
3. **Edit** your data - Update numbers, status, metrics
4. **Save** - Keep as CSV or save as Excel workbook
5. **Notify Developer** - Send updated files to dev team
6. **Developer Updates** - Dev team updates `mockData.ts`
7. **Deploy** - Changes appear in dashboard

## Excel Formulas (Optional)

Add these formulas in your Excel workbook for automatic calculations:

### Variance Calculation
```excel
=((YTD_Actual - Target_YTD) / Target_YTD) * 100
```

### Budget Burn Percentage
```excel
=(Actual / Budget) * 100
```

### Status Logic (using IF)
```excel
=IF(Variance > 10, "Red", IF(Variance > 5, "Amber", "Green"))
```

## Color Coding in Excel

Apply conditional formatting:
- **Green**: RGB(16, 185, 129) or #10B981
- **Amber**: RGB(245, 158, 11) or #F59E0B
- **Red**: RGB(239, 68, 68) or #EF4444
