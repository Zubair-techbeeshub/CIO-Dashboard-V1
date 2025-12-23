# Excel Formulas & Macros

## Automated Calculations for Excel Workbook

Copy these formulas into your Excel workbook for automatic calculations.

### Portfolio Programs Sheet

**Column F (Variance %):**
```excel
=IF(E2=0, 0, ROUND((D2-E2)/E2*100, 1))
```

**Column G (Status) - Automated:**
```excel
=IF(ABS(F2)<=5, "Green", IF(ABS(F2)<=10, "Amber", "Red"))
```

### Application Health Sheet

**Auto Status based on Availability & Patch Compliance:**
```excel
=IF(AND(C2>=99, E2>=95), "Green", IF(OR(C2<96, E2<85), "Red", "Amber"))
```

### Workforce Metrics Sheet

**Column D (Variance %):**
```excel
=IF(B2=0, 0, ROUND((C2-B2)/B2*100, 1))
```

**Utilization % (Additional Column):**
```excel
=ROUND((C2/B2)*100, 0)
```

**Utilization Status:**
```excel
=IF(AND(F2>=90, F2<=105), "Green", IF(OR(F2<80, F2>110), "Red", "Amber"))
```

### Delivery Performance Sheet

**Project Health Status (Additional Column):**
```excel
=IF(AND(B2>=85, D2<=70, E2<=75), "Green", IF(OR(B2<70, D2>90, E2>90), "Red", "Amber"))
```

### Technology Projects Sheet

**Budget Variance (Additional Column):**
```excel
=IF(C2=0, 0, ROUND((D2-C2)/C2*100, 1))
```

**Budget Health:**
```excel
=IF(ABS(G2)<=10, "Green", IF(ABS(G2)<=20, "Amber", "Red"))
```

### Spend Categories Sheet

**Column C (% of Total) - Auto Calculate:**
```excel
=ROUND(B2/SUM($B$2:$B$5)*100, 0)
```

### Monthly Spend Trend Sheet

**Variance Column (Additional):**
```excel
=C2-B2
```

**Variance % (Additional):**
```excel
=IF(B2=0, 0, ROUND((C2-B2)/B2*100, 1))
```

---

## Conditional Formatting Rules

### Setup for Status Columns

1. **Select the Status column range** (e.g., G2:G100)

2. **Home Tab → Conditional Formatting → New Rule**

3. **Create three rules:**

#### Rule 1: Green Status
- Format only cells that contain
- Cell Value = "Green"
- Format: Fill - Light Green (RGB: 220, 252, 231), Font - Dark Green (RGB: 16, 185, 129)

#### Rule 2: Amber Status
- Format only cells that contain
- Cell Value = "Amber"
- Format: Fill - Light Yellow (RGB: 254, 243, 199), Font - Dark Orange (RGB: 245, 158, 11)

#### Rule 3: Red Status
- Format only cells that contain
- Cell Value = "Red"
- Format: Fill - Light Red (RGB: 254, 226, 226), Font - Dark Red (RGB: 239, 68, 68)

### Setup for Percentage Columns

#### Variance % Columns
1. Select variance % column
2. Conditional Formatting → Color Scales
3. Set 3-Color Scale:
   - Minimum: Green (positive variance)
   - Midpoint: Yellow (near zero)
   - Maximum: Red (negative variance)

#### Availability % (Application Health)
1. Select availability column
2. Conditional Formatting → Data Bars
3. Choose green gradient bars

---

## Data Validation Setup

### Status Columns

1. **Select Status column cells** (e.g., G2:G100)
2. **Data Tab → Data Validation**
3. **Settings:**
   - Allow: List
   - Source: `Green,Amber,Red`
4. **Input Message:**
   - Title: Status Selection
   - Message: Choose Green (healthy), Amber (warning), or Red (critical)
5. **Error Alert:**
   - Style: Stop
   - Title: Invalid Status
   - Message: Please select Green, Amber, or Red

### Budget Type Column (Portfolio Programs)

1. **Select Budget Type column** (B2:B100)
2. **Data Validation settings:**
   - Allow: List
   - Source: `Capital,O&M`

### Domain Column (Application Health, Technology Projects)

1. **Select Domain column**
2. **Data Validation settings:**
   - Allow: List
   - Source: `Ops Tech,Customer Tech,IT Services,IT Shared,Security`

### Severity Column (Active Incidents)

