import React, { useState, useEffect } from 'react';
import { Party, Item, Invoice, CompanyProfile, UserSession } from './types';
import { api } from './services/api';
import { getStoredSupabaseConfig } from './services/supabase';
import { Navbar } from './components/Navbar';
import { BillingScreen } from './components/BillingScreen';
import { BillingPrint } from './components/BillingPrint';
import { MasterParty } from './components/MasterParty';
import { ItemMaster } from './components/ItemMaster';
import { InvoiceList } from './components/InvoiceList';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';

export const App: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('sbr_user_session');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  const [currentTab, setCurrentTab] = useState<'billing' | 'invoices' | 'parties' | 'items'>('billing');
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
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
  });

  const [nextInvoiceNo, setNextInvoiceNo] = useState<string>('76');
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check Supabase status
  const supabaseConfig = getStoredSupabaseConfig();
  const supabaseConnected = supabaseConfig.is_connected;

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedParties, fetchedItems, fetchedInvoices, fetchedCompany] = await Promise.all([
        api.getParties(),
        api.getItems(),
        api.getInvoices(),
        api.getCompanyProfile()
      ]);

      setParties(fetchedParties);
      setItems(fetchedItems);
      setInvoices(fetchedInvoices);
      setCompanyProfile(fetchedCompany);

      // Compute next invoice number
      if (fetchedInvoices.length > 0) {
        const maxNo = Math.max(...fetchedInvoices.map(i => Number(i.invoice_no) || 0));
        setNextInvoiceNo(String(maxNo + 1));
      } else {
        setNextInvoiceNo(String(fetchedCompany.starting_invoice_no || 75));
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('sbr_user_session', JSON.stringify(session));
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('sbr_user_session');
  };

  const handleSaveParty = async (party: Partial<Party>) => {
    const saved = await api.saveParty(party);
    await loadData();
    return saved;
  };

  const handleDeleteParty = async (id: string) => {
    await api.deleteParty(id);
    await loadData();
  };

  const handleSaveItem = async (item: Partial<Item>) => {
    const saved = await api.saveItem(item);
    await loadData();
    return saved;
  };

  const handleDeleteItem = async (id: string) => {
    await api.deleteItem(id);
    await loadData();
  };

  const handleSaveInvoice = async (inv: Partial<Invoice>) => {
    const saved = await api.saveInvoice(inv);
    await loadData();
    return saved;
  };

  const handleDeleteInvoice = async (id: string) => {
    await api.deleteInvoice(id);
    await loadData();
  };

  const handleSaveCompany = async (updated: CompanyProfile) => {
    const saved = await api.saveCompanyProfile(updated);
    setCompanyProfile(saved);
  };

  // If user is not logged in, show Login Screen
  if (!userSession) {
    return (
      <LoginModal
        onLogin={handleLogin}
        supabaseConnected={supabaseConnected}
      />
    );
  }

  // If in print mode, show exact printed invoice view
  if (printingInvoice) {
    return (
      <BillingPrint
        invoice={printingInvoice}
        company={companyProfile}
        onBack={() => setPrintingInvoice(null)}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'billing') setEditingInvoice(null);
          setCurrentTab(tab);
        }}
        onOpenSettings={() => setShowSettings(true)}
        supabaseConnected={supabaseConnected}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.5rem' }}>
              Loading S.B.R. Chemicals & Oils Billing Suite...
            </div>
            <p style={{ fontSize: '0.85rem' }}>Synchronizing Master records & invoices...</p>
          </div>
        ) : (
          <>
            {currentTab === 'billing' && (
              <BillingScreen
                parties={parties}
                items={items}
                nextInvoiceNo={nextInvoiceNo}
                onSaveInvoice={handleSaveInvoice}
                onPrintInvoice={(inv) => setPrintingInvoice(inv)}
                initialInvoice={editingInvoice}
                onClearInitialInvoice={() => setEditingInvoice(null)}
              />
            )}

            {currentTab === 'invoices' && (
              <InvoiceList
                invoices={invoices}
                onSelectInvoice={(inv) => {
                  setEditingInvoice(inv);
                  setCurrentTab('billing');
                }}
                onPrintInvoice={(inv) => setPrintingInvoice(inv)}
                onDeleteInvoice={handleDeleteInvoice}
                onNewInvoice={() => {
                  setEditingInvoice(null);
                  setCurrentTab('billing');
                }}
              />
            )}

            {currentTab === 'parties' && (
              <MasterParty
                parties={parties}
                onSaveParty={handleSaveParty}
                onDeleteParty={handleDeleteParty}
              />
            )}

            {currentTab === 'items' && (
              <ItemMaster
                items={items}
                onSaveItem={handleSaveItem}
                onDeleteItem={handleDeleteItem}
              />
            )}
          </>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          company={companyProfile}
          onSaveCompany={handleSaveCompany}
          onClose={() => setShowSettings(false)}
          onRefreshData={loadData}
        />
      )}
    </div>
  );
};
