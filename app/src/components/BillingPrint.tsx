import React, { useState } from 'react';
import { Invoice, CompanyProfile } from '../types';
import { Printer, ArrowLeft, Download, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  invoice: Invoice;
  company: CompanyProfile;
  onBack: () => void;
}

export const BillingPrint: React.FC<Props> = ({ invoice, company, onBack }) => {
  const [copyType, setCopyType] = useState<'Original' | 'Duplicate' | 'Triplicate'>('Original');

  const getCopyLabel = () => {
    switch (copyType) {
      case 'Original':
        return 'Original for Recipient';
      case 'Duplicate':
        return 'Duplicate for Transporter';
      case 'Triplicate':
        return 'Triplicate Copy';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Company Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(company.company_name, 105, 18, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(company.tagline, 105, 23, { align: 'center' });
    doc.text(company.address, 105, 27, { align: 'center' });
    doc.text(`Mobile: ${company.phones}   |   E-Mail: ${company.email}`, 105, 31, { align: 'center' });
    doc.text(`GSTIN: ${company.gstin}`, 105, 35, { align: 'center' });

    // Invoice Metadata Box
    doc.setLineWidth(0.2);
    doc.rect(14, 40, 182, 30);

    doc.text(`To,`, 18, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.party_name, 18, 51);
    doc.setFont('helvetica', 'normal');
    const addrLines = (invoice.billing_address || '').split('\n').slice(0, 2);
    addrLines.forEach((line, i) => doc.text(line, 18, 56 + (i * 4)));
    if (invoice.party_phone) doc.text(`Mobile: ${invoice.party_phone}`, 18, 65);
    doc.text(`Buyer's GST: ${invoice.party_gstin || 'N/A'}`, 18, 69);

    // Right details in box
    doc.text(`Copy: ${getCopyLabel()}`, 145, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(`GST INVOICE`, 145, 51);
    doc.setFont('helvetica', 'normal');
    doc.text(`CASH/CREDIT BILL`, 145, 56);
    doc.setFont('helvetica', 'bold');
    doc.text(`No: ${invoice.invoice_no}`, 145, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${invoice.invoice_date}`, 145, 67);

    // Table
    const tableRows = invoice.items.map((item, idx) => [
      idx + 1,
      item.item_name + (item.description ? `\n${item.description}` : ''),
      item.hsn_code || '-',
      `${item.qty} ${item.uom || ''}`,
      item.rate.toFixed(2),
      item.taxable_value.toFixed(2)
    ]);

    autoTable(doc, {
      startY: 74,
      head: [['S.No.', 'Description of Goods', 'HSN Code', 'Qty', 'Rate/Unit (Rs.)', 'Taxable Value(Rs.)']],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 27, halign: 'right' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 4;

    // Totals & Words
    doc.rect(14, finalY, 182, 35);
    doc.setFontSize(8);
    doc.text(`Rupees: ${invoice.amount_in_words}`, 18, finalY + 6, { maxWidth: 105 });

    doc.text(`Grand Total (Rs.):`, 130, finalY + 6);
    doc.text(invoice.sub_total.toFixed(2), 190, finalY + 6, { align: 'right' });

    if (invoice.gst_type === 'Local') {
      doc.text(`SGST @ 9.00%:`, 130, finalY + 11);
      doc.text(invoice.sgst_total.toFixed(2), 190, finalY + 11, { align: 'right' });

      doc.text(`CGST @ 9.00%:`, 130, finalY + 16);
      doc.text(invoice.cgst_total.toFixed(2), 190, finalY + 16, { align: 'right' });
    } else {
      doc.text(`IGST @ 18.00%:`, 130, finalY + 13);
      doc.text(invoice.igst_total.toFixed(2), 190, finalY + 13, { align: 'right' });
    }

    doc.text(`Round off (Rs.):`, 130, finalY + 21);
    doc.text((invoice.round_off || 0).toFixed(2), 190, finalY + 21, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`Net Total (Rs.):`, 130, finalY + 28);
    doc.text(`Rs. ${invoice.net_total.toLocaleString('en-IN')}.00`, 190, finalY + 28, { align: 'right' });

    // Bank & Signature
    const bankY = finalY + 38;
    doc.rect(14, bankY, 182, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Our Bank Details', 18, bankY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank Name: ${company.bank_name}`, 18, bankY + 11);
    doc.text(`A/c No: ${company.account_no}`, 18, bankY + 16);
    doc.text(`IFSC Code: ${company.ifsc_code}   Branch: ${company.branch}`, 18, bankY + 21);

    doc.setFont('helvetica', 'bold');
    doc.text(`For ${company.company_name}`, 145, bankY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', 145, bankY + 26);

    doc.save(`Invoice_${invoice.invoice_no}_${company.company_name.replace(/\s+/g, '_')}.pdf`);
  };

  // Pad items so printable bill fills vertically like screenshot 4
  const fillerCount = Math.max(0, 7 - invoice.items.length);
  const fillers = Array.from({ length: fillerCount });

  return (
    <div className="print-paper-wrapper">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="print-toolbar no-print">
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            padding: '0.45rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to Invoicing
        </button>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.25rem' }}>Print Copy:</span>
          {(['Original', 'Duplicate', 'Triplicate'] as const).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCopyType(c)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                border: copyType === c ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                background: copyType === c ? '#fef2f2' : '#ffffff',
                color: copyType === c ? '#b91c1c' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={16} /> Download PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 1.15rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(185,28,28,0.3)'
            }}
          >
            <Printer size={16} /> Print Bill (Ctrl+P)
          </button>
        </div>
      </div>

      {/* A4 Invoice Paper Sheet (Screenshot 4 exact visual replica) */}
      <div className="a4-invoice-sheet" id="printable-invoice">
        <div className="bill-outer-border">
          {/* Header Row */}
          <div className="bill-header-row">
            {/* Logo Monogram */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                border: '1.5px solid #222',
                padding: '4px 6px',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.05em' }}>S.B.R</div>
              </div>
            </div>

            {/* Company Info Center */}
            <div className="bill-header-center">
              <div className="bill-company-title">{company.company_name}</div>
              <div className="bill-company-sub">{company.tagline}</div>
              <div className="bill-company-addr">
                <div>{company.address}</div>
                <div>
                  <strong>Mobile:</strong> {company.phones} &nbsp;|&nbsp; <strong>E-Mail:</strong> {company.email}
                </div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>
                  GSTIN: {company.gstin}
                </div>
              </div>
            </div>

            {/* Top Right Invoice Box */}
            <div className="bill-header-right">
              <div style={{ fontSize: '0.65rem', fontStyle: 'italic', textAlign: 'right', marginBottom: '2px', color: '#444' }}>
                {getCopyLabel()}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.03em' }}>
                GST INVOICE
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, borderBottom: '1px solid #222', paddingBottom: '2px', marginBottom: '4px' }}>
                CASH/CREDIT BILL
              </div>
              <div>
                <strong>No:</strong> <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{invoice.invoice_no}</span>
              </div>
              <div>
                <strong>Date:</strong> {invoice.invoice_date}
              </div>
              {invoice.vehicle_no && (
                <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                  <strong>Veh:</strong> {invoice.vehicle_no}
                </div>
              )}
            </div>
          </div>

          {/* Buyer Section ("To,") */}
          <div className="bill-buyer-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr' }}>
              <div>
                <span style={{ fontWeight: 700 }}>To,</span>
                <div style={{ marginLeft: '1.5rem', fontWeight: 800, fontSize: '0.85rem' }}>
                  {invoice.party_name}
                </div>
                <div style={{ marginLeft: '1.5rem', whiteSpace: 'pre-line', fontSize: '0.725rem' }}>
                  {invoice.billing_address}
                </div>
                {invoice.party_phone && (
                  <div style={{ marginLeft: '1.5rem', fontSize: '0.725rem' }}>
                    <strong>Mobile:</strong> {invoice.party_phone}
                  </div>
                )}
                <div style={{ marginLeft: '1.5rem', marginTop: '2px', fontWeight: 700 }}>
                  Buyer's GST: <span style={{ fontFamily: 'monospace' }}>{invoice.party_gstin || 'Unregistered'}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.7rem', borderLeft: '1px solid #eee', paddingLeft: '0.75rem' }}>
                {invoice.shipping_address && invoice.shipping_address !== invoice.billing_address && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Shipping Address:</strong>
                    <div style={{ whiteSpace: 'pre-line' }}>{invoice.shipping_address}</div>
                  </div>
                )}
                {invoice.order_no_date && (
                  <div><strong>Order No/Dt:</strong> {invoice.order_no_date}</div>
                )}
                {invoice.lr_rr_no && (
                  <div><strong>LR/RR No:</strong> {invoice.lr_rr_no}</div>
                )}
                <div><strong>GST Type:</strong> {invoice.gst_type}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="bill-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>S.No.</th>
                <th>Description of Goods</th>
                <th style={{ width: '90px', textAlign: 'center' }}>HSN Code</th>
                <th style={{ width: '65px', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '105px', textAlign: 'right' }}>Rate/Unit (Rs.)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Taxable Value(Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, idx) => (
                <tr key={idx} className="item-row">
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    {it.item_name}
                    {it.description && <div style={{ fontSize: '0.65rem', color: '#555' }}>{it.description}</div>}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{it.hsn_code || '-'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {it.qty} {it.uom ? it.uom : ''}
                  </td>
                  <td style={{ textAlign: 'right' }}>{it.rate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{it.taxable_value.toFixed(2)}</td>
                </tr>
              ))}

              {/* Aesthetic Fillers for printed stationary height */}
              {fillers.map((_, i) => (
                <tr key={'filler-' + i} style={{ height: '32px' }}>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Container */}
          <div className="bill-bottom-container">
            {/* Tax & Summary Split */}
            <div className="bill-tax-summary-grid">
              {/* Words */}
              <div className="bill-words-box">
                <div>
                  <strong>Rupees :</strong> <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{invoice.amount_in_words}</span>
                </div>
              </div>

              {/* Totals */}
              <div className="bill-totals-box">
                <div className="bill-totals-row">
                  <span>Grand Total (Rs.)</span>
                  <span style={{ fontWeight: 700 }}>{invoice.sub_total.toFixed(2)}</span>
                </div>

                {invoice.gst_type === 'Local' ? (
                  <>
                    <div className="bill-totals-row">
                      <span>SGST @ 9.00%</span>
                      <span>{invoice.sgst_total.toFixed(2)}</span>
                    </div>
                    <div className="bill-totals-row">
                      <span>CGST @ 9.00%</span>
                      <span>{invoice.cgst_total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="bill-totals-row">
                    <span>IGST @ 18.00%</span>
                    <span>{invoice.igst_total.toFixed(2)}</span>
                  </div>
                )}

                {invoice.freight_charges ? (
                  <div className="bill-totals-row">
                    <span>Freight Charges</span>
                    <span>{invoice.freight_charges.toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="bill-totals-row">
                  <span>Round off (Rs.)</span>
                  <span>{(invoice.round_off || 0).toFixed(2)}</span>
                </div>

                <div className="bill-totals-row grand">
                  <span>Net Total (Rs.)</span>
                  <span>₹{invoice.net_total.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            {/* Bank Details & Signatures */}
            <div className="bill-bank-sign-grid">
              {/* Bank Details */}
              <div className="bill-bank-box">
                <div style={{ textDecoration: 'underline', fontWeight: 700, marginBottom: '2px' }}>
                  Our Bank Details
                </div>
                <div><strong>Bank Name :</strong> {company.bank_name}</div>
                <div><strong>A/c No :</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{company.account_no}</span></div>
                <div><strong>IFSC Code :</strong> <span style={{ fontFamily: 'monospace' }}>{company.ifsc_code}</span> &nbsp;&nbsp; <strong>Branch :</strong> {company.branch}</div>
                <div style={{ marginTop: '0.75rem', textDecoration: 'underline', fontStyle: 'italic' }}>
                  Received the goods in good condition
                </div>
                <div style={{ marginTop: '1.5rem', fontWeight: 600 }}>
                  Receiver Signature
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="bill-sign-box">
                <div style={{ fontWeight: 700 }}>
                  For {company.company_name}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ height: '35px' }}></div>
                  <div style={{ fontWeight: 600, borderTop: '1px solid #333', display: 'inline-block', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '2px' }}>
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
