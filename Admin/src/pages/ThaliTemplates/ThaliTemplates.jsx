import React, { useEffect, useState } from 'react';
import './ThaliTemplates.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const ThaliTemplates = ({ url, token, user }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const isSuperAdmin = user?.role === 'admin';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePriceRupees: '',
    isVeg: true,
    isAvailable: true,
    allowedPreparationNotes: 'Less Spicy, Medium Spicy, Extra Spicy, No Onion & Garlic, Extra Butter',
    componentGroups: [
      {
        groupId: 'grp_breads',
        name: 'Indian Breads',
        isRequired: true,
        minSelections: 1,
        maxSelections: 2,
        maxQuantityPerSelection: 4,
        components: [
          { componentId: 'comp_1', name: 'Tawa Butter Roti (4 pcs)', portion: '4 pcs', image: 'food_butter_roti.jpg', isIncluded: true, extraPriceRupees: 0, isVeg: true, isAvailable: true },
          { componentId: 'comp_2', name: 'Butter Naan (2 pcs)', portion: '2 pcs', image: 'food_butter_naan.jpg', isIncluded: false, extraPriceRupees: 25, isVeg: true, isAvailable: true }
        ]
      },
      {
        groupId: 'grp_dal',
        name: 'Main Dal',
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        maxQuantityPerSelection: 1,
        components: [
          { componentId: 'comp_3', name: 'Yellow Dal Tadka', portion: '1 Bowl (250ml)', image: 'food_dal_tadka.jpg', isIncluded: true, extraPriceRupees: 0, isVeg: true, isAvailable: true },
          { componentId: 'comp_4', name: 'Dal Makhani', portion: '1 Bowl (250ml)', image: 'food_dal_makhani.jpg', isIncluded: false, extraPriceRupees: 20, isVeg: true, isAvailable: true }
        ]
      }
    ]
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/thali/list`, {
        headers: token ? { token } : {}
      });
      if (res.data.success) {
        setTemplates(res.data.templates || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load thali templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [token]);

  // Toggle template status
  const handleToggleTemplateStatus = async (template) => {
    try {
      const res = await axios.put(
        `${url}/api/thali/${template._id}`,
        { isAvailable: !template.isAvailable },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`Template marked as ${!template.isAvailable ? 'AVAILABLE' : 'PAUSED'}`);
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  // Toggle individual component stock (in-stock / sold out)
  const handleToggleComponentStock = async (templateId, groupId, componentId, currentAvailability) => {
    try {
      const res = await axios.patch(
        `${url}/api/thali/${templateId}/component-availability`,
        { groupId, componentId, isAvailable: !currentAvailability },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.info(`Item marked as ${!currentAvailability ? 'In Stock' : 'Sold Out'}`);
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update component availability');
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this Thali template?')) return;
    try {
      const res = await axios.delete(`${url}/api/thali/${templateId}`, {
        headers: { token }
      });
      if (res.data.success) {
        toast.success('Thali template deleted');
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Open Create/Edit modal
  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        basePriceRupees: template.basePriceRupees,
        isVeg: template.isVeg !== false,
        isAvailable: template.isAvailable !== false,
        allowedPreparationNotes: (template.allowedPreparationNotes || []).join(', '),
        componentGroups: template.componentGroups || []
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        basePriceRupees: '',
        isVeg: true,
        isAvailable: true,
        allowedPreparationNotes: 'Less Spicy, Medium Spicy, Extra Spicy, No Onion & Garlic, Extra Butter',
        componentGroups: [
          {
            groupId: 'grp_breads',
            name: 'Indian Breads',
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 4,
            components: [
              { componentId: 'comp_1', name: 'Tawa Butter Roti (4 pcs)', portion: '4 pcs', image: 'food_butter_roti.jpg', isIncluded: true, extraPriceRupees: 0, isVeg: true, isAvailable: true },
              { componentId: 'comp_2', name: 'Butter Naan (2 pcs)', portion: '2 pcs', image: 'food_butter_naan.jpg', isIncluded: false, extraPriceRupees: 25, isVeg: true, isAvailable: true }
            ]
          }
        ]
      });
    }
    setShowModal(true);
  };

  // Group Management in Form
  const addGroup = () => {
    setFormData((prev) => ({
      ...prev,
      componentGroups: [
        ...prev.componentGroups,
        {
          groupId: `grp_${Date.now()}`,
          name: 'New Dish Category',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          maxQuantityPerSelection: 1,
          components: [
            { componentId: `c_${Date.now()}`, name: 'Sample Item', portion: '1 serving', image: 'placeholder_dish.svg', isIncluded: true, extraPriceRupees: 0, isVeg: true, isAvailable: true }
          ]
        }
      ]
    }));
  };

  const removeGroup = (gIdx) => {
    setFormData((prev) => ({
      ...prev,
      componentGroups: prev.componentGroups.filter((_, idx) => idx !== gIdx)
    }));
  };

  const addComponentToGroup = (gIdx) => {
    const updated = [...formData.componentGroups];
    updated[gIdx].components.push({
      componentId: `comp_${Date.now()}`,
      name: '',
      portion: '',
      image: '',
      isIncluded: true,
      extraPriceRupees: 0,
      isVeg: true,
      isAvailable: true
    });
    setFormData((prev) => ({ ...prev, componentGroups: updated }));
  };

  const removeComponentFromGroup = (gIdx, cIdx) => {
    const updated = [...formData.componentGroups];
    updated[gIdx].components = updated[gIdx].components.filter((_, idx) => idx !== cIdx);
    setFormData((prev) => ({ ...prev, componentGroups: updated }));
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.basePriceRupees) {
      toast.error('Please enter Thali name and base price');
      return;
    }

    const payload = {
      ...formData,
      basePriceRupees: Number(formData.basePriceRupees),
      allowedPreparationNotes: formData.allowedPreparationNotes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    try {
      if (editingTemplate) {
        const res = await axios.put(`${url}/api/thali/${editingTemplate._id}`, payload, {
          headers: { token }
        });
        if (res.data.success) {
          toast.success('Thali template updated!');
          setShowModal(false);
          fetchTemplates();
        }
      } else {
        const res = await axios.post(`${url}/api/thali/create`, payload, {
          headers: { token }
        });
        if (res.data.success) {
          toast.success('New Thali template created!');
          setShowModal(false);
          fetchTemplates();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template');
    }
  };

  return (
    <div className='thali-templates-page'>
      {/* Header */}
      <div className='thali-header-row'>
        <div>
          <h2>🍱 Build Your Own Thali Templates</h2>
          <p>
            {isSuperAdmin
              ? 'Platform-wide Thali templates & live component availability'
              : 'Configure your custom thali options, prices & kitchen ingredients availability'}
          </p>
        </div>
        <button className='thali-create-btn' onClick={() => handleOpenModal()}>
          + Create New Thali Template
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading thali templates...</p>
      ) : templates.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
          <p>No Thali templates found. Click "+ Create New Thali Template" to create one.</p>
        </div>
      ) : (
        <div className='thali-admin-cards'>
          {templates.map((tpl) => (
            <div key={tpl._id} className='thali-admin-card'>
              <div className='thali-admin-card-header'>
                <div className='thali-admin-title-area'>
                  <h3>
                    {tpl.name}
                    {tpl.isVeg && <span style={{ color: '#16a34a', fontSize: '13px' }}>● Pure Veg</span>}
                  </h3>
                  <p>
                    🏪 {tpl.restaurantId?.name || 'QuickBites Kitchen'} • Base Price:{' '}
                    <strong style={{ color: '#0f172a' }}>₹{tpl.basePriceRupees}</strong> •{' '}
                    {tpl.componentGroups?.length || 0} Customization Groups
                  </p>
                </div>

                <div className='thali-admin-actions'>
                  <button
                    className={`thali-toggle-btn ${tpl.isAvailable ? 'active' : 'paused'}`}
                    onClick={() => handleToggleTemplateStatus(tpl)}
                  >
                    {tpl.isAvailable ? '● Online & Accepting' : '○ Paused / Sold Out'}
                  </button>
                  <button
                    className='thali-del-btn'
                    onClick={() => setPreviewTemplate(tpl)}
                    title='Preview customer configuration experience'
                  >
                    👁️ Preview
                  </button>
                  <button className='thali-del-btn' onClick={() => handleOpenModal(tpl)}>
                    ✏️ Edit
                  </button>
                  <button className='thali-del-btn' onClick={() => handleDeleteTemplate(tpl._id)}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* Component Groups & Stock Toggle */}
              <div className='thali-groups-table-container'>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Component Availability & Pricing Controls (Click to toggle item stock):
                </div>

                {(tpl.componentGroups || []).map((grp) => (
                  <div key={grp.groupId} className='thali-group-block'>
                    <div className='thali-group-header-text'>
                      <span>📁 {grp.name}:</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        ({grp.isRequired ? 'Required' : 'Optional'}, Pick {grp.minSelections}-{grp.maxSelections}, Max {grp.maxQuantityPerSelection}/item)
                      </span>
                    </div>

                    <div className='thali-comps-pill-grid'>
                      {grp.components.map((comp) => (
                        <div
                          key={comp.componentId}
                          className={`thali-comp-admin-pill ${!comp.isAvailable ? 'out-of-stock' : ''}`}
                        >
                          {comp.image && (
                            <img
                              src={comp.image.startsWith('http') ? comp.image : `${url}/images/${comp.image}`}
                              alt={comp.name}
                              className='thali-comp-admin-thumb'
                              onError={(e) => { e.target.src = '/placeholder_dish.svg'; }}
                            />
                          )}
                          <div className='thali-comp-admin-info'>
                            <span className='thali-comp-name'>{comp.name}</span>
                            {comp.portion && <span className='thali-comp-portion'>{comp.portion}</span>}
                          </div>
                          <span style={{ fontWeight: '700', color: comp.extraPriceRupees > 0 ? '#d97706' : '#16a34a' }}>
                            {comp.extraPriceRupees > 0 ? `+₹${comp.extraPriceRupees}` : 'Included'}
                          </span>
                          <button
                            className={`thali-comp-stock-toggle ${comp.isAvailable ? 'in-stock' : 'sold-out'}`}
                            onClick={() => handleToggleComponentStock(tpl._id, grp.groupId, comp.componentId, comp.isAvailable)}
                            title='Toggle In-Stock / Sold Out'
                          >
                            {comp.isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Template Modal */}
      {showModal && (
        <div className='thali-admin-modal-backdrop' onClick={() => setShowModal(false)}>
          <div className='thali-admin-modal-card' onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>
                {editingTemplate ? '✏️ Edit Thali Template' : '🍱 Create New Thali Template'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              <div className='thali-form-row'>
                <label>Thali Name *</label>
                <input
                  type='text'
                  required
                  placeholder='e.g. Maharaja Royal North Indian Thali'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className='thali-form-row'>
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder='Describe the thali feast...'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className='thali-form-row'>
                  <label>Base Price in Rupees (₹) *</label>
                  <input
                    type='number'
                    required
                    min={50}
                    placeholder='180'
                    value={formData.basePriceRupees}
                    onChange={(e) => setFormData({ ...formData, basePriceRupees: e.target.value })}
                  />
                </div>
                <div className='thali-form-row' style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
                  <label style={{ margin: 0 }}>
                    <input
                      type='checkbox'
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    />{' '}
                    Pure Vegetarian Thali
                  </label>
                </div>
              </div>

              <div className='thali-form-row'>
                <label>Allowed Kitchen Preparation Notes (Comma separated)</label>
                <input
                  type='text'
                  value={formData.allowedPreparationNotes}
                  onChange={(e) => setFormData({ ...formData, allowedPreparationNotes: e.target.value })}
                />
              </div>

              {/* Component Groups Builder */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                    Component Groups ({formData.componentGroups.length})
                  </h4>
                  <button
                    type='button'
                    onClick={addGroup}
                    style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + Add Group
                  </button>
                </div>

                {formData.componentGroups.map((grp, gIdx) => (
                  <div key={gIdx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <input
                        type='text'
                        value={grp.name}
                        placeholder='Group Name (e.g. Breads, Rice, Dal)'
                        style={{ fontWeight: '700', flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        onChange={(e) => {
                          const updated = [...formData.componentGroups];
                          updated[gIdx].name = e.target.value;
                          setFormData({ ...formData, componentGroups: updated });
                        }}
                      />
                      <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type='checkbox'
                          checked={grp.isRequired}
                          onChange={(e) => {
                            const updated = [...formData.componentGroups];
                            updated[gIdx].isRequired = e.target.checked;
                            setFormData({ ...formData, componentGroups: updated });
                          }}
                        />{' '}
                        Required
                      </label>
                      <button
                        type='button'
                        onClick={() => removeGroup(gIdx)}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Group selection rules */}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                      <span>
                        Min Pick:{' '}
                        <input
                          type='number'
                          min={0}
                          max={5}
                          value={grp.minSelections}
                          style={{ width: '45px', padding: '2px 4px' }}
                          onChange={(e) => {
                            const updated = [...formData.componentGroups];
                            updated[gIdx].minSelections = Number(e.target.value);
                            setFormData({ ...formData, componentGroups: updated });
                          }}
                        />
                      </span>
                      <span>
                        Max Pick:{' '}
                        <input
                          type='number'
                          min={1}
                          max={10}
                          value={grp.maxSelections}
                          style={{ width: '45px', padding: '2px 4px' }}
                          onChange={(e) => {
                            const updated = [...formData.componentGroups];
                            updated[gIdx].maxSelections = Number(e.target.value);
                            setFormData({ ...formData, componentGroups: updated });
                          }}
                        />
                      </span>
                    </div>

                    {/* Components inside group */}
                    <div style={{ marginLeft: '12px', borderLeft: '2px solid #cbd5e1', paddingLeft: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>Dishes in this group:</span>
                        <button
                          type='button'
                          onClick={() => addComponentToGroup(gIdx)}
                          style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          + Add Dish
                        </button>
                      </div>

                      {grp.components.map((comp, cIdx) => (
                        <div key={cIdx} className='thali-comp-edit-row'>
                          <input
                            type='text'
                            value={comp.name}
                            placeholder='Dish Name (e.g. Butter Naan)'
                            className='thali-comp-edit-name'
                            onChange={(e) => {
                              const updated = [...formData.componentGroups];
                              updated[gIdx].components[cIdx].name = e.target.value;
                              setFormData({ ...formData, componentGroups: updated });
                            }}
                          />
                          <input
                            type='text'
                            value={comp.portion || ''}
                            placeholder='Portion (e.g. 2 pcs / 250ml)'
                            className='thali-comp-edit-portion'
                            onChange={(e) => {
                              const updated = [...formData.componentGroups];
                              updated[gIdx].components[cIdx].portion = e.target.value;
                              setFormData({ ...formData, componentGroups: updated });
                            }}
                          />
                          <input
                            type='text'
                            value={comp.image || ''}
                            placeholder='Image filename (e.g. food_butter_naan.jpg)'
                            className='thali-comp-edit-image'
                            onChange={(e) => {
                              const updated = [...formData.componentGroups];
                              updated[gIdx].components[cIdx].image = e.target.value;
                              setFormData({ ...formData, componentGroups: updated });
                            }}
                          />
                          <input
                            type='number'
                            value={comp.extraPriceRupees}
                            placeholder='Upgrade ₹'
                            className='thali-comp-edit-price'
                            onChange={(e) => {
                              const updated = [...formData.componentGroups];
                              updated[gIdx].components[cIdx].extraPriceRupees = Number(e.target.value);
                              updated[gIdx].components[cIdx].isIncluded = Number(e.target.value) === 0;
                              setFormData({ ...formData, componentGroups: updated });
                            }}
                          />
                          <button
                            type='button'
                            onClick={() => removeComponentFromGroup(gIdx, cIdx)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: '800' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Preview Modal */}
      {previewTemplate && (
        <div className='thali-admin-modal-backdrop' onClick={() => setPreviewTemplate(null)}>
          <div className='thali-admin-modal-card' onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>👁️ Live Customer Configuration Preview</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>
              This is how customers will interact with "{previewTemplate.name}" on the QuickBites website:
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>🍱 {previewTemplate.name}</h4>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#1d4ed8' }}>
                  Starts at ₹{previewTemplate.basePriceRupees}
                </span>
              </div>

              {(previewTemplate.componentGroups || []).map((grp, i) => (
                <div key={grp.groupId} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                    Step {i + 1}: {grp.name}{' '}
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      ({grp.isRequired ? 'Required' : 'Optional'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {grp.components.map((c) => (
                      <div
                        key={c.componentId}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: c.isAvailable ? 1 : 0.5
                        }}
                      >
                        {c.image && (
                          <img
                            src={c.image.startsWith('http') ? c.image : `${url}/images/${c.image}`}
                            alt={c.name}
                            style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/placeholder_dish.svg'; }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600' }}>
                            {c.name} {c.extraPriceRupees > 0 ? `(+₹${c.extraPriceRupees})` : '(Included)'}
                          </div>
                          {c.portion && <div style={{ fontSize: '10.5px', color: '#64748b' }}>{c.portion}</div>}
                        </div>
                        {!c.isAvailable && <span style={{ color: '#ef4444', fontSize: '11px' }}>[Sold Out]</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThaliTemplates;
