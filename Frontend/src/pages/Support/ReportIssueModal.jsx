import React, { useState } from 'react';
import './ReportIssueModal.css';
import axios from 'axios';

const ISSUE_CATEGORIES = [
  { id: 'missing_item', label: '❌ Missing Item(s)', desc: 'One or more dishes ordered were not in the parcel' },
  { id: 'wrong_item', label: '🍱 Wrong Item Delivered', desc: 'Received a different dish or variation' },
  { id: 'damaged_packaging', label: '📦 Damaged / Spilled Packaging', desc: 'Food leaked or container was crushed' },
  { id: 'delivery_delay_or_failure', label: '🛵 Delivery Delay / Rider Issue', desc: 'Arrived excessively late or driver behavior issue' },
  { id: 'payment_or_billing', label: '💳 Payment / Billing Concern', desc: 'Charged extra or payment deducted twice' },
  { id: 'quality_issue', label: '🍽️ Food Quality or Freshness', desc: 'Cold, uncooked, or stale food' },
  { id: 'other', label: '💬 Other Question / Complaint', desc: 'General dispute or feedback' }
];

const ReportIssueModal = ({ isOpen, onClose, order, url, token, onTicketCreated }) => {
  if (!isOpen || !order) return null;

  const [issueCategory, setIssueCategory] = useState('missing_item');
  const [description, setDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState({}); // { [idx]: { selected: bool, quantity: num } }
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  const handleItemToggle = (idx, item) => {
    setSelectedItems((prev) => {
      const current = prev[idx];
      if (current?.selected) {
        const next = { ...prev };
        delete next[idx];
        return next;
      }
      return {
        ...prev,
        [idx]: {
          selected: true,
          quantity: 1,
          maxQty: item.quantity,
          name: item.name,
          foodId: item.foodId || null,
          price: item.price
        }
      };
    });
  };

  const handleQtyChange = (idx, delta, max) => {
    setSelectedItems((prev) => {
      const current = prev[idx];
      if (!current) return prev;
      const newQty = Math.max(1, Math.min(max, current.quantity + delta));
      return {
        ...prev,
        [idx]: { ...current, quantity: newQty }
      };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      setError('You can upload at most 4 photos as evidence.');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setError('Only JPEG, PNG, or WebP images are allowed.');
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`File "${f.name}" exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (description.trim().length < 10) {
      setError('Please provide a descriptive explanation (minimum 10 characters).');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('issueCategory', issueCategory);
      formData.append('description', description.trim());

      // Affected items
      const affectedList = Object.values(selectedItems)
        .filter((i) => i.selected)
        .map((i) => ({
          name: i.name,
          foodId: i.foodId,
          quantity: i.quantity,
          purchasedQuantity: i.maxQty,
          unitPriceRupees: i.price
        }));

      if (['missing_item', 'wrong_item'].includes(issueCategory) && affectedList.length === 0) {
        setError('Please select at least one affected item from your order below.');
        setSubmitting(false);
        return;
      }

      if (affectedList.length > 0) {
        formData.append('affectedItems', JSON.stringify(affectedList));
      }

      // Photos
      for (const file of images) {
        formData.append('images', file);
      }

      const activeToken = token || localStorage.getItem('token');
      const response = await axios.post(`${url}/api/support/create`, formData, {
        headers: {
          token: activeToken,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessTicket(response.data.ticket);
        if (onTicketCreated) onTicketCreated(response.data.ticket);
      } else {
        setError(response.data.message || 'Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not submit support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='report-modal-backdrop' onClick={onClose}>
      <div className='report-modal-card' onClick={(e) => e.stopPropagation()}>
        <div className='report-modal-header'>
          <div>
            <h3>🚨 Report an Order Issue</h3>
            <p className='report-sub'>
              Order <strong>#{order.orderNumber || order._id?.slice(-6)}</strong> • QuickBites Guarantee
            </p>
          </div>
          <button className='report-close-btn' onClick={onClose}>
            ✕
          </button>
        </div>

        {successTicket ? (
          <div className='report-success-state'>
            <div className='success-badge-icon'>✅</div>
            <h4>Ticket #{successTicket.ticketNumber} Raised!</h4>
            <p>
              Your dispute has been assigned to our customer escalation team. We aim to review and provide resolution within{' '}
              <strong>4 hours</strong>.
            </p>
            <div className='ticket-info-pills'>
              <span>Category: {successTicket.issueCategory.replace(/_/g, ' ')}</span>
              <span>Status: {successTicket.status}</span>
            </div>
            <div className='report-success-actions'>
              <button
                className='view-ticket-btn'
                onClick={() => {
                  onClose();
                  window.location.href = `/support/ticket/${successTicket._id}`;
                }}
              >
                💬 Track Ticket & Chat
              </button>
              <button className='close-done-btn' onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className='report-form' onSubmit={handleSubmit}>
            {error && <div className='report-error-banner'>⚠️ {error}</div>}

            {/* Step 1: Issue Category */}
            <div className='report-section'>
              <label className='section-label'>What went wrong with this meal?</label>
              <div className='categories-grid'>
                {ISSUE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className={`category-chip ${issueCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setIssueCategory(cat.id)}
                  >
                    <strong>{cat.label}</strong>
                    <span>{cat.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Affected Items Selection (Only for food/order items) */}
            {order.items && order.items.length > 0 && (
              <div className='report-section'>
                <label className='section-label'>
                  Select Affected Item(s) <span className='optional-tag'>(Choose dishes and quantity affected)</span>
                </label>
                <div className='affected-items-list'>
                  {order.items.map((item, idx) => {
                    const isSelected = Boolean(selectedItems[idx]?.selected);
                    const currentQty = selectedItems[idx]?.quantity || 1;
                    return (
                      <div key={idx} className={`affected-item-row ${isSelected ? 'row-selected' : ''}`}>
                        <label className='item-checkbox-label'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => handleItemToggle(idx, item)}
                          />
                          <div className='item-info-col'>
                            <span className='item-name-text'>{item.name}</span>
                            <span className='item-price-tag'>
                              ₹{item.price} • Purchased: {item.quantity} qty
                            </span>
                          </div>
                        </label>

                        {isSelected && (
                          <div className='affected-qty-stepper'>
                            <button
                              type='button'
                              onClick={() => handleQtyChange(idx, -1, item.quantity)}
                              disabled={currentQty <= 1}
                            >
                              -
                            </button>
                            <span>{currentQty}</span>
                            <button
                              type='button'
                              onClick={() => handleQtyChange(idx, 1, item.quantity)}
                              disabled={currentQty >= item.quantity}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            <div className='report-section'>
              <label className='section-label' htmlFor='report-desc'>
                Describe the issue in detail
              </label>
              <textarea
                id='report-desc'
                rows='3'
                placeholder='Please explain clearly what happened so our team can resolve it quickly...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <span className='char-counter'>{description.length} / 1500 chars (min 10)</span>
            </div>

            {/* Step 4: Photo Evidence Upload */}
            <div className='report-section'>
              <label className='section-label'>
                Upload Photos / Evidence <span className='optional-tag'>(Optional, up to 4 images, max 5MB each)</span>
              </label>
              <div className='photo-upload-container'>
                <label className='upload-trigger-box'>
                  <input type='file' multiple accept='image/*' onChange={handleFileChange} hidden />
                  <span className='camera-icon'>📸</span>
                  <span>Add Photo Evidence</span>
                </label>

                {previews.map((src, i) => (
                  <div key={i} className='preview-thumbnail'>
                    <img src={src} alt='Evidence' />
                    <button type='button' onClick={() => handleRemoveImage(i)} className='remove-thumb-btn'>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className='report-modal-footer'>
              <button type='button' className='cancel-btn' onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type='submit' className='submit-ticket-btn' disabled={submitting}>
                {submitting ? 'Submitting Dispute...' : 'Submit Support Request 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal;
