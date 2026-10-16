import React, { useEffect, useState } from 'react';
import './MyRestaurant.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyRestaurant = ({ url, token }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [formData, setFormData] = useState({
    description: '',
    cuisine: '',
    phone: '',
    fssaiLicenseNumber: '',
    openTime: '09:00',
    closeTime: '23:00',
    avgPrepTimeMinutes: 25,
    packagingFee: 20,
    isOpen: true
  });

  const [docType, setDocType] = useState('FSSAI');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchMyRestaurant = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/restaurant/my-restaurant`, {
        headers: { token }
      });
      if (res.data.success) {
        const r = res.data.restaurant;
        setRestaurant(r);
        setFormData({
          description: r.description || '',
          cuisine: Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine || '',
          phone: r.phone || '',
          fssaiLicenseNumber: r.fssaiLicenseNumber || '',
          openTime: r.openingHours?.open || '09:00',
          closeTime: r.openingHours?.close || '23:00',
          avgPrepTimeMinutes: r.avgPrepTimeMinutes || 25,
          packagingFee: r.packagingFee || 20,
          isOpen: r.isOpen !== undefined ? r.isOpen : true
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurant profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, [token]);

  const handleToggleKitchenOpen = async () => {
    const updatedIsOpen = !formData.isOpen;
    setFormData((prev) => ({ ...prev, isOpen: updatedIsOpen }));
    try {
      const res = await axios.put(
        `${url}/api/restaurant/my-restaurant`,
        { isOpen: updatedIsOpen },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`Kitchen is now ${updatedIsOpen ? '🟢 OPEN (Accepting Orders)' : '🔴 CLOSED'}`);
        setRestaurant(res.data.restaurant);
      }
    } catch (err) {
      toast.error('Failed to update kitchen status');
    }
  };

  const handleToggleRushMode = async (isPaused, durationMinutes = 30) => {
    try {
      const res = await axios.post(
        `${url}/api/restaurant/rush-mode`,
        {
          isPaused,
          durationMinutes,
          pauseReason: 'Peak Kitchen Demand'
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchMyRestaurant();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rush mode');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(
        `${url}/api/restaurant/my-restaurant`,
        {
          description: formData.description,
          cuisine: formData.cuisine,
          phone: formData.phone,
          fssaiLicenseNumber: formData.fssaiLicenseNumber,
          openingHours: { open: formData.openTime, close: formData.closeTime },
          avgPrepTimeMinutes: formData.avgPrepTimeMinutes,
          packagingFee: formData.packagingFee
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success('Restaurant profile updated successfully!');
        setRestaurant(res.data.restaurant);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please choose a document file (PDF or image)');
      return;
    }

    setUploadingDoc(true);
    const data = new FormData();
    data.append('docType', docType);
    data.append('document', docFile);

    try {
      const res = await axios.post(`${url}/api/restaurant/documents`, data, {
        headers: { token, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`✓ ${docType} document uploaded for admin review!`);
        setDocFile(null);
        fetchMyRestaurant();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className='admin-page-container'>
        <p className='loading-msg'>Loading restaurant profile...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className='admin-page-container'>
        <div className='empty-state-box'>
          <h3>No Restaurant Profile Found</h3>
          <p>Please contact platform administration or complete your partner onboarding.</p>
        </div>
      </div>
    );
  }

  const status = restaurant.verificationStatus || 'pending';

  return (
    <div className='admin-page-container'>
      {/* Verification Status Banner */}
      <div className={`partner-status-banner banner-${status}`}>
        <div className='banner-left-info'>
          <span className='banner-icon'>
            {status === 'approved' ? '✅' : status === 'pending' ? '⏳' : status === 'rejected' ? '❌' : '⛔'}
          </span>
          <div>
            <h3 className='banner-title'>
              Application Status: {status.toUpperCase()}
            </h3>
            <p className='banner-desc'>
              {status === 'approved' &&
                'Your restaurant is active and publicly visible on QuickBites! Customers in your area can browse your menu and order.'}
              {status === 'pending' &&
                'Your restaurant application is under review by our operations team. You can configure your menu and details now; it will go live once verified.'}
              {status === 'rejected' &&
                `Application Rejected: ${restaurant.rejectionReason || 'Verification failed. Please update required documents.'}`}
              {status === 'suspended' &&
                'Your restaurant has been temporarily suspended. Please contact platform support.'}
            </p>
          </div>
        </div>

        {/* Live Kitchen Open/Closed Master Switch & Rush Mode */}
        {status === 'approved' && (
          <div className='kitchen-controls-group'>
            <div className='kitchen-switch-box'>
              <span className='switch-lbl'>Accepting Orders:</span>
              <button
                type='button'
                className={`btn-kitchen-toggle ${formData.isOpen ? 'open' : 'closed'}`}
                onClick={handleToggleKitchenOpen}
              >
                {formData.isOpen ? '🟢 KITCHEN OPEN' : '🔴 KITCHEN CLOSED'}
              </button>
            </div>

            {/* Rush Mode Widget */}
            <div className='rush-mode-box'>
              <div className='rush-mode-header'>
                <span className='rush-title'>⚡ Rush Mode:</span>
                {restaurant.rushMode?.isPaused ? (
                  <span className='rush-badge active'>
                    ⏸️ PAUSED ({restaurant.rushMode.pausedUntil ? new Date(restaurant.rushMode.pausedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Manual'})
                  </span>
                ) : (
                  <span className='rush-badge idle'>🟢 Normal Flow</span>
                )}
              </div>
              <div className='rush-action-btns'>
                {restaurant.rushMode?.isPaused ? (
                  <button
                    type='button'
                    className='btn-rush-resume'
                    onClick={() => handleToggleRushMode(false)}
                  >
                    ▶️ Resume Ordering
                  </button>
                ) : (
                  <>
                    <button
                      type='button'
                      className='btn-rush-pause'
                      onClick={() => handleToggleRushMode(true, 15)}
                    >
                      ⏸️ Pause 15m
                    </button>
                    <button
                      type='button'
                      className='btn-rush-pause'
                      onClick={() => handleToggleRushMode(true, 30)}
                    >
                      ⏸️ Pause 30m
                    </button>
                    <button
                      type='button'
                      className='btn-rush-pause'
                      onClick={() => handleToggleRushMode(true, 45)}
                    >
                      ⏸️ Pause 45m
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='my-restaurant-layout'>
        {/* Left: General & Kitchen Settings */}
        <div className='rest-panel-card'>
          <h3>🏢 Restaurant Profile & Timings</h3>
          <form onSubmit={handleSaveProfile} className='rest-form'>
            <div className='portal-input-group'>
              <label>Restaurant Name</label>
              <input type='text' value={restaurant.name} disabled className='input-disabled' />
              <small className='form-hint'>To change legal business name, please contact platform administration.</small>
            </div>

            <div className='portal-input-group'>
              <label>Address & Locality</label>
              <input
                type='text'
                value={`${restaurant.address?.street}, ${restaurant.address?.city} • ${restaurant.address?.pincode}`}
                disabled
                className='input-disabled'
              />
            </div>

            <div className='portal-input-group'>
              <label>About / Tagline</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Delicious fresh meals prepared daily'
              />
            </div>

            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Cuisines (comma separated)</label>
                <input
                  type='text'
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                />
              </div>
              <div className='portal-input-group'>
                <label>Restaurant Contact Phone</label>
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Opening Time</label>
                <input
                  type='time'
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                />
              </div>
              <div className='portal-input-group'>
                <label>Closing Time</label>
                <input
                  type='time'
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                />
              </div>
            </div>

            <div className='portal-grid-2'>
              <div className='portal-input-group'>
                <label>Average Prep Time (Minutes)</label>
                <input
                  type='number'
                  min='5'
                  max='120'
                  value={formData.avgPrepTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, avgPrepTimeMinutes: e.target.value })}
                />
              </div>
              <div className='portal-input-group'>
                <label>Packaging Fee per Order (₹)</label>
                <input
                  type='number'
                  min='0'
                  max='60'
                  value={formData.packagingFee}
                  onChange={(e) => setFormData({ ...formData, packagingFee: e.target.value })}
                />
              </div>
            </div>

            <div className='portal-input-group'>
              <label>FSSAI License Number</label>
              <input
                type='text'
                value={formData.fssaiLicenseNumber}
                onChange={(e) => setFormData({ ...formData, fssaiLicenseNumber: e.target.value })}
                placeholder='14-digit FSSAI Number'
              />
            </div>

            <button type='submit' className='btn-portal-submit' disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Profile Details ✓'}
            </button>
          </form>
        </div>

        {/* Right: Commercials & KYC Documents */}
        <div className='rest-sidebar-column'>
          {/* Commercials Summary */}
          <div className='rest-panel-card'>
            <h3>📊 Platform Commercials</h3>
            <div className='commercials-list'>
              <div className='commercial-row'>
                <span>Commission Rate:</span>
                <b>{restaurant.commissionRate || 15}% per order</b>
              </div>
              <div className='commercial-row'>
                <span>Delivery Coverage:</span>
                <b>{restaurant.deliveryRadiusKm || 7} km radius</b>
              </div>
              <div className='commercial-row'>
                <span>Bank Account:</span>
                <b>
                  {restaurant.bankDetails?.accountNumber
                    ? `••••${restaurant.bankDetails.accountNumber.slice(-4)} (${restaurant.bankDetails.ifscCode})`
                    : 'Not Added'}
                </b>
              </div>
              <div className='commercial-row'>
                <span>UPI ID:</span>
                <b>{restaurant.bankDetails?.upiId || 'Not Added'}</b>
              </div>
            </div>
          </div>

          {/* KYC Document Upload Card */}
          <div className='rest-panel-card'>
            <h3>📑 KYC & Food Safety Documents</h3>
            <p className='form-hint'>Upload your FSSAI certificate, GSTIN, or Bank Passbook for fast-track verification.</p>

            <form onSubmit={handleDocumentUpload} className='doc-upload-form'>
              <div className='portal-input-group'>
                <label>Document Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value='FSSAI'>FSSAI Food License</option>
                  <option value='GST'>GST Registration Certificate</option>
                  <option value='PAN'>Business PAN Card</option>
                  <option value='BANK_PASSBOOK'>Bank Passbook / Cheque</option>
                </select>
              </div>

              <div className='portal-input-group'>
                <label>Select File (PDF / Image)</label>
                <input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(e) => setDocFile(e.target.files[0])}
                  required
                />
              </div>

              <button type='submit' className='btn-doc-upload' disabled={uploadingDoc}>
                {uploadingDoc ? 'Uploading...' : 'Upload KYC Document 📤'}
              </button>
            </form>

            {/* List of uploaded documents */}
            {restaurant.documents && restaurant.documents.length > 0 && (
              <div className='uploaded-docs-list'>
                <h4>Submitted Documents:</h4>
                {restaurant.documents.map((d, idx) => (
                  <div key={idx} className='doc-item-row'>
                    <span>📄 {d.docType}</span>
                    <span className={`doc-tag ${d.verified ? 'verified' : 'pending'}`}>
                      {d.verified ? '✓ Verified' : '⏳ Review Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRestaurant;
