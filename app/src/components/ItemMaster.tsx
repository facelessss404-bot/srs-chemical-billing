import React, { useState, useEffect } from 'react';
import { Item } from '../types';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Search, List, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  items: Item[];
  onSaveItem: (item: Partial<Item>) => Promise<Item>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const ItemMaster: React.FC<Props> = ({ items, onSaveItem, onDeleteItem }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (items.length > 0 && !isEditing) {
      const item = items[currentIndex] || items[0];
      setFormData({ ...item });
    } else if (items.length === 0 && !isEditing) {
      handleNew();
    }
  }, [currentIndex, items, isEditing]);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleNew = () => {
    // Generate code
    const nextCode = items.length > 0
      ? String(Math.max(...items.map(i => Number(i.item_code) || 0)) + 1).padStart(3, '0')
      : '058';

    setFormData({
      id: '',
      item_name: '',
      item_code: nextCode,
      // Default to 'Ltrs' as specifically requested for chemicals/acid/oils!
      uom: 'Ltrs',
      selling_price: 0,
      gst_applicable: true,
      gst_name: 'GST 18%',
      gst_rate: 18,
      hsn_sac_code: '2710'
    });
    setIsEditing(true);
  };

  const handleAlter = () => {
    if (!formData.id && items.length > 0) {
      setFormData({ ...items[currentIndex] });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (items.length > 0) {
      setFormData({ ...items[currentIndex] });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsEditing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.item_name?.trim()) {
      notify('error', 'Item Name is required!');
      return;
    }

    try {
      // Set rate from GST Name
      let rate = 18;
      if (formData.gst_name === 'GST 5%') rate = 5;
      else if (formData.gst_name === 'GST 12%') rate = 12;
      else if (formData.gst_name === 'GST 18%') rate = 18;
      else if (formData.gst_name === 'GST 28%') rate = 28;
      else if (formData.gst_name === 'GST 0%' || !formData.gst_applicable) rate = 0;

      const payload = { ...formData, gst_rate: rate };
      const saved = await onSaveItem(payload);
      setIsEditing(false);
      notify('success', `Item "${saved.item_name}" saved successfully!`);
      const newIdx = items.findIndex(i => i.id === saved.id);
      if (newIdx >= 0) setCurrentIndex(newIdx);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to save item');
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (window.confirm(`Are you sure you want to delete "${formData.item_name}"?`)) {
      try {
        await onDeleteItem(formData.id);
        notify('success', 'Item deleted successfully');
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        setIsEditing(false);
      } catch (err: any) {
        notify('error', err?.message || 'Failed to delete item');
      }
    }
  };

  const filteredItems = items.filter(i =>
    i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.item_code.includes(searchTerm) ||
    i.hsn_sac_code?.includes(searchTerm)
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Window Frame matching Screenshot 2 */}
      <div className="master-window">
        {/* Red Title Band */}
        <div className="master-header-band">
          <span>ITEMS AND DETAILS</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            Record {items.length > 0 ? `${currentIndex + 1} of ${items.length}` : 'New Record'}
          </span>
        </div>

        {/* Master Body Form */}
        <div className="master-body" style={{ minHeight: '340px' }}>
          <div className="form-grid-two">
            {/* Item Name */}
            <label className="form-label required">Item Name</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.item_name || ''}
                onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="e.g. Hydraulic 68, Acid 33%, step bush"
                style={{ fontWeight: 600 }}
              />
            </div>

            {/* Item Code */}
            <label className="form-label">Item Code</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.item_code || ''}
                onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                placeholder="e.g. 057 or 2710"
                style={{ maxWidth: '240px' }}
              />
            </div>

            {/* UOM (Unit of Measurement) - Defaulted to Ltrs */}
            <label className="form-label">UOM</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                className="form-select"
                disabled={!isEditing}
                value={formData.uom || 'Ltrs'}
                onChange={e => setFormData({ ...formData, uom: e.target.value })}
                style={{ maxWidth: '240px', fontWeight: 600, color: '#991b1b' }}
              >
                <option value="Ltrs">Ltrs (Liters - Default)</option>
                <option value="Kgs">Kgs (Kilograms)</option>
                <option value="Can (5L)">Can (5 Liters)</option>
                <option value="Can (20L)">Can (20 Liters)</option>
                <option value="Barrel (200L)">Barrel (200 Liters)</option>
                <option value="Nos">Nos (Numbers)</option>
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Sets">Sets</option>
                <option value="Units">Units</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Default: Liters (Oils / Chemicals / Acid)
              </span>
            </div>

            {/* Selling Price */}
            <label className="form-label">Selling Price</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#64748b' }}>₹</span>
              <input
                type="number"
                step="0.01"
                className="form-input"
                disabled={!isEditing}
                value={formData.selling_price ?? ''}
                onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                style={{ maxWidth: '220px', fontWeight: 600 }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>per unit (excl. tax)</span>
            </div>

            {/* GST Applicable Section */}
            <div style={{ gridColumn: '1 / -1', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: isEditing ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  disabled={!isEditing}
                  checked={formData.gst_applicable !== false}
                  onChange={e => setFormData({ ...formData, gst_applicable: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#b91c1c' }}
                />
                <span style={{ fontWeight: 700, color: '#7f1d1d', fontSize: '0.85rem' }}>GST Applicable</span>
              </label>
            </div>

            {/* GST Name */}
            <label className="form-label">GST Name</label>
            <div>
              <select
                className="form-select"
                disabled={!isEditing || formData.gst_applicable === false}
                value={formData.gst_name || 'GST 18%'}
                onChange={e => setFormData({ ...formData, gst_name: e.target.value })}
                style={{ maxWidth: '280px' }}
              >
                <option value="GST 18%">GST 18% (CGST 9% + SGST 9% / IGST 18%)</option>
                <option value="GST 12%">GST 12% (CGST 6% + SGST 6% / IGST 12%)</option>
                <option value="GST 5%">GST 5% (CGST 2.5% + SGST 2.5% / IGST 5%)</option>
                <option value="GST 28%">GST 28% (CGST 14% + SGST 14% / IGST 28%)</option>
                <option value="GST 0%">GST 0% (Nil Rated)</option>
              </select>
            </div>

            {/* HSN / SAC Code */}
            <label className="form-label">HSN/SAC Code</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.hsn_sac_code || ''}
                onChange={e => setFormData({ ...formData, hsn_sac_code: e.target.value })}
                placeholder="e.g. 2710 (Oils), 2807 (Acid), 998818"
                style={{ maxWidth: '280px', letterSpacing: '0.05em' }}
              />
            </div>
          </div>
        </div>

        {/* Master Action Toolbar (Red footer band matching Screenshot 2) */}
        <div className="master-toolbar">
          <button type="button" className="master-btn btn-new" onClick={handleNew} title="Add New Item">
            <Plus size={14} /> New
          </button>
          <button type="button" className="master-btn" onClick={handleAlter} disabled={isEditing || items.length === 0} title="Edit Current Item">
            <Edit2 size={14} /> Alter
          </button>
          <button type="button" className="master-btn btn-delete" onClick={handleDelete} disabled={isEditing || items.length === 0} title="Delete Item">
            <Trash2 size={14} /> Delete
          </button>
          <button type="button" className="master-btn" onClick={handlePrev} disabled={isEditing || currentIndex <= 0} title="Previous Item">
            <ChevronLeft size={14} /> Prev
          </button>
          <button type="button" className="master-btn" onClick={handleNext} disabled={isEditing || currentIndex >= items.length - 1} title="Next Item">
            <ChevronRight size={14} /> Next
          </button>
          <button type="button" className="master-btn" onClick={() => setShowListModal(true)} title="Find / Search Item">
            <Search size={14} /> Find
          </button>
          <button type="button" className="master-btn" onClick={() => setShowListModal(true)} title="View All Items">
            <List size={14} /> List
          </button>

          {isEditing && (
            <>
              <div style={{ flex: 1 }} />
              <button type="button" className="master-btn btn-save" onClick={handleSave} title="Save Item Details">
                <Save size={14} /> Save
              </button>
              <button type="button" className="master-btn btn-cancel" onClick={handleCancel} title="Cancel Edits">
                <X size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Items List Modal */}
      {showListModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              background: '#b91c1c',
              color: '#ffffff',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Items / Products Directory ({items.length} Products)</span>
              <button
                type="button"
                onClick={() => setShowListModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search item by name, item code, HSN code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Code</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Item Name</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>UOM</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>HSN</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Selling Price</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>GST %</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const actualIdx = items.findIndex(orig => orig.id === item.id);
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          background: actualIdx === currentIndex ? '#fef2f2' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setCurrentIndex(actualIdx);
                          setShowListModal(false);
                          setIsEditing(false);
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{item.item_code}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#991b1b' }}>{item.item_name}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{item.uom}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{item.hsn_sac_code || '-'}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>₹{item.selling_price.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{item.gst_name || '18%'}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            style={{
                              background: '#b91c1c',
                              color: '#fff',
                              border: 'none',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '3px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No items found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                type="button"
                className="master-btn"
                onClick={() => setShowListModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
