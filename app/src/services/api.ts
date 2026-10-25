import { Party, Item, Invoice, CompanyProfile } from '../types';
import { getSupabaseClient } from './supabase';

// Local storage fallback keys
const LS_PARTIES = 'sbr_parties';
const LS_ITEMS = 'sbr_items';
const LS_INVOICES = 'sbr_invoices';
const LS_SETTINGS = 'sbr_settings';
const LS_SEQUENCE = 'sbr_sequence';

const DEFAULT_COMPANY: CompanyProfile = {
  company_name: 'S.B.R. CHEMICALS & OILS',
  tagline: 'Wholesale and Retail Supplier for all types of Industrial Chemicals & Automobile Lubricants Oils',
  address: 'No.210 D, Opp. Lisieux College, Sathy Main Road, Saravanampatti',
  city_town: 'Coimbatore',
  postal_code: '641035',
  state: 'Tamil Nadu',
  state_code: '33',
  phones: '9355151444, 8003342429',
  email: 'sbrchemicals@gmail.com',
  gstin: '33BWXPS5830B1Z2',
  bank_name: 'Canara Bank',
  account_no: '6038281090014',
  ifsc_code: 'CNRB0006038',
  branch: 'Saravanampatti',
  invoice_prefix: '',
  starting_invoice_no: 75,
  terms: '1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. Subject to Coimbatore Jurisdiction.'
};

const DEFAULT_PARTIES: Party[] = [];

const DEFAULT_ITEMS: Item[] = [];

const DEFAULT_INVOICES: Invoice[] = [];

// In-memory / local storage helpers
function loadLS<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function saveLS<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

// ==========================================
// UNIFIED API METHODS
// ==========================================

