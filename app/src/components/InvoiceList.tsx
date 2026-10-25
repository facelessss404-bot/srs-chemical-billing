import React, { useState } from 'react';
import { Invoice } from '../types';
import { Search, Printer, Edit2, Trash2, Download, FileText, ArrowUpDown, Plus } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => Promise<void>;
  onNewInvoice: () => void;
}

export const InvoiceList: React.FC<Props> = ({
  invoices,
  onSelectInvoice,
  onPrintInvoice,
  onDeleteInvoice,
  onNewInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Local' | 'Interstate'>('All');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.party_gstin && inv.party_gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.invoice_date.includes(searchTerm);

    const matchesType = filterType === 'All' || inv.gst_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalSales = invoices.reduce((acc, inv) => acc + (inv.net_total || 0), 0);
  const totalTax = invoices.reduce((acc, inv) => acc + (inv.cgst_total || 0) + (inv.sgst_total || 0) + (inv.igst_total || 0), 0);

  const exportToCSV = () => {
    const headers = ['Invoice No', 'Date', 'Party Name', 'GSTIN', 'GST Type', 'Sub Total', 'CGST', 'SGST', 'IGST', 'Net Total'];
    const rows = filteredInvoices.map(inv => [
      inv.invoice_no,
      inv.invoice_date,
      `"${inv.party_name.replace(/"/g, '""')}"`,
      inv.party_gstin || '',
      inv.gst_type,
      inv.sub_total.toFixed(2),
      (inv.cgst_total || 0).toFixed(2),
      (inv.sgst_total || 0).toFixed(2),
      (inv.igst_total || 0).toFixed(2),
      inv.net_total.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SBR_Chemicals_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      {/* Metric Cards Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: '#ffffff',
          padding: '1.15rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Sales Turnover
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
            ₹{totalSales.toLocaleString('en-IN')}.00
          </div>
          <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>Lifetime Revenue</span>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '1.15rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total GST Collected
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0369a1', marginTop: '0.2rem' }}>
            ₹{totalTax.toLocaleString('en-IN')}.00
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CGST + SGST + IGST</span>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '1.15rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Invoices Issued
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
            {invoices.length} Bills
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Sequential Numbering</span>
        </div>
      </div>

      {/* Main Window */}
      <div className="master-window">
        {/* Header */}
        <div className="master-header-band">
          <span>INVOICE REGISTER / BILLS ARCHIVE</span>
          <button
            type="button"
            onClick={onNewInvoice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#ffffff',
              color: '#b91c1c',
              border: 'none',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} /> New Bill
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by invoice no, customer name, GSTIN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tax Type:</span>
            {(['All', 'Local', 'Interstate'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  border: filterType === t ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                  background: filterType === t ? '#fef2f2' : '#ffffff',
                  color: filterType === t ? '#b91c1c' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}

            <button
              type="button"
              onClick={exportToCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div style={{ overflowX: 'auto', background: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem', width: '90px' }}>Bill No</th>
                <th style={{ padding: '0.65rem 0.85rem', width: '110px' }}>Date</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Customer / Party</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>GSTIN</th>
                <th style={{ padding: '0.65rem 0.85rem', width: '95px' }}>Type</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', width: '110px' }}>Sub Total</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', width: '130px' }}>Net Total</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr
                  key={inv.id}
                  style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#b91c1c' }}>
                    #{inv.invoice_no}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>
                    {inv.invoice_date}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {inv.party_name}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace' }}>
                    {inv.party_gstin || '-'}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: inv.gst_type === 'Local' ? '#e0f2fe' : '#fef3c7',
                      color: inv.gst_type === 'Local' ? '#0369a1' : '#b45309'
                    }}>
                      {inv.gst_type}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#64748b' }}>
                    ₹{inv.sub_total.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    ₹{inv.net_total.toLocaleString('en-IN')}.00
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => onPrintInvoice(inv)}
                        style={{
                          background: '#b91c1c',
                          color: '#fff',
                          border: 'none',
                          padding: '0.3rem 0.55rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                        title="Print Bill"
                      >
                        <Printer size={13} /> Print
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectInvoice(inv)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '0.3rem 0.45rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Edit / View Bill"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete Invoice #${inv.invoice_no}?`)) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '0.3rem 0.45rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          color: '#dc2626'
                        }}
                        title="Delete Invoice"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No invoices found. Click "New Bill" to generate your first invoice!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
