import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SupportTickets.css';

const SupportTickets = ({ url, token, user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Modal actions state
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Status & resolution update state
  const [newStatus, setNewStatus] = useState('');
  const [proposedResolution, setProposedResolution] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer Complaint Resolution');
  const [processingRefund, setProcessingRefund] = useState(false);

  const isSuperAdmin = user?.role === 'admin';

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/support/admin/list`, {
        headers: { token }
      });
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      } else {
        toast.error('Failed to load tickets');
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
      toast.error(err.response?.data?.message || 'Error connecting to support service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTickets();
  }, [token]);

  const handleOpenTicket = async (ticketId) => {
    try {
      const res = await axios.get(`${url}/api/support/ticket/${ticketId}`, {
        headers: { token }
      });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setNewStatus(res.data.ticket.status);
        setProposedResolution(res.data.ticket.resolution?.proposedResolution || '');
      }
    } catch (err) {
      toast.error('Could not load ticket details');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSubmittingReply(true);
    try {
      const res = await axios.post(
        `${url}/api/support/ticket/${selectedTicket._id}/reply`,
        { message: replyText.trim(), isInternalNote },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(isInternalNote ? '🔒 Internal note added' : '✓ Reply sent to customer');
        setReplyText('');
        setIsInternalNote(false);
        handleOpenTicket(selectedTicket._id);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;

    setUpdatingStatus(true);
    try {
      const payload = {
        status: newStatus,
        proposedResolution
      };
      if (newStatus === 'Resolved' || newStatus === 'Closed') {
        payload.finalResolution = proposedResolution || 'Issue investigated and resolved by support team.';
        payload.resolutionType = 'info_provided';
      }

      const res = await axios.patch(
        `${url}/api/support/ticket/${selectedTicket._id}/status`,
        payload,
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`Status updated to [${newStatus}]`);
        handleOpenTicket(selectedTicket._id);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !refundAmount || Number(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    setProcessingRefund(true);
    try {
      const payload = {
        ticketId: selectedTicket._id,
        amountRupees: Number(refundAmount),
        reason: refundReason,
        idempotencyKey: `REF_${selectedTicket.orderNumber}_${Date.now()}`
      };

      const res = await axios.post(`${url}/api/support/admin/refund`, payload, {
        headers: { token }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Refund successfully processed');
        setShowRefundModal(false);
        setRefundAmount('');
        handleOpenTicket(selectedTicket._id);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund processing failed');
    } finally {
      setProcessingRefund(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open': return 'badge-open';
      case 'Under Review': return 'badge-review';
      case 'Awaiting Customer': return 'badge-awaiting';
      case 'Resolved': return 'badge-resolved';
      case 'Closed': return 'badge-closed';
      default: return '';
    }
  };

  return (
    <div className='support-tickets-page'>
      {/* Page Header */}
      <div className='st-header'>
        <div>
          <h2>🎧 Customer Support & Complaints Desk</h2>
          <p>Triage order disputes, investigate delivery issues, and issue audited refunds.</p>
        </div>
        <button className='st-refresh-btn' onClick={fetchTickets} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh List'}
        </button>
      </div>

      {/* Filter Row */}
      <div className='st-filters-bar'>
        <div className='st-filter-group'>
          <label>Status Filter:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value='All'>All Statuses ({tickets.length})</option>
            <option value='Open'>Open</option>
            <option value='Under Review'>Under Review</option>
            <option value='Awaiting Customer'>Awaiting Customer</option>
            <option value='Resolved'>Resolved</option>
            <option value='Closed'>Closed</option>
          </select>
        </div>

        <div className='st-filter-group'>
          <label>Priority:</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value='All'>All Priorities</option>
            <option value='urgent'>Urgent</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      {loading && tickets.length === 0 ? (
        <div className='st-loading'>Loading support tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className='st-empty-state'>
          <p style={{ fontSize: '32px', margin: 0 }}>🎉</p>
          <h4>No complaints found matching this filter</h4>
          <p>Great job! All customer orders are running smoothly.</p>
        </div>
      ) : (
        <div className='st-table-wrapper'>
          <table className='st-table'>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Issue Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <span className='st-ticket-number'>{t.ticketNumber}</span>
                  </td>
                  <td>
                    <strong>#{t.orderNumber}</strong>
                  </td>
                  <td>{t.customerId?.name || 'Customer'}</td>
                  <td>{t.restaurantId?.name || 'Kitchen'}</td>
                  <td>
                    <span className='st-category-chip'>
                      {t.issueCategory.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`st-priority-pill ${t.priority}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`st-status-badge ${getStatusBadgeClass(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className='st-view-btn'
                      onClick={() => handleOpenTicket(t._id)}
                    >
                      View & Triage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className='st-modal-backdrop' onClick={() => setSelectedTicket(null)}>
          <div className='st-modal-container' onClick={(e) => e.stopPropagation()}>
            <div className='st-modal-header'>
              <div>
                <span className={`st-status-badge ${getStatusBadgeClass(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <h3 style={{ margin: '6px 0 0 0', color: '#0f172a' }}>
                  {selectedTicket.ticketNumber} • Order #{selectedTicket.orderNumber}
                </h3>
              </div>
              <button className='st-modal-close' onClick={() => setSelectedTicket(null)}>
                ✕
              </button>
            </div>

            <div className='st-modal-body'>
              {/* Top Overview Cards */}
              <div className='st-overview-grid'>
                <div className='st-overview-card'>
                  <span className='st-overview-label'>Customer Details</span>
                  <strong>{selectedTicket.customerId?.name}</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    {selectedTicket.customerId?.email} • {selectedTicket.customerId?.phone || 'No phone'}
                  </p>
                </div>

                <div className='st-overview-card'>
                  <span className='st-overview-label'>Restaurant</span>
                  <strong>{selectedTicket.restaurantId?.name}</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    {selectedTicket.restaurantId?.phone || 'Kitchen Hotline'}
                  </p>
                </div>

                <div className='st-overview-card'>
                  <span className='st-overview-label'>Issue Classification</span>
                  <strong style={{ textTransform: 'capitalize' }}>
                    {selectedTicket.issueCategory.replace(/_/g, ' ')}
                  </strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#dc2626' }}>
                    Priority: {selectedTicket.priority?.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Complaint Description */}
              <div className='st-section-card'>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>📝 Complaint Description</h4>
                <p style={{ margin: 0, color: '#334155', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Affected Items if specified */}
              {selectedTicket.affectedItems && selectedTicket.affectedItems.length > 0 && (
                <div className='st-section-card'>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>⚠️ Reported Affected Items</h4>
                  <div className='st-affected-items-list'>
                    {selectedTicket.affectedItems.map((item, idx) => (
                      <div key={idx} className='st-affected-item-row'>
                        <div>
                          <strong>{item.name}</strong> (Purchased: {item.purchasedQuantity || 1})
                          {item.issueDescription && (
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                              Note: {item.issueDescription}
                            </p>
                          )}
                        </div>
                        <span style={{ color: '#dc2626', fontWeight: '700' }}>
                          Qty affected: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className='st-section-card'>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>📷 Customer Photo Evidence</h4>
                  <div className='st-photos-grid'>
                    {selectedTicket.attachments.map((photo, idx) => (
                      <a key={idx} href={photo.url} target='_blank' rel='noopener noreferrer'>
                        <img src={photo.url} alt={`Evidence ${idx + 1}`} className='st-photo-thumbnail' />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Stream */}
              <div className='st-section-card'>
                <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>💬 Conversation & Notes Stream</h4>
                <div className='st-chat-stream'>
                  {(selectedTicket.messages || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`st-chat-msg ${
                        msg.isInternalNote
                          ? 'msg-internal'
                          : msg.senderRole === 'customer'
                          ? 'msg-customer'
                          : 'msg-agent'
                      }`}
                    >
                      <div className='st-msg-header'>
                        <span>
                          {msg.isInternalNote && '🔒 INTERNAL TEAM NOTE — '}
                          <strong>{msg.senderName}</strong> ({msg.senderRole})
                        </span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className='st-msg-text'>{msg.message}</div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form className='st-reply-form' onSubmit={handleSendReply}>
                  <textarea
                    rows={3}
                    placeholder='Type a message to customer or write a private internal team note...'
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className='st-reply-actions'>
                    <label className='st-internal-checkbox'>
                      <input
                        type='checkbox'
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                      />
                      <span>🔒 Post as Private Internal Note (Customer will not see this)</span>
                    </label>
                    <button type='submit' disabled={submittingReply || !replyText.trim()} className='st-send-reply-btn'>
                      {submittingReply ? 'Sending...' : isInternalNote ? 'Save Internal Note 🔒' : 'Send to Customer ➔'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Status Update & Resolution Controls */}
              <div className='st-section-card'>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>⚙️ Resolution & Ticket Lifecycle</h4>
                <div className='st-lifecycle-row'>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Update Status:</label>
                    <select
                      className='st-select'
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value='Open'>Open</option>
                      <option value='Under Review'>Under Review</option>
                      <option value='Awaiting Customer'>Awaiting Customer</option>
                      <option value='Resolved'>Resolved</option>
                      <option value='Closed'>Closed</option>
                    </select>
                  </div>

                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Resolution Explanation / Instructions:</label>
                    <input
                      type='text'
                      className='st-input'
                      placeholder='e.g. Refund issued for missing garlic naan, rider advised.'
                      value={proposedResolution}
                      onChange={(e) => setProposedResolution(e.target.value)}
                    />
                  </div>

                  <button
                    className='st-update-btn'
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Saving...' : 'Update Status'}
                  </button>
                </div>

                {/* Refund trigger button if super admin */}
                {isSuperAdmin && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Issue Financial Compensation / Refund</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Capped at total remaining refundable order amount. Strictly audited.
                      </p>
                    </div>
                    <button
                      className='st-refund-modal-trigger'
                      onClick={() => setShowRefundModal(true)}
                    >
                      💰 Issue Refund to Customer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedTicket && (
        <div className='st-modal-backdrop' style={{ zIndex: 1100 }} onClick={() => setShowRefundModal(false)}>
          <div className='st-refund-modal-box' onClick={(e) => e.stopPropagation()}>
            <h3>💰 Issue Order Refund</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Order #{selectedTicket.orderNumber} • Ticket #{selectedTicket.ticketNumber}
            </p>

            <form onSubmit={handleIssueRefund}>
              <div style={{ margin: '14px 0' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Refund Amount (₹):</label>
                <input
                  type='number'
                  min={1}
                  className='st-input'
                  placeholder='Amount in Rupees'
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ margin: '14px 0' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Audit Settlement Reason:</label>
                <input
                  type='text'
                  className='st-input'
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                />
              </div>

              <div className='st-refund-modal-actions'>
                <button
                  type='button'
                  className='st-btn-cancel'
                  onClick={() => setShowRefundModal(false)}
                  disabled={processingRefund}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='st-btn-confirm-refund'
                  disabled={processingRefund}
                >
                  {processingRefund ? 'Authorizing Refund...' : 'Authorize Refund 🔒'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