export const api = {
  // Parties
  async getParties(): Promise<Party[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('parties').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          saveLS(LS_PARTIES, data);
          return data as Party[];
        }
      } catch (err) {
        console.warn('Supabase fetch parties error, trying server/local:', err);
      }
    }

    try {
      const res = await fetch('/api/parties');
      if (res.ok) {
        const list = await res.json();
        saveLS(LS_PARTIES, list);
        return list;
      }
    } catch (e) {
      // offline / server not running
    }

    return loadLS<Party[]>(LS_PARTIES, DEFAULT_PARTIES);
  },

  async saveParty(party: Partial<Party>): Promise<Party> {
    const p: Party = {
      id: party.id || 'party_' + Date.now(),
      party_name: party.party_name || '',
      party_code: party.party_code || '',
      party_group: party.party_group || 'Customers',
      address: party.address || '',
      city_town: party.city_town || '',
      postal_code: party.postal_code || '',
      phone: party.phone || '',
      contact_person_1: party.contact_person_1 || '',
      contact_no_1: party.contact_no_1 || '',
      contact_person_2: party.contact_person_2 || '',
      contact_no_2: party.contact_no_2 || '',
      contact_person_3: party.contact_person_3 || '',
      contact_no_3: party.contact_no_3 || '',
      email: party.email || '',
      gstin: party.gstin || '',
      is_interstate: Boolean(party.is_interstate),
      created_at: party.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('parties').upsert(p);
        if (error) console.error('Supabase party upsert error:', error);
      } catch (err) {
        console.warn('Supabase party save failed:', err);
      }
    }

    try {
      await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
    } catch (e) {
      // ignore
    }

    // Local Storage backup
    const list = loadLS<Party[]>(LS_PARTIES, DEFAULT_PARTIES);
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.unshift(p);
    saveLS(LS_PARTIES, list);

    return p;
  },

  async deleteParty(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('parties').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete party failed:', e);
      }
    }

    try {
      await fetch(`/api/parties/${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }

    const list = loadLS<Party[]>(LS_PARTIES, DEFAULT_PARTIES).filter(x => x.id !== id);
    saveLS(LS_PARTIES, list);
  },

  // Items
  async getItems(): Promise<Item[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          saveLS(LS_ITEMS, data);
          return data as Item[];
        }
      } catch (e) {
        console.warn('Supabase getItems error:', e);
      }
    }

    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const list = await res.json();
        saveLS(LS_ITEMS, list);
        return list;
      }
    } catch (e) {
      // ignore
    }

    return loadLS<Item[]>(LS_ITEMS, DEFAULT_ITEMS);
  },

  async saveItem(item: Partial<Item>): Promise<Item> {
    const i: Item = {
      id: item.id || 'item_' + Date.now(),
      item_name: item.item_name || '',
      item_code: item.item_code || '',
      uom: item.uom || 'Nos',
      selling_price: Number(item.selling_price) || 0,
      gst_applicable: item.gst_applicable !== false,
      gst_name: item.gst_name || 'GST 18%',
      gst_rate: Number(item.gst_rate) || 18,
      hsn_sac_code: item.hsn_sac_code || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('items').upsert(i);
        if (error) console.error('Supabase item upsert error:', error);
      } catch (e) {
        console.warn('Supabase save item error:', e);
      }
    }

    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(i)
      });
    } catch (e) {}

    const list = loadLS<Item[]>(LS_ITEMS, DEFAULT_ITEMS);
    const idx = list.findIndex(x => x.id === i.id);
    if (idx >= 0) list[idx] = i;
    else list.unshift(i);
    saveLS(LS_ITEMS, list);

    return i;
  },

  async deleteItem(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('items').delete().eq('id', id);
      } catch (e) {}
    }

    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
    } catch (e) {}

    const list = loadLS<Item[]>(LS_ITEMS, DEFAULT_ITEMS).filter(x => x.id !== id);
    saveLS(LS_ITEMS, list);
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          saveLS(LS_INVOICES, data);
          return data as Invoice[];
        }
      } catch (e) {
        console.warn('Supabase getInvoices error:', e);
      }
    }

    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const list = await res.json();
        saveLS(LS_INVOICES, list);
        return list;
      }
    } catch (e) {}

    return loadLS<Invoice[]>(LS_INVOICES, DEFAULT_INVOICES);
  },

  async saveInvoice(inv: Partial<Invoice>): Promise<Invoice> {
    const record: Invoice = {
      id: inv.id || 'inv_' + Date.now(),
      invoice_no: String(inv.invoice_no || ''),
      invoice_date: inv.invoice_date || new Date().toISOString().split('T')[0],
      party_id: inv.party_id || '',
      party_name: inv.party_name || '',
      billing_address: inv.billing_address || '',
      shipping_address: inv.shipping_address || '',
      party_gstin: inv.party_gstin || '',
      party_phone: inv.party_phone || '',
      gst_type: inv.gst_type || 'Local',
      order_no_date: inv.order_no_date || '',
      vehicle_no: inv.vehicle_no || '',
      lr_rr_no: inv.lr_rr_no || '',
      payment_terms: inv.payment_terms || 'Cash/Credit Bill',
      destination: inv.destination || '',
      notes: inv.notes || '',
      items: inv.items || [],
      total_entries: inv.items?.length || 0,
      sub_total: Number(inv.sub_total) || 0,
      grand_total: Number(inv.grand_total || inv.sub_total) || 0,
      freight_charges: Number(inv.freight_charges) || 0,
      cgst_total: Number(inv.cgst_total) || 0,
      sgst_total: Number(inv.sgst_total) || 0,
      igst_total: Number(inv.igst_total) || 0,
      round_off: Number(inv.round_off) || 0,
      net_total: Number(inv.net_total) || 0,
      amount_in_words: inv.amount_in_words || '',
      status: inv.status || 'Paid',
      created_at: inv.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('invoices').upsert(record);
        if (error) console.error('Supabase invoice upsert error:', error);
      } catch (e) {
        console.warn('Supabase invoice save error:', e);
      }
    }

    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {}

    const list = loadLS<Invoice[]>(LS_INVOICES, DEFAULT_INVOICES);
    const idx = list.findIndex(x => x.id === record.id || x.invoice_no === record.invoice_no);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);
    saveLS(LS_INVOICES, list);

    return record;
  },

  async deleteInvoice(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('invoices').delete().eq('id', id);
      } catch (e) {}
    }

    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    } catch (e) {}

    const list = loadLS<Invoice[]>(LS_INVOICES, DEFAULT_INVOICES).filter(x => x.id !== id);
    saveLS(LS_INVOICES, list);
  },

  // Sequence Generation
  async getNextInvoiceNumber(): Promise<string> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('sequences').select('current_value').eq('name', 'invoice_no').single();
        if (!error && data) {
          const nextVal = Number(data.current_value) + 1;
          await supabase.from('sequences').update({ current_value: nextVal }).eq('name', 'invoice_no');
          return String(nextVal);
        }
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/sequence/invoice_no?start=75');
      if (res.ok) {
        const data = await res.json();
        return String(data.sequence);
      }
    } catch (e) {}

    const current = Number(localStorage.getItem(LS_SEQUENCE) || '75');
    const nextVal = current + 1;
    localStorage.setItem(LS_SEQUENCE, String(nextVal));
    return String(nextVal);
  },

  // Company Profile Settings
  async getCompanyProfile(): Promise<CompanyProfile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'company_profile').single();
        if (!error && data?.value) {
          saveLS(LS_SETTINGS, data.value);
          return data.value as CompanyProfile;
        }
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const all = await res.json();
        if (all.company_profile) {
          saveLS(LS_SETTINGS, all.company_profile);
          return all.company_profile;
        }
      }
    } catch (e) {}

    return loadLS<CompanyProfile>(LS_SETTINGS, DEFAULT_COMPANY);
  },

  async saveCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('settings').upsert({
          key: 'company_profile',
          value: profile,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    try {
      await fetch('/api/settings/company_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (e) {}

    saveLS(LS_SETTINGS, profile);
    return profile;
  }
};
