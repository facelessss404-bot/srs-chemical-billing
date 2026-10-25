export interface Party {
  id: string;
  party_name: string;
  party_code: string;
  party_group: 'Customers' | 'Suppliers' | string;
  address: string;
  city_town: string;
  postal_code: string;
  phone: string;
  contact_person_1?: string;
  contact_no_1?: string;
  contact_person_2?: string;
  contact_no_2?: string;
  contact_person_3?: string;
  contact_no_3?: string;
  email: string;
  gstin: string;
  is_interstate: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  id: string;
  item_name: string;
  item_code: string;
  uom: string;
  selling_price: number;
  gst_applicable: boolean;
  gst_name: string;
  gst_rate: number;
  hsn_sac_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  s_no: number;
  item_id?: string;
  item_name: string;
  description?: string;
  hsn_code: string;
  uom: string;
  qty: number;
  rate: number;
  discount_pct?: number;
  discount_amt?: number;
  taxable_value: number;
  gst_rate: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_value: number;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  invoice_date: string;
  party_id: string;
  party_name: string;
  billing_address: string;
  shipping_address: string;
  party_gstin: string;
  party_phone: string;
  gst_type: 'Local' | 'Interstate';
  order_no_date: string;
  vehicle_no: string;
  lr_rr_no: string;
  payment_terms: string;
  destination: string;
  notes: string;
  items: InvoiceItem[];
  total_entries: number;
  grand_total: number;
  sub_total: number;
  freight_charges: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  round_off: number;
  net_total: number;
  amount_in_words: string;
  status: 'Paid' | 'Unpaid' | 'Partial';
  created_at?: string;
  updated_at?: string;
}

export interface CompanyProfile {
  company_name: string;
  tagline: string;
  address: string;
  city_town: string;
  postal_code: string;
  state: string;
  state_code: string;
  phones: string;
  email: string;
  gstin: string;
  bank_name: string;
  account_no: string;
  ifsc_code: string;
  branch: string;
  invoice_prefix: string;
  starting_invoice_no: number;
  terms: string;
}

export interface SupabaseConfig {
  url: string;
  anon_key: string;
  is_connected: boolean;
}

export interface UserSession {
  is_authenticated: boolean;
  user_role: 'Admin' | 'Staff';
  username: string;
}
