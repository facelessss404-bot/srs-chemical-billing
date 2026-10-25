-- =========================================================================
-- S.B.R. CHEMICALS & OILS - GST BILLING SUITE - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Parties Master
CREATE TABLE IF NOT EXISTS public.parties (
  id TEXT PRIMARY KEY,
  party_name TEXT NOT NULL,
  party_code TEXT,
  party_group TEXT DEFAULT 'Customers',
  address TEXT,
  city_town TEXT,
  postal_code TEXT,
  phone TEXT,
  contact_person_1 TEXT,
  contact_no_1 TEXT,
  contact_person_2 TEXT,
  contact_no_2 TEXT,
  contact_person_3 TEXT,
  contact_no_3 TEXT,
  email TEXT,
  gstin TEXT,
  is_interstate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Items Master
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT,
  uom TEXT DEFAULT 'Ltrs',
  selling_price NUMERIC(12,2) DEFAULT 0,
  gst_applicable BOOLEAN DEFAULT TRUE,
  gst_name TEXT DEFAULT 'GST 18%',
  gst_rate NUMERIC(5,2) DEFAULT 18,
  hsn_sac_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  party_id TEXT,
  party_name TEXT NOT NULL,
  billing_address TEXT,
  shipping_address TEXT,
  party_gstin TEXT,
  party_phone TEXT,
  gst_type TEXT DEFAULT 'Local',
  order_no_date TEXT,
  vehicle_no TEXT,
  lr_rr_no TEXT,
  payment_terms TEXT,
  destination TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_entries INTEGER DEFAULT 0,
  sub_total NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) DEFAULT 0,
  freight_charges NUMERIC(12,2) DEFAULT 0,
  cgst_total NUMERIC(12,2) DEFAULT 0,
  sgst_total NUMERIC(12,2) DEFAULT 0,
  igst_total NUMERIC(12,2) DEFAULT 0,
  round_off NUMERIC(8,2) DEFAULT 0,
  net_total NUMERIC(12,2) DEFAULT 0,
  amount_in_words TEXT,
  status TEXT DEFAULT 'Paid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sequences Table (Atomic Invoice Numbering)
CREATE TABLE IF NOT EXISTS public.sequences (
  name TEXT PRIMARY KEY,
  current_value BIGINT NOT NULL DEFAULT 75
);

-- 6. Enable RLS (and allow anonymous access for public web client)
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write parties" ON public.parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write items" ON public.items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write sequences" ON public.sequences FOR ALL USING (true) WITH CHECK (true);

-- 7. Seed Initial Data
INSERT INTO public.sequences (name, current_value)
VALUES ('invoice_no', 75)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.parties (id, party_name, party_code, party_group, address, city_town, postal_code, phone, email, gstin, is_interstate)
VALUES
  ('party_1', 'PAULINE ENGINEERING', '16', 'Customers', '110-B Maruthakounder Street\nG N MILLS Post', 'Coimbatore (Tamil Nadu)', '641029', '9842212345', 'pauline.engg@gmail.com', '33BWEPA1293H1Z0', FALSE),
  ('party_2', 'M/s Lakshmi Rekha Castings', '17', 'Customers', '30, Balaji Industrial Estate,\nKondayampalayam Road,\nKeeranatham, Coimbatore.', 'Coimbatore', '641035', '9064619902', 'lakshmirekha.castings@gmail.com', '33AADFL1407B1Z6', FALSE),
  ('party_3', 'SHANTHI ENGINEERING', '18', 'Customers', '28-B, Mookambikai Nagar, Somayampalayam', 'Coimbatore (Tamil Nadu)', '641041', '9443355667', 'shanthi.engg@gmail.com', '33AAAC0000A1Z5', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.items (id, item_name, item_code, uom, selling_price, gst_applicable, gst_name, gst_rate, hsn_sac_code)
VALUES
  ('item_1', 'step bush', '057', 'Kgs', 77.00, TRUE, 'GST 18%', 18, '998818'),
  ('item_2', 'Hydraulic 68', '2710', 'Ltrs', 200.00, TRUE, 'GST 18%', 18, '2710'),
  ('item_3', 'Cutting Oil Extra', '2711', 'Ltrs', 185.00, TRUE, 'GST 18%', 18, '2710'),
  ('item_4', 'Industrial Degreaser D-100', '3402', 'Kgs', 140.00, TRUE, 'GST 18%', 18, '3402'),
  ('item_5', 'Rust Preventive Oil RP-9', '2712', 'Ltrs', 220.00, TRUE, 'GST 18%', 18, '2710'),
  ('item_6', 'Electrocleaning Salt', '2833', 'Kgs', 95.00, TRUE, 'GST 18%', 18, '2833')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES ('company_profile', '{
  "company_name": "S.B.R. CHEMICALS & OILS",
  "tagline": "Wholesale and Retail Supplier for all types of Industrial Chemicals & Automobile Lubricants Oils",
  "address": "No.210 D, Opp. Lisieux College, Sathy Main Road, Saravanampatti",
  "city_town": "Coimbatore",
  "postal_code": "641035",
  "state": "Tamil Nadu",
  "state_code": "33",
  "phones": "9355151444, 8003342429",
  "email": "sbrchemicals@gmail.com",
  "gstin": "33BWXPS5830B1Z2",
  "bank_name": "Canara Bank",
  "account_no": "6038281090014",
  "ifsc_code": "CNRB0006038",
  "branch": "Saravanampatti",
  "invoice_prefix": "",
  "starting_invoice_no": 75,
  "terms": "1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. Subject to Coimbatore Jurisdiction."
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
