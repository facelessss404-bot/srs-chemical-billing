import React, { useState, useEffect } from 'react';
import { Party } from '../types';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Search, List, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  parties: Party[];
  onSaveParty: (party: Partial<Party>) => Promise<Party>;
  onDeleteParty: (id: string) => Promise<void>;
}

export const MasterParty: React.FC<Props> = ({ parties, onSaveParty, onDeleteParty }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<Party>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync current party to form data
  useEffect(() => {
    if (parties.length > 0 && !isEditing) {
      const party = parties[currentIndex] || parties[0];
      setFormData({ ...party });
    } else if (parties.length === 0 && !isEditing) {
      handleNew();
    }
  }, [currentIndex, parties, isEditing]);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleNew = () => {
    const nextCode = parties.length > 0
      ? String(Math.max(...parties.map(p => Number(p.party_code) || 0)) + 1)
      : '16';

    setFormData({
      id: '',
      party_name: '',
      party_code: nextCode,
      party_group: 'Customers',
      address: '',
      city_town: 'Coimbatore (Tamil Nadu)',
      postal_code: '641035',
      phone: '',
      contact_person_1: '',
      contact_no_1: '',
      contact_person_2: '',
      contact_no_2: '',
      contact_person_3: '',
      contact_no_3: '',
      email: '',
      gstin: '33',
      is_interstate: false
    });
    setIsEditing(true);
  };

  const handleAlter = () => {
    if (!formData.id && parties.length > 0) {
      setFormData({ ...parties[currentIndex] });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (parties.length > 0) {
      setFormData({ ...parties[currentIndex] });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsEditing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < parties.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!formData.party_name?.trim()) {
      notify('error', 'Party Name is required!');
      return;
    }

    try {
      const saved = await onSaveParty(formData);
      setIsEditing(false);
      notify('success', `Party "${saved.party_name}" saved successfully!`);
      const newIdx = parties.findIndex(p => p.id === saved.id);
      if (newIdx >= 0) setCurrentIndex(newIdx);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to save party');
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (window.confirm(`Are you sure you want to delete "${formData.party_name}"?`)) {
      try {
        await onDeleteParty(formData.id);
        notify('success', 'Party deleted successfully');
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        setIsEditing(false);
      } catch (err: any) {
        notify('error', err?.message || 'Failed to delete party');
      }
    }
  };

  const filteredParties = parties.filter(p =>
    p.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.party_code.includes(searchTerm) ||
    p.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city_town?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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

      {/* Main Window Frame matching Screenshot 1 */}
      <div className="master-window">
        {/* Red Title Band */}
        <div className="master-header-band">
          <span>PARTIES AND DETAILS</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            Record {parties.length > 0 ? `${currentIndex + 1} of ${parties.length}` : 'New Record'}
          </span>
        </div>

        {/* Tab Ribbon */}
        <div className="master-tab-bar">
          <div className="master-tab">
            Contact Details
          </div>
        </div>

        {/* Master Body Form */}
        <div className="master-body">
          <div className="form-grid-two">
            {/* Party Name */}
            <label className="form-label required">Party Name</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.party_name || ''}
                onChange={e => setFormData({ ...formData, party_name: e.target.value })}
                placeholder="e.g. PAULINE ENGINEERING"
                style={{ fontWeight: 600 }}
              />
            </div>

            {/* Party Code */}
            <label className="form-label">Party Code</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.party_code || ''}
                onChange={e => setFormData({ ...formData, party_code: e.target.value })}
                placeholder="e.g. 16"
                style={{ maxWidth: '240px' }}
              />
            </div>

            {/* Party Group */}
            <label className="form-label required">Party Group</label>
            <div>
              <select
                className="form-select"
                disabled={!isEditing}
                value={formData.party_group || 'Customers'}
                onChange={e => setFormData({ ...formData, party_group: e.target.value })}
                style={{ maxWidth: '320px' }}
              >
                <option value="Customers">Customers</option>
                <option value="Suppliers">Suppliers</option>
                <option value="Job Work Contractors">Job Work Contractors</option>
              </select>
            </div>

            {/* Address */}
            <label className="form-label">Address</label>
            <div>
              <textarea
                className="form-textarea"
                disabled={!isEditing}
                rows={2}
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="110-B Maruthakounder Street, G N MILLS Post"
              />
            </div>

            {/* City/Town */}
            <label className="form-label">City/Town</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.city_town || ''}
                onChange={e => setFormData({ ...formData, city_town: e.target.value })}
                placeholder="Coimbatore (Tamil Nadu)"
              />
            </div>

            {/* Postal Code */}
            <label className="form-label">Postal Code</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.postal_code || ''}
                onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="641029"
                style={{ maxWidth: '240px' }}
              />
            </div>

            {/* Phone Number(s) */}
            <label className="form-label">Phone Number(s)</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9842212345, 0422-2642123"
              />
            </div>

            {/* Contact Person(s) */}
            <label className="form-label">Contact Person(s)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(1)</span>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  value={formData.contact_person_1 || ''}
                  onChange={e => setFormData({ ...formData, contact_person_1: e.target.value })}
                  placeholder="Person Name 1"
                />
                <span style={{ fontSize: '0.775rem', color: '#7f1d1d', textAlign: 'right' }}>Contact No(s)</span>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  value={formData.contact_no_1 || ''}
                  onChange={e => setFormData({ ...formData, contact_no_1: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(2)</span>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  value={formData.contact_person_2 || ''}
                  onChange={e => setFormData({ ...formData, contact_person_2: e.target.value })}
                  placeholder="Person Name 2"
                />
                <span style={{ fontSize: '0.775rem', color: '#7f1d1d', textAlign: 'right' }}>Contact No(s)</span>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  value={formData.contact_no_2 || ''}
                  onChange={e => setFormData({ ...formData, contact_no_2: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(3)</span>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  value={formData.contact_person_3 || ''}
                  onChange={e => setFormData({ ...formData, contact_person_3: e.target.value })}
                  placeholder="Person Name 3"
                />
                <span style={{ fontSize: '0.775rem', color: '#7f1d1d', textAlign: 'right' }}>Contact No(s)</span>
                <input
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  value={formData.contact_no_3 || ''}
                  onChange={e => setFormData({ ...formData, contact_no_3: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            {/* Email */}
            <label className="form-label">E-Mail Address(es)</label>
            <div>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@domain.com"
              />
              <span style={{ fontSize: '0.7rem', color: '#dc2626', fontStyle: 'italic', display: 'block', marginTop: '0.2rem' }}>
                * Use Comma (,) to Separate More than One Email Id
              </span>
            </div>

            {/* GSTIN & Interstate */}
            <label className="form-label">GSTIN</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                disabled={!isEditing}
                maxLength={15}
                value={formData.gstin || ''}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  const isInter = val.length >= 2 && !val.startsWith('33');
                  setFormData({ ...formData, gstin: val, is_interstate: isInter });
                }}
                placeholder="e.g. 33BWEPA1293H1Z0"
                style={{ maxWidth: '280px', letterSpacing: '0.05em', fontWeight: 600 }}
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: isEditing ? 'pointer' : 'default', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  disabled={!isEditing}
                  checked={Boolean(formData.is_interstate)}
                  onChange={e => setFormData({ ...formData, is_interstate: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#b91c1c' }}
                />
                <span style={{ fontWeight: 600, color: '#7f1d1d' }}>InterState GST</span>
              </label>
            </div>
          </div>
        </div>

        {/* Master Toolbar (Red footer bar matching Screenshot 1) */}
        <div className="master-toolbar">
          <button type="button" className="master-btn btn-new" onClick={handleNew} title="Add New Party">
            <Plus size={14} /> New
          </button>
          <button type="button" className="master-btn" onClick={handleAlter} disabled={isEditing || parties.length === 0} title="Edit Current Party">
            <Edit2 size={14} /> Alter
          </button>
          <button type="button" className="master-btn btn-delete" onClick={handleDelete} disabled={isEditing || parties.length === 0} title="Delete Party">
            <Trash2 size={14} /> Delete
          </button>
          <button type="button" className="master-btn" onClick={handlePrev} disabled={isEditing || currentIndex <= 0} title="Previous Record">
            <ChevronLeft size={14} /> Prev
          </button>
          <button type="button" className="master-btn" onClick={handleNext} disabled={isEditing || currentIndex >= parties.length - 1} title="Next Record">
            <ChevronRight size={14} /> Next
          </button>
          <button type="button" className="master-btn" onClick={() => setShowListModal(true)} title="Find / Search Party">
            <Search size={14} /> Find
          </button>
          <button type="button" className="master-btn" onClick={() => setShowListModal(true)} title="View All Parties">
            <List size={14} /> List
          </button>

          {isEditing && (
            <>
              <div style={{ flex: 1 }} />
              <button type="button" className="master-btn btn-save" onClick={handleSave} title="Save Party Details">
                <Save size={14} /> Save
              </button>
              <button type="button" className="master-btn btn-cancel" onClick={handleCancel} title="Cancel Edits">
                <X size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Parties List / Search Modal */}
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
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Parties Directory ({parties.length} Records)</span>
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
                  placeholder="Search by party name, code, phone, GSTIN, city..."
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
                    <th style={{ padding: '0.5rem 0.75rem' }}>Party Name</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>City</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Phone</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>GSTIN</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParties.map((p, idx) => {
                    const actualIdx = parties.findIndex(orig => orig.id === p.id);
                    return (
                      <tr
                        key={p.id}
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
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{p.party_code}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#991b1b' }}>{p.party_name}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{p.city_town}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{p.phone || p.contact_no_1 || '-'}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{p.gstin || '-'}</td>
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
                  {filteredParties.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No parties found matching "{searchTerm}"
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
