# Quick Start: Working with Excel Data

## For Business Users

### Update Dashboard Data in 3 Steps

1. **Open CSV Files in Excel**
   - Navigate to `CIO_Dashboard/data/` folder
   - Double-click any `.csv` file to open in Excel
   - OR: Open Excel → File → Open → Select CSV file

2. **Make Your Changes**
   - Update numbers, metrics, status values
   - Add new rows if needed
   - Delete obsolete entries
   - Keep column headers unchanged

3. **Save and Share**
   - File → Save As → CSV (Comma delimited)
   - Keep the same filename
   - Share with development team

### Excel Files Available

| File Name | What It Contains | Update Frequency |
|-----------|-----------------|------------------|
| `portfolio_programs.csv` | Budget tracking by program | Monthly |
| `application_health.csv` | System uptime & incidents | Weekly |
| `technology_projects.csv` | Project status & issues | Weekly |
| `workforce_metrics.csv` | Resource utilization | Monthly |
| `delivery_performance.csv` | Project milestones & burn rates | Monthly |
| `spend_categories.csv` | IT spend breakdown | Monthly |
| `monthly_spend_trend.csv` | Spending over time | Monthly |
| `active_incidents.csv` | Current incidents | Daily |
| `skills_distribution.csv` | Team capabilities | Quarterly |

### Status Values Reference

Always use these exact values (case-sensitive):

- **Green** - On track, healthy, no issues
- **Amber** - Warning, needs monitoring
- **Red** - Critical, requires immediate action

### Common Questions

**Q: Can I add new columns?**  
A: No, this requires code changes. Contact development team.

**Q: Can I add new rows?**  
A: Yes! Just add data following the same format.

**Q: What if I make a mistake?**  
A: Keep a backup of the original file before editing.

**Q: How often should I update?**  
A: See "Update Frequency" column in table above.

---

## For Developers

### Option 1: Manual Update (Current MVP)

```typescript
// In src/data/mockData.ts, manually update arrays:

export const portfolioPrograms: PortfolioProgram[] = [
  { 
    programName: 'Grid Modernization', 
    budgetType: 'Capital', 
    annualBudget: 120, 
    ytdActual: 68, 
    targetYTD: 70, 
    variance: -2.8, 
    status: 'Green' 
  },
  // ... add more rows from Excel
];
```

### Option 2: CSV Import at Runtime (Recommended)

1. **Install CSV Parser**
   ```bash
   npm install papaparse
   npm install --save-dev @types/papaparse
   ```

2. **Create CSV Loader Utility**
   ```typescript
   // src/utils/csvLoader.ts
   import Papa from 'papaparse';

   export async function loadCSV<T>(filename: string): Promise<T[]> {
     const response = await fetch(`/data/${filename}`);
     const csvText = await response.text();
     const result = Papa.parse(csvText, { 
       header: true,
       dynamicTyping: true,
       skipEmptyLines: true
     });
     return result.data as T[];
   }
   ```

3. **Update mockData.ts to Load from CSV**
   ```typescript
   import { loadCSV } from '../utils/csvLoader';

   // Load data on app initialization
   export const portfolioPrograms = await loadCSV<PortfolioProgram>('portfolio_programs.csv');
   ```

4. **Move CSV Files to Public Folder**
   ```bash
   # Move data folder to public
   mv data public/data
   ```

### Option 3: Build-Time CSV Processing

1. **Install Vite Plugin**
   ```bash
   npm install --save-dev @rollup/plugin-dsv
   ```

2. **Update vite.config.ts**
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import dsv from '@rollup/plugin-dsv';

   export default defineConfig({
     plugins: [react(), dsv()]
   });
   ```

3. **Import CSV Directly**
   ```typescript
   import portfolioData from '../data/portfolio_programs.csv';
   ```

### Testing After Updates

```bash
# Start dev server
npm run dev

# Check browser console for errors
# Verify data appears correctly in dashboard
# Test all four sections: Financial, Operational, Projects, Workforce
```

### Deployment Checklist

- [ ] CSV files match TypeScript interfaces
- [ ] No console errors
- [ ] All charts render correctly
- [ ] Status colors display properly (Green/Amber/Red)
- [ ] Numbers formatted correctly (currency, percentages)
- [ ] Test responsive design (desktop, tablet, mobile)

---

## Troubleshooting

### Issue: Data Not Updating

**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Verify CSV file is saved correctly
3. Check for typos in status values
4. Ensure CSV has no empty rows

### Issue: Chart Not Displaying

**Solution:**
1. Check browser console for errors
2. Verify data structure matches interface
3. Ensure numeric fields contain numbers, not text
4. Check for null/undefined values

### Issue: Wrong Colors

**Solution:**
1. Status must be exact: "Green", "Amber", "Red" (capital first letter)
2. Check conditional logic in component files
3. Verify CSS classes are applied

### Issue: CSV Opens with Garbled Text

**Solution:**
1. Ensure CSV is UTF-8 encoded
2. Use Excel's "CSV UTF-8 (Comma delimited)" save option
3. Or use Google Sheets → Download as CSV

---

## Support

**For Business Users:**  
Contact your development team lead with updated CSV files

**For Developers:**  
See detailed guides:
- `data/EXCEL_WORKFLOW.md` - Integration options
- `data/EXCEL_TEMPLATE.md` - Complete data structure
- `data/README.md` - Data files overview
