# S.B.R. CHEMICALS & OILS — GST BILLING SUITE
# Client User Guide & Software Handover

**Client:** S.B.R. CHEMICALS & OILS  
**Address:** Saravanampatti, Coimbatore - 641035, Tamil Nadu  
**GSTIN:** `33BWXPS5830B1Z2`  
**Live Cloud Application URL:** [https://srs-chemical-billing.netlify.app/](https://srs-chemical-billing.netlify.app/)  

---

## 1. Quick Access & Login Credentials

Open the link in any web browser on your computer, laptop, tablet, or mobile phone:  
👉 **[https://srs-chemical-billing.netlify.app/](https://srs-chemical-billing.netlify.app/)**

| Portal / Role | Username | Password / PIN | Permitted Operations |
| :--- | :--- | :--- | :--- |
| **🛡️ Admin Portal** | `admin` | `admin@9842` | **Full Access**: Company profile, Canara Bank details, Item prices, Party directory, creating & deleting bills, cloud settings. |
| **🧾 Billing Staff** | `staff` | `1234` | **Counter Billing**: Fast bill creation, party lookup, item selection, and 1-click A4 invoice printing. (Sensitive settings locked). |

> **Note:** Passwords can be changed anytime by the Admin under the **⚙️ Settings** menu.

---

## 2. Key Features Overview

1. **⚡ Fast 30-Second Invoicing:**
   - Select customer name &rarr; all addresses and GSTIN auto-fill.
   - Select product &rarr; HSN code, Unit (Ltrs), and standard price auto-fill.
   - Staff **only enters the Quantity** &rarr; Taxable value, CGST, SGST, IGST, Round-off, and Net Total calculate automatically in real time.
2. **🛢️ Chemical & Lubricant Oil Specialization:**
   - Default Unit of Measurement (UOM) is pre-configured to **`Ltrs` (Liters)** for industrial chemicals, acid, and oils (with options for *Kgs*, *Can*, *Barrel*, *Nos*).
3. **📄 Exact A4 Tax Invoice Printing:**
   - 100% formatted to match your official physical billing paper.
   - Includes company header, buyer details, item breakdown, Canara Bank details, and signature zones.
   - 1-click toggle between **Original for Recipient**, **Duplicate for Transporter**, or **Triplicate Copy**.
   - Download offline vector PDF with 1 click.
4. **☁️ Supabase Cloud Synchronization:**
   - All bills, parties, and products are stored securely on the cloud.
   - Works across multiple computers, tablets, or phones simultaneously with instant sync.
5. **📱 Works on All Devices:**
   - Fully optimized for desktop PCs, laptops, iPad/tablets, and mobile phones.
6. **📊 Turnovers & Sales Register:**
   - Instant search across all past invoices with 1-click reprint and Excel (CSV) export.

---

## 3. Step-by-Step Usage Guide

### Step 1: Adding a Customer (Master Party)
1. Click the **"👥 Master Party"** tab from the top menu.
2. Click **"+ New"** on the bottom toolbar.
3. Enter the customer details:
   - **Party Name:** (e.g. *M/s Lakshmi Rekha Castings* or *Pauline Engineering*)
   - **Address & City:** (e.g. *110-B Maruthakounder St, Coimbatore - 641029*)
   - **Phone & Contact Person:** Contact numbers for delivery.
   - **GSTIN:** Enter the 15-digit GSTIN (e.g. `33AADFL1407B1Z6`).
     - If the party is from Tamil Nadu (`33`), local GST (CGST 9% + SGST 9%) is applied automatically.
     - If outside Tamil Nadu, the system automatically checks **Interstate GST** (IGST 18%).
4. Click **"💾 Save"**.

---

### Step 2: Adding Products / Chemicals (Item Master)
1. Click the **"📦 Item Master"** tab from the top menu.
2. Click **"+ New"** on the bottom toolbar.
3. Enter product information:
   - **Item Name:** (e.g. *Hydraulic 68*, *Cutting Oil Extra*, *Acid 33%*)
   - **UOM:** Defaults to **`Ltrs`** for chemical/oil liquids.
   - **Selling Price:** Enter base price per unit (e.g. `100.00`).
   - **GST Rate:** Select `GST 18%` (or 12%, 5%, 28%).
   - **HSN/SAC Code:** (e.g. `2710` for oils, `2807` for acids).
4. Click **"💾 Save"**.

---

### Step 3: Creating a GST Invoice (New Bill)
1. Click the **"➕ New Bill"** tab from the top menu.
2. **Invoice Details:**
   - Invoice number and today's date are filled automatically.
   - (Optional) Enter Vehicle Number (e.g. `TN 38 BX 4492`) or Order Reference.
3. **Select Party:**
   - Choose the customer from the **"Party Name"** dropdown.
   - Billing address, shipping address, GSTIN, and tax mode (Local vs Interstate) auto-fill instantly.
4. **Add Items:**
   - Click the product dropdown in the item line and choose your item.
   - HSN Code, UOM, and Rate will auto-fill.
   - **Type the Quantity** (e.g. `10`).
   - The line total and tax calculate automatically.
   - To add more items, click **"+ Add Item Line"**.
5. **Review Totals:**
   - The system automatically calculates:
     - Sub Total (Taxable)
     - CGST 9% + SGST 9% (or IGST 18%)
     - Round-off (adjusts to exact Rupee)
     - Amount in Words (e.g. *"One Thousand One Hundred and Eighty Rupees only"*)
6. Click **"Save & Print Bill"** to save to the cloud and open the printable bill.

---

### Step 4: Printing & Downloading the A4 Invoice
1. Once on the print preview screen, you will see your bill formatted with:
   - S.B.R. Chemicals & Oils header & Saravanampatti address.
   - Canara Bank payment details:
     - **Bank:** Canara Bank
     - **A/c No:** `6038281090014`
     - **IFSC:** `CNRB0006038`
     - **Branch:** Saravanampatti
2. Select the copy you need:
   - `[Original for Recipient]`
   - `[Duplicate for Transporter]`
   - `[Triplicate Copy]`
3. Click **"🖨️ Print Bill (Ctrl+P)"** for direct printer output on A4 paper, or click **"📥 Download PDF"** to save a PDF file on your computer/phone.

---

### Step 5: Viewing Past Bills & Exporting to Excel
1. Click the **"📄 Invoices Register"** tab.
2. View lifetime turnover, total GST collected, and all sequential bills.
3. Search by customer name, bill number, or GSTIN.
4. Click **"Export CSV"** to download an Excel sheet of all sales for your auditor/accountant.
5. Click **"Print"** on any past bill to re-print or re-download the PDF anytime.

---

## 4. Company & Bank Details Configured

These details are pre-configured into the system and will appear on all printed invoices:

| Detail | Configured Information |
| :--- | :--- |
| **Company Name** | S.B.R. CHEMICALS & OILS |
| **Tagline / Nature** | Wholesale and Retail Supplier for all types of Industrial Chemicals & Automobile Lubricants Oils |
| **Address** | No.210 D, Opp. Lisieux College, Sathy Main Road, Saravanampatti, Coimbatore - 641035 |
| **Phone(s)** | 9355151444, 8003342429 |
| **E-Mail** | sbrchemicals@gmail.com |
| **GSTIN** | 33BWXPS5830B1Z2 |
| **Bank Name** | Canara Bank |
| **Account No** | 6038281090014 |
| **IFSC Code** | CNRB0006038 |
| **Branch** | Saravanampatti, Coimbatore |

*(To update phone numbers, address, or bank details in the future, log in as Admin and open the ⚙️ Settings dialog).*

---

## 5. Support & Handover Sign-off

- **Application Type:** Production Cloud ERP & GST Invoicing Suite
- **Deployment Platform:** Netlify Cloud + Supabase Cloud PostgreSQL
- **Live URL:** [https://srs-chemical-billing.netlify.app/](https://srs-chemical-billing.netlify.app/)
- **Handover Date:** October 2026
- **Status:** **Ready for Live Daily Operations**
