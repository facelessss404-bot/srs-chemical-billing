# S.B.R. CHEMICALS & OILS — GST BILLING SUITE
## Complete User Guide & Technical Handover Document
**Client 8 — Production Release v1.0.0**
**Author:** IdeasEternal Technologies  
**Company:** S.B.R. CHEMICALS & OILS, Saravanampatti, Coimbatore - 641035  
**GSTIN:** 33BWXPS5830B1Z2  

---

## 1. Executive Summary

The **S.B.R. CHEMICALS & OILS GST Billing Suite** is an enterprise-grade, cloud-enabled invoicing, party directory, and inventory operations system tailored specifically for industrial chemical and lubricant oil distribution.

The solution replaces legacy software with a high-performance, real-time web application featuring:
1. **100% 1-to-1 fidelity** with all physical and digital invoice layouts provided by the client.
2. **Cloud Database Architecture** powered by **Supabase PostgreSQL** for multi-counter, multi-device cloud synchronization.
3. **Resilient Offline Fallback** utilizing local transactional storage so billing never stops even if internet connectivity drops in the plant.
4. **Automated Indian GST & Currency Engine** featuring automatic CGST/SGST/IGST split, round-off calculation, and Indian English amount in words generation.
5. **Exact A4 Tax Invoice Printing Engine** configured for direct 1-page paper billing and PDF generation.

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER / COUNTER BROWSER                          │
│                                                                        │
│   [React 19 + TypeScript + Vite]                                       │
│   ├── Login & Role Access (Admin / Counter Staff)                      │
│   ├── Invoicing Workstation (Manual Qty Input + Dynamic Tax)           │
│   ├── Master Party (Screenshot 1 Replication)                          │
│   ├── Item Master (Screenshot 2 Replication - Default 'Ltrs' UOM)      │
│   ├── Invoices Register & Archive (Export to CSV / Excel)              │
│   └── Tax Invoice A4 Print Engine (Screenshot 4 Exact Match)           │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (Direct Cloud Mode)             ▼ (Local / On-Premise Mode)
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        SUPABASE CLOUD POSTGRES       │  │    NODE.JS EXPRESS SERVER    │
│  - Real-time cloud sync              │  │  - Port 5000 (WAL Mode DB)   │
│  - Multi-counter concurrence         │  │  - Standalone SQLite engine  │
│  - Global access from URL link       │  │  - Full JSON backup export   │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Vite 6, Lucide Icons, jsPDF & AutoTable.
- **Styling:** Custom High-Fidelity CSS Design System with Red Brand accents, responsive cards, subtle micro-animations, and CSS `@media print` rules.
- **Cloud Database:** Supabase (PostgreSQL with Row Level Security, JSONB payloads, and atomic sequence counters).
- **Local Fallback Server:** Express 4.21, Node.js Native SQLite (`node:sqlite`) with zero external binary dependencies.

---

## 3. Module Walkthrough & Usage Instructions

### Module 1: Branded Authentication / Counter Login
- **URL:** Open `http://localhost:5000` (or your live deployed URL).
- **Roles:**
  - **Admin Access:** Full control over billing, party records, item catalog, and company settings.
  - **Billing Staff:** Quick counter invoicing mode.
- **Default PIN:** `1234` (or click **"Enter as Admin"** / **"Enter as Staff"** for 1-click instant access).
- **Cloud Status Badge:** The header displays a green **"Cloud Sync"** badge when connected to Supabase, or yellow **"Local Mode"** when operating offline.

---

### Module 2: Invoicing Workstation (`New Bill`)
*Matches Screenshot 3 ("Invoice")*

1. **Party Selection:**
   - Select customer from the **"Party Name"** dropdown.
   - The system automatically loads:
     - Billing Address & Shipping Address
     - Buyer's GSTIN
     - Contact Phone number
     - Auto-detects **GST Type**:
       - **Local (CGST 9% + SGST 9%)** for Tamil Nadu (State Code `33`).
       - **Interstate (IGST 18%)** for out-of-state parties.
2. **Item Line Entry:**
   - Select product (e.g. *Hydraulic 68*, *Cutting Oil*, *Acid*, *Step Bush*).
   - HSN Code, UOM (*Ltrs/Kgs*), and Rate/Unit are auto-populated from Item Master.
   - **Manual Quantity Entry:** Type the quantity in the highlighted orange box.
   - Line Taxable Value, CGST/SGST/IGST, and Line Total calculate instantaneously!
   - Press **"+ Add Item Line"** to add multiple products.
