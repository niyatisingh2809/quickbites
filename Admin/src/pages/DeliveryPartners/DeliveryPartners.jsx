import React, { useEffect, useState } from 'react';
import './DeliveryPartners.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeliveryPartners = ({ url, token }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${url}/api/delivery/admin/list?status=${filterStatus}&search=${encodeURIComponent(searchTerm)}`,
        { headers: { token } }
      );
      if (res.data.success) {
        setRiders(res.data.riders || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch delivery partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, [filterStatus, token]);

  const handleUpdateStatus = async (riderId, status, rejectionReason = '') => {
    try {
      const res = await axios.patch(
        `${url}/api/delivery/admin/${riderId}/status`,
        { status, rejectionReason },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchRiders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rider status');
    }
  };

  const pendingCount = riders.filter((r) => r.status === 'pending').length;

  return (
    <div className='admin-page-container'>
      <div className='page-header-row'>
        <div>
          <h2>🛵 Delivery Partner Management</h2>
          <p className='page-subtext'>Approve riders, verify licenses, and monitor pilot delivery coverage.</p>
        </div>
        <div className='search-inline-form'>
          <input
            type='text'
            placeholder='Search rider name, phone, vehicle...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='button' onClick={fetchRiders} className='btn-filter-search'>Search</button>
        </div>
      </div>

      <div className='status-filter-pills'>
        <button
          className={`filter-pill-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Riders ({riders.length})
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
          ✅ Approved & Active
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

      {loading ? (
        <p className='loading-msg'>Loading delivery partners...</p>
      ) : riders.length === 0 ? (
        <div className='empty-state-box'>
          <p>No delivery partners found matching "{filterStatus}"</p>
        </div>
      ) : (
        <div className='riders-grid'>
          {riders.map((r) => (
            <div key={r._id} className='rider-admin-card'>
              <div className='card-top-header'>
                <div>
                  <h3 className='restaurant-title'>{r.fullName}</h3>
                  <span className='restaurant-locality'>📍 {r.city}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`status-badge status-${r.status}`}>{r.status.toUpperCase()}</span>
                  <span className={`duty-badge ${r.isAvailable ? 'duty-online' : 'duty-offline'}`}>
                    {r.isAvailable ? '🟢 Online' : '⚪ Offline'}
                  </span>
                </div>
              </div>

              <div className='card-meta-details'>
                <p><strong>Vehicle:</strong> {r.vehicleType?.toUpperCase()} ({r.vehicleNumber || 'No plate added'})</p>
                <p><strong>Phone:</strong> {r.phone}</p>
                <p><strong>Email:</strong> {r.email}</p>
                <p><strong>License:</strong> {r.drivingLicenseNumber || <span className='missing-tag'>Not Provided</span>}</p>
                <p><strong>Rating:</strong> ⭐ {r.rating || 4.8} | <strong>Completed Orders:</strong> {r.completedDeliveriesCount || 0}</p>
                {r.rejectionReason && (
                  <p className='rejection-note'><strong>Reason:</strong> {r.rejectionReason}</p>
                )}
              </div>

              <div className='card-actions-row'>
                {r.status === 'pending' && (
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
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleUpdateStatus(r._id, 'rejected', reason);
                      }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {r.status === 'approved' && (
                  <button
                    type='button'
                    className='btn-action-suspend'
                    onClick={() => handleUpdateStatus(r._id, 'suspended', 'Suspended by admin')}
                  >
                    Suspend Rider
                  </button>
                )}

                {(r.status === 'suspended' || r.status === 'rejected') && (
                  <button
                    type='button'
                    className='btn-action-approve'
                    onClick={() => handleUpdateStatus(r._id, 'approved')}
                  >
                    Re-activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;
