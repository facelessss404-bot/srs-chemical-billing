import React, { useState, useEffect } from 'react';
import { Party, Item, Invoice, InvoiceItem } from '../types';
import { numberToWords } from '../utils/numberToWords';
import { Plus, Trash2, Printer, Save, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  parties: Party[];
  items: Item[];
  nextInvoiceNo: string;
  onSaveInvoice: (invoice: Partial<Invoice>) => Promise<Invoice>;
  onPrintInvoice: (invoice: Invoice) => void;
  initialInvoice?: Invoice | null;
  onClearInitialInvoice?: () => void;
}

export const BillingScreen: React.FC<Props> = ({
  parties,
  items,
  nextInvoiceNo,
  onSaveInvoice,
  onPrintInvoice,
  initialInvoice,
  onClearInitialInvoice
}) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [partyGstin, setPartyGstin] = useState<string>('');
  const [partyPhone, setPartyPhone] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>(nextInvoiceNo);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gstType, setGstType] = useState<'Local' | 'Interstate'>('Local');
  const [orderNoDate, setOrderNoDate] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [lrRrNo, setLrRrNo] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Cash/Credit Bill');
  const [destination, setDestination] = useState<string>('Coimbatore');
  const [notes, setNotes] = useState<string>('');

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize form
  useEffect(() => {
    if (initialInvoice) {
      setSelectedPartyId(initialInvoice.party_id);
      setPartyName(initialInvoice.party_name);
      setBillingAddress(initialInvoice.billing_address);
      setShippingAddress(initialInvoice.shipping_address);
      setPartyGstin(initialInvoice.party_gstin);
      setPartyPhone(initialInvoice.party_phone);
      setInvoiceNo(initialInvoice.invoice_no);
      setInvoiceDate(initialInvoice.invoice_date);
      setGstType(initialInvoice.gst_type);
      setOrderNoDate(initialInvoice.order_no_date || '');
      setVehicleNo(initialInvoice.vehicle_no || '');
      setLrRrNo(initialInvoice.lr_rr_no || '');
      setPaymentTerms(initialInvoice.payment_terms || 'Cash/Credit Bill');
      setDestination(initialInvoice.destination || '');
      setNotes(initialInvoice.notes || '');
      setLineItems(initialInvoice.items || []);
      setFreightCharges(initialInvoice.freight_charges || 0);
    } else {
      resetForm();
    }
  }, [initialInvoice, nextInvoiceNo]);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const resetForm = () => {
    if (onClearInitialInvoice) onClearInitialInvoice();
    setInvoiceNo(nextInvoiceNo);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setGstType('Local');
    setOrderNoDate('');
    setVehicleNo('');
    setLrRrNo('');
    setPaymentTerms('Cash/Credit Bill');
    setDestination('Coimbatore');
    setNotes('');
    setFreightCharges(0);

    // Pick first party if available
    if (parties.length > 0) {
      handlePartySelect(parties[0].id);
    } else {
      setSelectedPartyId('');
      setPartyName('');
      setBillingAddress('');
      setShippingAddress('');
      setPartyGstin('');
      setPartyPhone('');
    }

    // Default 1 line item
    if (items.length > 0) {
      const defaultItem = items[0];
      setLineItems([createLineItem(1, defaultItem, 1)]);
    } else {
      setLineItems([]);
    }
  };

  const handlePartySelect = (partyId: string) => {
    setSelectedPartyId(partyId);
    const p = parties.find(x => x.id === partyId);
    if (p) {
      setPartyName(p.party_name);
      const fullAddr = `${p.address}${p.city_town ? '\n' + p.city_town : ''}${p.postal_code ? ' - ' + p.postal_code : ''}`;
      setBillingAddress(fullAddr);
      setShippingAddress(fullAddr);
      setPartyGstin(p.gstin || '');
      setPartyPhone(p.phone || p.contact_no_1 || '');

      const isInter = p.is_interstate || (p.gstin && p.gstin.length >= 2 && !p.gstin.startsWith('33'));
      setGstType(isInter ? 'Interstate' : 'Local');

      // recalculate tax for all line items
      recalcLineItems(lineItems, isInter ? 'Interstate' : 'Local');
    }
  };

  const createLineItem = (s_no: number, item?: Item, qty: number = 1): InvoiceItem => {
    const isInter = gstType === 'Interstate';
    const rate = item ? item.selling_price : 0;
    const taxable = qty * rate;
    const gstRate = item ? item.gst_rate : 18;

    let cgstRate = 0;
    let cgstAmt = 0;
    let sgstRate = 0;
    let sgstAmt = 0;
    let igstRate = 0;
    let igstAmt = 0;

    if (isInter) {
      igstRate = gstRate;
      igstAmt = (taxable * igstRate) / 100;
    } else {
      cgstRate = gstRate / 2;
      cgstAmt = (taxable * cgstRate) / 100;
      sgstRate = gstRate / 2;
      sgstAmt = (taxable * sgstRate) / 100;
    }

    const total = taxable + cgstAmt + sgstAmt + igstAmt;

    return {
      s_no,
      item_id: item?.id || '',
      item_name: item ? item.item_name : '',
      description: '',
      hsn_code: item ? item.hsn_sac_code : '',
      uom: item ? item.uom : 'Ltrs',
      qty,
      rate,
      discount_pct: 0,
      discount_amt: 0,
      taxable_value: Math.round(taxable * 100) / 100,
      gst_rate: gstRate,
      cgst_rate: cgstRate,
      cgst_amount: Math.round(cgstAmt * 100) / 100,
      sgst_rate: sgstRate,
      sgst_amount: Math.round(sgstAmt * 100) / 100,
      igst_rate: igstRate,
      igst_amount: Math.round(igstAmt * 100) / 100,
      total_value: Math.round(total * 100) / 100
    };
  };

  const recalcLineItems = (currentLines: InvoiceItem[], currentGstType: 'Local' | 'Interstate') => {
    const isInter = currentGstType === 'Interstate';
    const updated = currentLines.map(line => {
      const taxable = line.qty * line.rate - (line.discount_amt || 0);
      let cgstRate = 0;
      let cgstAmt = 0;
      let sgstRate = 0;
      let sgstAmt = 0;
      let igstRate = 0;
      let igstAmt = 0;

      if (isInter) {
        igstRate = line.gst_rate;
        igstAmt = (taxable * igstRate) / 100;
      } else {
        cgstRate = line.gst_rate / 2;
        cgstAmt = (taxable * cgstRate) / 100;
        sgstRate = line.gst_rate / 2;
        sgstAmt = (taxable * sgstRate) / 100;
      }

      return {
        ...line,
        taxable_value: Math.round(taxable * 100) / 100,
        cgst_rate: cgstRate,
        cgst_amount: Math.round(cgstAmt * 100) / 100,
        sgst_rate: sgstRate,
        sgst_amount: Math.round(sgstAmt * 100) / 100,
        igst_rate: igstRate,
        igst_amount: Math.round(igstAmt * 100) / 100,
        total_value: Math.round((taxable + cgstAmt + sgstAmt + igstAmt) * 100) / 100
      };
    });
    setLineItems(updated);
  };

  const handleItemChange = (index: number, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newLines = [...lineItems];
    const prevQty = newLines[index]?.qty || 1;
    newLines[index] = createLineItem(index + 1, item, prevQty);
    setLineItems(newLines);
  };

  // Quantity input handler (Manual entry as highlighted in voice recording!)
  const handleQtyChange = (index: number, val: number) => {
    const newLines = [...lineItems];
    const line = newLines[index];
    const qty = Math.max(0, val);
    const taxable = qty * line.rate - (line.discount_amt || 0);

    const isInter = gstType === 'Interstate';
    let cgstAmt = 0;
    let sgstAmt = 0;
    let igstAmt = 0;

    if (isInter) {
      igstAmt = (taxable * line.igst_rate) / 100;
    } else {
      cgstAmt = (taxable * line.cgst_rate) / 100;
      sgstAmt = (taxable * line.sgst_rate) / 100;
    }

    newLines[index] = {
      ...line,
      qty,
      taxable_value: Math.round(taxable * 100) / 100,
      cgst_amount: Math.round(cgstAmt * 100) / 100,
      sgst_amount: Math.round(sgstAmt * 100) / 100,
      igst_amount: Math.round(igstAmt * 100) / 100,
      total_value: Math.round((taxable + cgstAmt + sgstAmt + igstAmt) * 100) / 100
    };
    setLineItems(newLines);
  };

  const handleRateChange = (index: number, val: number) => {
    const newLines = [...lineItems];
    const line = newLines[index];
    const rate = Math.max(0, val);
    const taxable = line.qty * rate - (line.discount_amt || 0);

    const isInter = gstType === 'Interstate';
    let cgstAmt = 0;
    let sgstAmt = 0;
    let igstAmt = 0;

    if (isInter) {
      igstAmt = (taxable * line.igst_rate) / 100;
    } else {
      cgstAmt = (taxable * line.cgst_rate) / 100;
      sgstAmt = (taxable * line.sgst_rate) / 100;
    }

    newLines[index] = {
      ...line,
      rate,
      taxable_value: Math.round(taxable * 100) / 100,
      cgst_amount: Math.round(cgstAmt * 100) / 100,
      sgst_amount: Math.round(sgstAmt * 100) / 100,
      igst_amount: Math.round(igstAmt * 100) / 100,
      total_value: Math.round((taxable + cgstAmt + sgstAmt + igstAmt) * 100) / 100
    };
    setLineItems(newLines);
  };

  const handleAddLine = () => {
    const defaultItem = items[0];
    const newItem = createLineItem(lineItems.length + 1, defaultItem, 1);
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLine = (index: number) => {
    if (lineItems.length <= 1) {
      notify('error', 'Invoice must have at least one line item');
      return;
    }
    const updated = lineItems.filter((_, i) => i !== index).map((l, i) => ({ ...l, s_no: i + 1 }));
    setLineItems(updated);
  };

  // Totals calculations
  const subTotal = lineItems.reduce((acc, l) => acc + (l.taxable_value || 0), 0);
  const cgstTotal = lineItems.reduce((acc, l) => acc + (l.cgst_amount || 0), 0);
  const sgstTotal = lineItems.reduce((acc, l) => acc + (l.sgst_amount || 0), 0);
  const igstTotal = lineItems.reduce((acc, l) => acc + (l.igst_amount || 0), 0);

  const totalBeforeRound = subTotal + cgstTotal + sgstTotal + igstTotal + (Number(freightCharges) || 0);
  const netTotal = Math.round(totalBeforeRound);
  const roundOff = Math.round((netTotal - totalBeforeRound) * 100) / 100;
  const words = numberToWords(netTotal);

  const buildInvoiceObject = (): Invoice => {
    return {
      id: initialInvoice?.id || 'inv_' + Date.now(),
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      party_id: selectedPartyId,
      party_name: partyName,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      party_gstin: partyGstin,
      party_phone: partyPhone,
      gst_type: gstType,
      order_no_date: orderNoDate,
      vehicle_no: vehicleNo,
      lr_rr_no: lrRrNo,
      payment_terms: paymentTerms,
      destination: destination,
      notes: notes,
      items: lineItems,
      total_entries: lineItems.length,
      sub_total: Math.round(subTotal * 100) / 100,
      grand_total: Math.round(subTotal * 100) / 100,
      freight_charges: Number(freightCharges) || 0,
      cgst_total: Math.round(cgstTotal * 100) / 100,
      sgst_total: Math.round(sgstTotal * 100) / 100,
      igst_total: Math.round(igstTotal * 100) / 100,
      round_off: roundOff,
      net_total: netTotal,
      amount_in_words: words,
      status: 'Paid',
      created_at: initialInvoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const handleSaveOnly = async () => {
    if (!partyName) {
      notify('error', 'Please select or enter Party Name!');
      return;
    }
    if (lineItems.length === 0) {
      notify('error', 'Please add at least one item!');
      return;
    }

    try {
      const inv = buildInvoiceObject();
      const saved = await onSaveInvoice(inv);
      notify('success', `Invoice #${saved.invoice_no} saved successfully!`);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to save invoice');
    }
  };

  const handleSaveAndPrint = async () => {
    if (!partyName) {
      notify('error', 'Please select or enter Party Name!');
      return;
    }
    try {
      const inv = buildInvoiceObject();
      const saved = await onSaveInvoice(inv);
      notify('success', `Invoice #${saved.invoice_no} saved! Opening Print Preview...`);
      onPrintInvoice(saved);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to save invoice');
    }
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      {notification && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: notification.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Billing Window Frame matching Screenshot 3 */}
      <div className="billing-window">
        {/* Red Title Band */}
        <div className="master-header-band">
          <span>INVOICE - CASH / CREDIT BILL</span>
          <span style={{ fontSize: '0.85rem' }}>
            Invoice #{invoiceNo} | {invoiceDate}
          </span>
        </div>

        {/* Header Grid: Party & Invoice Details */}
        <div className="billing-header-grid">
          {/* Left Column: Party Details */}
          <div>
            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#7f1d1d', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Party Name *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  value={selectedPartyId}
                  onChange={e => handlePartySelect(e.target.value)}
                  style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}
                >
                  <option value="">-- Select Party from Master --</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.party_name} ({p.city_town})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Billing Address
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={billingAddress}
                  onChange={e => setBillingAddress(e.target.value)}
                  placeholder="Street, Area, City, Pincode"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Shipping Address
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Shipping destination address"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Buyer's GSTIN
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={partyGstin}
                  onChange={e => setPartyGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 33AADFL1407B1Z6"
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Contact / Mobile
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={partyPhone}
                  onChange={e => setPartyPhone(e.target.value)}
                  placeholder="Mobile number"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Meta */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.2rem' }}>
                  Inv. No *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceNo}
                  onChange={e => setInvoiceNo(e.target.value)}
                  style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.2rem' }}>
                  Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  style={{ fontWeight: 600 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  GST Type
                </label>
                <select
                  className="form-select"
                  value={gstType}
                  onChange={e => {
                    const val = e.target.value as 'Local' | 'Interstate';
                    setGstType(val);
                    recalcLineItems(lineItems, val);
                  }}
                  style={{ fontWeight: 700, color: '#0369a1' }}
                >
                  <option value="Local">Local (CGST 9% + SGST 9%)</option>
                  <option value="Interstate">Interstate (IGST 18%)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Disp' Thr' / Vehicle No
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  placeholder="e.g. TN 38 BX 4492"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Order No / Date
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={orderNoDate}
                  onChange={e => setOrderNoDate(e.target.value)}
                  placeholder="PO / Order Ref"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  LR / RR No
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={lrRrNo}
                  onChange={e => setLrRrNo(e.target.value)}
                  placeholder="LR receipt no"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table matching Screenshot 3 */}
        <div style={{ overflowX: 'auto', background: '#ffffff' }}>
          <table className="billing-items-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.No</th>
                <th style={{ minWidth: '220px' }}>Item Name</th>
                <th style={{ width: '100px' }}>HSN/SAC</th>
                <th style={{ width: '75px' }}>UOM</th>
                <th style={{ width: '95px', textAlign: 'right' }}>Qty</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Rate / Unit</th>
                <th style={{ width: '115px', textAlign: 'right' }}>Taxable Val</th>
                {gstType === 'Local' ? (
                  <>
                    <th style={{ width: '85px', textAlign: 'right' }}>CGST</th>
                    <th style={{ width: '85px', textAlign: 'right' }}>SGST</th>
                  </>
                ) : (
                  <th style={{ width: '95px', textAlign: 'right' }}>IGST</th>
                )}
                <th style={{ width: '120px', textAlign: 'right' }}>Total Value</th>
                <th style={{ width: '45px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={line.item_id}
                      onChange={e => handleItemChange(idx, e.target.value)}
                      style={{ fontWeight: 600, color: '#1e293b' }}
                    >
                      <option value="">-- Choose Product / Item --</option>
                      {items.map(it => (
                        <option key={it.id} value={it.id}>
                          {it.item_name} ({it.uom} - ₹{it.selling_price})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={line.hsn_code}
                      readOnly
                      style={{ background: '#f8fafc', fontFamily: 'monospace' }}
                    />
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#64748b' }}>
                      {line.uom || 'Ltrs'}
                    </span>
                  </td>
                  {/* MANUAL QUANTITY INPUT - user emphasized in audio! */}
                  <td>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      className="qty-input"
                      value={line.qty || ''}
                      onChange={e => handleQtyChange(idx, parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                    />
                  </td>
                  {/* Rate - defaults from master */}
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={line.rate || ''}
                      onChange={e => handleRateChange(idx, parseFloat(e.target.value) || 0)}
                      style={{ textAlign: 'right', fontWeight: 600 }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{line.taxable_value.toFixed(2)}
                  </td>
                  {gstType === 'Local' ? (
                    <>
                      <td style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                        <div>₹{line.cgst_amount.toFixed(2)}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>({line.cgst_rate}%)</div>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                        <div>₹{line.sgst_amount.toFixed(2)}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>({line.sgst_rate}%)</div>
                      </td>
                    </>
                  ) : (
                    <td style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                      <div>₹{line.igst_amount.toFixed(2)}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>({line.igst_rate}%)</div>
                    </td>
                  )}
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#991b1b' }}>
                    ₹{line.total_value.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      title="Remove Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Line Row Button */}
        <div style={{ padding: '0.65rem 1rem', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={handleAddLine}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} color="#b91c1c" /> Add Item Line
          </button>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '1rem' }}>
            TOTAL ENTRIES: <strong>{lineItems.length}</strong>
          </span>
        </div>

        {/* Summary & Totals Calculation Section */}
        <div className="billing-summary-section">
          {/* Left: Notes & In Words */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                Rupees in Words
              </label>
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '0.6rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                fontStyle: 'italic'
              }}>
                {words}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Payment Terms
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  placeholder="e.g. Cash/Credit Bill"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                  Destination
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Coimbatore"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                Invoice Notes
              </label>
              <input
                type="text"
                className="form-input"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional customer reference or batch remarks"
              />
            </div>
          </div>

          {/* Right: Tax Breakdown & Net Total */}
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div className="summary-row">
              <span style={{ color: '#64748b' }}>Sub Total (Taxable)</span>
              <span style={{ fontWeight: 700 }}>₹{subTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span style={{ color: '#64748b' }}>Freight / Transport Charges</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={freightCharges || ''}
                  onChange={e => setFreightCharges(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  style={{ width: '85px', textAlign: 'right', padding: '0.2rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '3px' }}
                />
              </div>
            </div>

            {gstType === 'Local' ? (
              <>
                <div className="summary-row">
                  <span style={{ color: '#64748b' }}>CGST Total</span>
                  <span style={{ fontWeight: 600 }}>₹{cgstTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span style={{ color: '#64748b' }}>SGST Total</span>
                  <span style={{ fontWeight: 600 }}>₹{sgstTotal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="summary-row">
                <span style={{ color: '#64748b' }}>IGST Total</span>
                <span style={{ fontWeight: 600 }}>₹{igstTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span style={{ color: '#64748b' }}>Rounded Off</span>
              <span style={{ fontWeight: 600, color: roundOff < 0 ? '#dc2626' : '#16a34a' }}>
                {roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}
              </span>
            </div>

            <div className="summary-row net-total">
              <span>NET TOTAL</span>
              <span style={{ fontSize: '1.35rem' }}>₹{netTotal.toLocaleString('en-IN')}.00</span>
            </div>
          </div>
        </div>

        {/* Master Toolbar (Red footer band matching Screenshot 3) */}
        <div className="master-toolbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="master-btn btn-new"
              onClick={resetForm}
              title="Start New Invoice"
            >
              <RefreshCw size={14} /> New Bill
            </button>
            <button
              type="button"
              className="master-btn"
              onClick={() => onPrintInvoice(buildInvoiceObject())}
              title="Preview Bill Before Saving"
            >
              <FileText size={14} /> Preview Print
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="master-btn"
              onClick={handleSaveOnly}
              style={{ background: '#0284c7', color: '#fff', borderColor: '#0369a1' }}
              title="Save to Database"
            >
              <Save size={14} /> Save Invoice
            </button>
            <button
              type="button"
              className="master-btn btn-save"
              onClick={handleSaveAndPrint}
              style={{ background: '#b91c1c', borderColor: '#991b1b', padding: '0.45rem 1.15rem', fontSize: '0.9rem' }}
              title="Save and Open Print View"
            >
              <Printer size={16} /> Save & Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