3. **Summary & Real-time Totals:**
   - **Sub Total (Taxable):** Sum of all item taxable values.
   - **Freight / Transport Charges:** Enter transport charges if applicable.
   - **CGST & SGST / IGST Breakdown:** Exact tax split calculated dynamically.
   - **Rounded Off:** Automatic round-off difference to the nearest whole Rupee (e.g., `-₹0.40`).
   - **NET TOTAL:** Final payable amount in prominent Indian Rupee format.
   - **Rupees in Words:** Automatically generated (e.g., *"One thousand One hundred and Eighty Rupees only"*).
4. **Actions:**
   - **"Save Invoice":** Commits invoice to the database.
   - **"Save & Print Bill":** Saves the invoice and immediately launches the print-ready invoice.
   - **"Preview Print":** Preview bill on screen before saving.

---

### Module 3: Master Party Directory
*Matches Screenshot 1 ("Master party")*

- **Header Band:** Classic red title bar `PARTIES AND DETAILS`.
- **Fields:**
  - `Party Name *` (Mandatory, e.g. *M/s Lakshmi Rekha Castings*, *PAULINE ENGINEERING*)
  - `Party Code` (e.g. *16*, *17*)
  - `Party Group *` (*Customers*, *Suppliers*, *Job Work Contractors*)
  - `Address` (Multiline street and post address)
  - `City/Town` (e.g. *Coimbatore (Tamil Nadu)*)
  - `Postal Code` (e.g. *641035*)
  - `Phone Number(s)` & `E-Mail Address(es)`
  - `Contact Person(s)`: Up to 3 designated contact persons with individual phone numbers.
  - `GSTIN` (15-character GSTIN)
  - `InterState GST` checkbox (Automatically flagged if GSTIN is outside Tamil Nadu).
- **Navigation Toolbar:**
  - `+ New`: Clear form to enter a new party.
  - `✎ Alter`: Edit the currently active party.
  - `✕ Delete`: Remove party record with confirmation.
  - `◀ Prev` / `▶ Next`: Browse through customer records sequentially.
  - `🔍 Find` / `📋 List`: Open full searchable directory modal to select any party in 1 click.
  - `💾 Save` / `⟲ Cancel`: Save changes or cancel edits.

---

### Module 4: Item Master Directory
*Matches Screenshot 2 ("Item master")*

- **Special Customization for Client 8:** Default Unit of Measurement (`UOM`) is pre-configured to **`Ltrs` (Liters)** for chemicals, acid, and lubricant oils, with options for *Kgs*, *Can (5L)*, *Can (20L)*, *Barrel (200L)*, *Nos*, and *Pcs*.
- **Fields:**
  - `Item Name *` (e.g. *Hydraulic 68*, *Cutting Oil Extra*, *Acid 33%*, *Step Bush*)
  - `Item Code` (e.g. *2710*, *057*)
  - `UOM` (*Ltrs* default)
  - `Selling Price` (Price per unit excluding GST)
  - `GST Applicable` (Checkbox toggle)
  - `GST Name` (*GST 18%*, *GST 12%*, *GST 5%*, *GST 28%*, *GST 0%*)
  - `HSN/SAC Code` (e.g. *2710* for oils, *2807* for acids, *998818* for jobwork)
- **Navigation Toolbar:** Full `New`, `Alter`, `Delete`, `Prev`, `Next`, `Find`, `List`, `Save`, `Cancel` controls identical to Master Party.

---

### Module 5: Invoices Register & Archive
- **Turnover Analytics:** Top metrics cards showing Total Sales Turnover, Total GST Collected, and Total Bills Issued.
- **Search & Filters:** Instant search across Invoice Number, Party Name, GSTIN, or Date. Filter by *Local* vs *Interstate*.
- **Export to CSV:** Click **"Export CSV"** to generate an Excel-compatible spreadsheet of all invoices.
- **Actions per Row:**
  - 🖨️ **Print:** Launch 1-click A4 print view.
  - ✎ **Edit:** Load invoice back into billing workstation.
  - 🗑️ **Delete:** Remove invoice from records.

---

### Module 6: Tax Invoice Printing & PDF Generation
*Matches Screenshot 4 ("Billing print")*

