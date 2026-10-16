import React, { useEffect, useState } from 'react';
import './Restaurants.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Restaurants = ({ url, token }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    restaurantId: null,
    restaurantName: '',
    reason: ''
  });

  // Settings modal state
  const [settingsModal, setSettingsModal] = useState({
    isOpen: false,
    restaurantId: null,
    restaurantName: '',
    commissionRate: 15,
    deliveryRadiusKm: 7,
    packagingFee: 20
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${url}/api/restaurant/admin/list?status=${filterStatus}&search=${encodeURIComponent(searchTerm)}`,
        { headers: { token } }
      );
      if (res.data.success) {
        setRestaurants(res.data.restaurants || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch restaurant applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filterStatus, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleUpdateStatus = async (restaurantId, status, rejectionReason = '') => {
    try {
      const res = await axios.patch(
        `${url}/api/restaurant/admin/${restaurantId}/status`,
        { status, rejectionReason },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchRestaurants();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openRejectModal = (r) => {
    setRejectModal({
      isOpen: true,
      restaurantId: r._id,
      restaurantName: r.name,
      reason: ''
    });
  };

  const submitRejection = () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Please enter a rejection reason for the partner');
      return;
    }
    handleUpdateStatus(rejectModal.restaurantId, 'rejected', rejectModal.reason.trim());
    setRejectModal({ isOpen: false, restaurantId: null, restaurantName: '', reason: '' });
  };

  const openSettingsModal = (r) => {
    setSettingsModal({
      isOpen: true,
      restaurantId: r._id,
      restaurantName: r.name,
      commissionRate: r.commissionRate || 15,
      deliveryRadiusKm: r.deliveryRadiusKm || 7,
      packagingFee: r.packagingFee || 20
    });
  };

  const submitSettings = async () => {
    try {
      const res = await axios.patch(
        `${url}/api/restaurant/admin/${settingsModal.restaurantId}/settings`,
        {
          commissionRate: settingsModal.commissionRate,
          deliveryRadiusKm: settingsModal.deliveryRadiusKm,
          packagingFee: settingsModal.packagingFee
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success('Restaurant commercial settings updated!');
        setSettingsModal({ ...settingsModal, isOpen: false });
        fetchRestaurants();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const pendingCount = restaurants.filter((r) => r.verificationStatus === 'pending').length;

  return (
    <div className='admin-page-container'>
      <div className='page-header-row'>
        <div>
          <h2>🏪 Restaurant Partner Management</h2>
          <p className='page-subtext'>Review partner applications, verify KYC details, and configure commission rates.</p>
        </div>
        <form onSubmit={handleSearchSubmit} className='search-inline-form'>
          <input
            type='text'
            placeholder='Search by name, city, FSSAI...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='submit' className='btn-filter-search'>Search</button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className='status-filter-pills'>
        <button
          className={`filter-pill-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Applications ({restaurants.length})
        </button>
        <button
          className={`filter-pill-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          ⏳ Pending Review {pendingCount > 0 && <span className='badge-pill count-alert'>{pendingCount}</span>}
        </button>
        <button
          className={`filter-pill-btn ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          ✅ Approved & Live
        </button>
        <button
          className={`filter-pill-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          ❌ Rejected
        </button>
        <button
          className={`filter-pill-btn ${filterStatus === 'suspended' ? 'active' : ''}`}
          onClick={() => setFilterStatus('suspended')}
        >
          ⛔ Suspended
        </button>
      </div>

      {/* Restaurant List */}
      {loading ? (
        <p className='loading-msg'>Loading partner applications...</p>
      ) : restaurants.length === 0 ? (
        <div className='empty-state-box'>
          <p>No restaurants found matching "{filterStatus}"</p>
        </div>
      ) : (
        <div className='restaurants-grid'>
          {restaurants.map((r) => (
            <div key={r._id} className='restaurant-admin-card'>
              <div className='card-top-header'>
                <div>
                  <h3 className='restaurant-title'>{r.name}</h3>
                  <span className='restaurant-locality'>📍 {r.address?.city} • {r.address?.street}</span>
                </div>
                <span className={`status-badge status-${r.verificationStatus}`}>
                  {r.verificationStatus.toUpperCase()}
                </span>
              </div>

              <div className='card-meta-details'>
                <p><strong>Cuisines:</strong> {Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine}</p>
                <p><strong>Owner:</strong> {r.ownerId?.name || 'Partner'} ({r.ownerId?.email || r.email})</p>
                <p><strong>Phone:</strong> {r.phone}</p>
                <p><strong>FSSAI License:</strong> {r.fssaiLicenseNumber || <span className='missing-tag'>Not Provided</span>}</p>
                <p><strong>Timings:</strong> {r.openingHours?.open || '09:00'} - {r.openingHours?.close || '23:00'}</p>
                <p><strong>Commission:</strong> <span className='commission-tag'>{r.commissionRate || 15}%</span> | <strong>Radius:</strong> {r.deliveryRadiusKm || 7} km</p>
                {r.rejectionReason && (
                  <p className='rejection-note'><strong>Reason:</strong> {r.rejectionReason}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className='card-actions-row'>
                {r.verificationStatus === 'pending' && (
                  <>
                    <button
                      type='button'
                      className='btn-action-approve'
                      onClick={() => handleUpdateStatus(r._id, 'approved')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      type='button'
                      className='btn-action-reject'
                      onClick={() => openRejectModal(r)}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {r.verificationStatus === 'approved' && (
                  <>
                    <button
                      type='button'
                      className='btn-action-suspend'
                      onClick={() => handleUpdateStatus(r._id, 'suspended', 'Suspended by admin')}
                    >
                      Suspend
                    </button>
                    <button
                      type='button'
                      className='btn-action-settings'
                      onClick={() => openSettingsModal(r)}
                    >
                      ⚙️ Commercials
                    </button>
                  </>
                )}

                {r.verificationStatus === 'suspended' && (
                  <button
                    type='button'
                    className='btn-action-approve'
                    onClick={() => handleUpdateStatus(r._id, 'approved')}
                  >
                    Re-activate
                  </button>
                )}

                {r.verificationStatus === 'rejected' && (
                  <button
                    type='button'
                    className='btn-action-approve'
                    onClick={() => handleUpdateStatus(r._id, 'approved')}
                  >
                    Re-evaluate & Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className='modal-overlay'>
          <div className='modal-card'>
            <h3>Reject Restaurant Application</h3>
            <p className='modal-desc'>Provide a clear reason for rejecting <strong>{rejectModal.restaurantName}</strong>:</p>
            <textarea
              className='modal-textarea'
              placeholder='e.g. Invalid FSSAI license / Food safety documentation missing...'
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              rows={4}
            />
            <div className='modal-actions'>
              <button
                type='button'
                className='btn-modal-cancel'
                onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
              >
                Cancel
              </button>
              <button
                type='button'
                className='btn-modal-confirm-reject'
                onClick={submitRejection}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Settings Modal */}
      {settingsModal.isOpen && (
        <div className='modal-overlay'>
          <div className='modal-card'>
            <h3>Commercial Settings: {settingsModal.restaurantName}</h3>
            <div className='modal-inputs-form'>
              <div className='portal-input-group'>
                <label>Platform Commission (%)</label>
                <input
                  type='number'
                  min='0'
                  max='50'
                  value={settingsModal.commissionRate}
                  onChange={(e) => setSettingsModal({ ...settingsModal, commissionRate: e.target.value })}
                />
              </div>
              <div className='portal-input-group'>
                <label>Delivery Radius (km)</label>
                <input
                  type='number'
                  min='1'
                  max='30'
                  value={settingsModal.deliveryRadiusKm}
                  onChange={(e) => setSettingsModal({ ...settingsModal, deliveryRadiusKm: e.target.value })}
                />
              </div>
              <div className='portal-input-group'>
                <label>Packaging Fee (₹)</label>
                <input
                  type='number'
                  min='0'
                  max='60'
                  value={settingsModal.packagingFee}
                  onChange={(e) => setSettingsModal({ ...settingsModal, packagingFee: e.target.value })}
                />
              </div>
            </div>
            <div className='modal-actions'>
              <button
                type='button'
                className='btn-modal-cancel'
                onClick={() => setSettingsModal({ ...settingsModal, isOpen: false })}
              >
                Cancel
              </button>
              <button
                type='button'
                className='btn-modal-save'
                onClick={submitSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