1. **Select Severity column**
2. **Data Validation settings:**
   - Allow: List
   - Source: `High,Medium,Low`

### Incident Status Column

1. **Select Incident Status column**
2. **Data Validation settings:**
   - Allow: List
   - Source: `Open,In Progress,Resolved`

---

## Excel VBA Macro (Optional)

For advanced users - Macro to export all sheets as CSV:

```vba
Sub ExportAllSheetsAsCSV()
    Dim ws As Worksheet
    Dim csvPath As String
    
    ' Set the export folder path
    csvPath = ThisWorkbook.Path & "\data\"
    
    ' Create data folder if it doesn't exist
    If Dir(csvPath, vbDirectory) = "" Then
        MkDir csvPath
    End If
    
    ' Loop through each worksheet
    For Each ws In ThisWorkbook.Worksheets
        ' Skip summary sheets or hidden sheets
        If ws.Visible = xlSheetVisible And ws.Name <> "Summary_KPIs" Then
            ' Create filename from sheet name
            Dim fileName As String
            fileName = Replace(ws.Name, " ", "_")
            fileName = LCase(fileName) & ".csv"
            
            ' Copy worksheet to new workbook
            ws.Copy
            
            ' Save as CSV
            ActiveWorkbook.SaveAs fileName:=csvPath & fileName, _
                FileFormat:=xlCSV, _
                CreateBackup:=False
            
            ' Close the temporary workbook
            ActiveWorkbook.Close SaveChanges:=False
        End If
    Next ws
    
    MsgBox "All sheets exported as CSV files to: " & csvPath, vbInformation
End Sub
```

**To use this macro:**
1. Press Alt+F11 to open VBA editor
2. Insert → Module
3. Paste the code above
4. Close VBA editor
5. Run macro: Alt+F8 → Select "ExportAllSheetsAsCSV" → Run

---

## Summary Dashboard Formulas

Add a "Summary_KPIs" sheet with these formulas:

### Count Programs by Status
```excel
=COUNTIF(Portfolio_Programs!G:G, "Green")
```

### Average Availability
```excel
=AVERAGE(Application_Health!C:C)
```

### Total Open Positions
```excel
=SUM(Workforce_Metrics!E:E)
```

### Active Incidents Count
```excel
=COUNTA(Active_Incidents!A:A)-1
```

### Capital vs O&M Budget
```excel
=SUMIF(Portfolio_Programs!B:B, "Capital", Portfolio_Programs!C:C)
```

### Total IT Spend YTD
```excel
=SUM(Spend_Categories!B:B)
```

---

## Chart Recommendations in Excel

### 1. Portfolio Programs
- **Chart Type:** Clustered Column
- **Data:** Annual Budget vs YTD Actual
- **Colors:** Blue for budget, Green for actual

### 2. Application Health
- **Chart Type:** Horizontal Bar
- **Data:** Availability % by Application
- **Color Gradient:** Red (low) to Green (high)

### 3. Monthly Spend Trend
- **Chart Type:** Line Chart with Markers
- **Data:** Planned vs Actual by Month
- **Two Lines:** Blue (Planned), Green (Actual)

### 4. Spend Categories
- **Chart Type:** Pie or Donut Chart
- **Data:** Spend by Category
- **Show:** Percentages on labels

### 5. Skills Distribution
- **Chart Type:** Horizontal Bar
- **Data:** Count by Skill
- **Sort:** Descending order

---

## Tips for Excel Power Users

1. **Named Ranges:** Create named ranges for easier formula references
   - Portfolio_Programs!G:G → Name: "Program_Status"
   - Use in formulas: `=COUNTIF(Program_Status, "Green")`

2. **Pivot Tables:** Create pivot tables for dynamic analysis
   - Insert → PivotTable
   - Useful for grouping by Domain, Status, Budget Type

3. **Slicers:** Add slicers for interactive filtering
   - Works great with pivot tables
   - PivotTable Tools → Insert Slicer

4. **Sparklines:** Add mini-charts in cells
   - Insert → Sparklines
   - Great for Monthly Spend Trend visualization

5. **Protected Sheets:** Lock formula cells
   - Review → Protect Sheet
   - Allow users to edit data cells only

6. **Drop-down Lists:** Use Data Validation for consistent entry
   - Prevents typos in Status, Domain, Severity fields

7. **Comments & Notes:** Document assumptions
   - Right-click cell → New Comment
   - Useful for explaining calculations