- **Company Header:**
  - **S.B.R. CHEMICALS & OILS**
  - Wholesale and Retail Supplier for all types of Industrial Chemicals & Automobile Lubricants Oils
  - Address: No.210 D, Opp. Lisieux College, Sathy Main Road, Saravanampatti, Coimbatore - 641035
  - Mobile: 9355151444, 8003342429 | E-Mail: sbrchemicals@gmail.com
  - GSTIN: 33BWXPS5830B1Z2
- **Invoice Box:**
  - Copy status: Switch between **"Original for Recipient"**, **"Duplicate for Transporter"**, or **"Triplicate Copy"** with 1 click.
  - Invoice No & Date.
- **Buyer Section ("To,"):**
  - Customer name, full address, mobile number, and Buyer GSTIN.
- **Goods Table:**
  - `S.No.` | `Description of Goods` | `HSN Code` | `Qty` | `Rate/Unit (Rs.)` | `Taxable Value (Rs.)`
  - Formatted with blank filler rows matching standard paper stationery height.
- **Tax & Bank Details:**
  - Rupees in words.
  - Grand Total, SGST, CGST (or IGST), Round off, and Net Total.
  - **Our Bank Details:**
    - Bank Name: Canara Bank
    - A/c No: 6038281090014
    - IFSC Code: CNRB0006038
    - Branch: Saravanampatti
- **Signatures:** Receiver Signature & Authorized Signatory for S.B.R. Chemicals & Oils.
- **Print Controls:**
  - **"Print Bill (Ctrl+P)":** Launches native browser print dialog configured for clean single-page A4 output.
  - **"Download PDF":** Generates an offline vector PDF document using jsPDF.

---

## 4. How to Connect Supabase Cloud Database

To store all your data directly in the cloud:

1. **Step 1:** Go to [https://supabase.com](https://supabase.com) and create or open your free project.
2. **Step 2:** Open **SQL Editor** in the Supabase Dashboard, click **New Query**, paste the contents of `supabase_schema.sql` (found in project root), and click **Run**.
3. **Step 3:** Go to **Project Settings -> API**:
   - Copy your **Project URL** (e.g. `https://xyzabc.supabase.co`).
   - Copy your **Project API Anon / Public Key** (starts with `eyJhbGciOi...`).
4. **Step 4:** In the application:
   - Click the ⚙️ **Settings** icon on the top right.
   - Switch to the **"Supabase Cloud DB"** tab.
   - Paste your **URL** and **Anon Key**, then click **"Test Connection"**.
   - Click **"Save Credentials"**.
5. Once saved, the status badge turns green (**"Cloud Sync"**). All invoices, parties, and items are now saved directly to your Supabase Cloud PostgreSQL database!

---

## 5. How to Deploy to Cloud (Free Public URL)

To give the client a live link accessible from any browser:

### Option A: Deploy on Vercel (Recommended - 2 Minutes)
1. Push this repository to GitHub.
2. Go to [https://vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = (your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (your Supabase Anon Key)
4. Click **Deploy**. Vercel will build the app and give you a live link (e.g., `https://sbr-chemicals-billing.vercel.app`).

### Option B: Run on Local Shop / Factory Computer
- Double-click `start-billing-suite.bat`. It starts the server and opens `http://localhost:5000` automatically in your browser!

---

## 6. Verification & Quality Checklist

| Test Case | Expected Result | Status |
|-----------|-----------------|:------:|
| Login Screen | Branded login with Admin & Staff access | ✅ PASSED |
| Party Master | CRUD operations, GSTIN validation, Interstate flag | ✅ PASSED |
| Item Master | Default UOM = Ltrs, Selling price, HSN, Tax rates | ✅ PASSED |
| Billing Screen | Auto-fill customer info, manual Qty, dynamic tax | ✅ PASSED |
| Invoice #75 | Exact match with physical invoice (Rs. 1,180.00) | ✅ PASSED |
| Print Engine | Exact A4 paper reproduction matching Screenshot 4 | ✅ PASSED |
| PDF Download | Clean vector PDF generation via jsPDF | ✅ PASSED |
| CSV Export | Excel-compatible CSV export of all invoices | ✅ PASSED |
| Cloud Database | Supabase integration layer ready with schema script | ✅ PASSED |
| Local Resilience | High-speed SQLite fallback when offline | ✅ PASSED |

---
*IdeasEternal Technologies — Software Handover Complete*
