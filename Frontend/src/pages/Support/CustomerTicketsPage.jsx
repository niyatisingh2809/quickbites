import React, { useEffect, useState, useContext } from 'react';
import './CustomerTicketsPage.css';
import { StoreContext } from '../../Context/StoreContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_BADGES = {
  Open: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: '🔵 Open' },
  'Under Review': { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: '⏳ Under Review' },
  'Awaiting Customer': { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', label: '💬 Awaiting Info' },
  Resolved: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '✅ Resolved' },
  Closed: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: '🔒 Closed' }
};

const CustomerTicketsPage = () => {
  const { url, token } = useContext(StoreContext);
  const { ticketId: paramTicketId } = useParams();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const activeToken = token || localStorage.getItem('token');

  const fetchTickets = async () => {
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/support/my-tickets`, {
        headers: { token: activeToken }
      });
      if (res.data.success) {
        setTickets(res.data.tickets || []);
        if (paramTicketId) {
          const matched = (res.data.tickets || []).find((t) => t._id === paramTicketId);
          if (matched) {
            fetchTicketDetail(paramTicketId);
          }
        } else if (res.data.tickets?.length > 0 && !selectedTicket) {
          fetchTicketDetail(res.data.tickets[0]._id);
        }
      }
    } catch (err) {
      console.warn('Could not load tickets:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (id) => {
    try {
      const res = await axios.get(`${url}/api/support/ticket/${id}`, {
        headers: { token: activeToken }
      });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setActionError('');
      }
    } catch (err) {
      console.warn('Error fetching ticket details:', err.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [paramTicketId, activeToken]);

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    navigate(`/support/ticket/${t._id}`);
    fetchTicketDetail(t._id);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await axios.post(
        `${url}/api/support/ticket/${selectedTicket._id}/reply`,
        { message: replyMessage.trim() },
        { headers: { token: activeToken } }
      );
      if (res.data.success) {
        setReplyMessage('');
        setSelectedTicket(res.data.ticket);
        setActionSuccess('Reply sent successfully.');
        fetchTickets();
      } else {
        setActionError(res.data.message || 'Failed to send reply');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not send message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim() || !selectedTicket) return;

    setActionError('');
    setActionSuccess('');

    try {
      const res = await axios.post(
        `${url}/api/support/ticket/${selectedTicket._id}/reopen`,
        { reason: reopenReason.trim() },
        { headers: { token: activeToken } }
      );
      if (res.data.success) {
        setShowReopenBox(false);
        setReopenReason('');
        setSelectedTicket(res.data.ticket);
        setActionSuccess('Ticket reopened and queued for review.');
        fetchTickets();
      } else {
        setActionError(res.data.message || 'Failed to reopen ticket');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to reopen ticket');
    }
  };

  if (!activeToken) {
    return (
      <div className='tickets-page-container' style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>🔐 Sign in to view your Support Tickets</h3>
        <p style={{ color: '#64748b' }}>Please log in to your QuickBites account to view your past complaints.</p>
      </div>
    );
  }

  return (
    <div className='tickets-page-container'>
      <div className='tickets-header-banner'>
        <div>
          <h2>🎫 Support & Dispute Center</h2>
          <p>Track your reported order issues, talk with our care team, and review resolutions.</p>
        </div>
        <button className='back-orders-btn' onClick={() => navigate('/myorders')}>
          ← Back to Orders
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading your support tickets...</div>
      ) : tickets.length === 0 ? (
        <div className='no-tickets-card'>
          <span style={{ fontSize: '48px' }}>🎉</span>
          <h3>No Active Support Tickets</h3>
          <p>All your orders are running smoothly! If you ever have an issue with a meal, you can report it directly from your Order History.</p>
          <button className='go-orders-btn' onClick={() => navigate('/myorders')}>
            View My Orders
          </button>
        </div>
      ) : (
        <div className='tickets-layout'>
          {/* Left Panel: Ticket List */}
          <div className='tickets-sidebar-list'>
            <h4>My Tickets ({tickets.length})</h4>
            {tickets.map((t) => {
              const badge = STATUS_BADGES[t.status] || STATUS_BADGES.Open;
              const isSelected = selectedTicket?._id === t._id;
              return (
                <div
                  key={t._id}
                  className={`ticket-summary-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectTicket(t)}
                >
                  <div className='ticket-card-top'>
                    <span className='ticket-ref'>#{t.ticketNumber}</span>
                    <span
                      className='ticket-status-pill'
                      style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className='ticket-card-order'>
                    Order: <strong>{t.orderNumber}</strong> • {t.restaurantName || 'Restaurant'}
                  </p>
                  <p className='ticket-card-category'>{t.issueCategory.replace(/_/g, ' ')}</p>
                  <span className='ticket-card-time'>
                    {new Date(t.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Conversation Stream */}
          <div className='ticket-main-thread'>
            {selectedTicket ? (
              <>
                <div className='thread-header'>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <h3>Ticket #{selectedTicket.ticketNumber}</h3>
                      <span
                        className='ticket-status-pill'
                        style={{
                          background: (STATUS_BADGES[selectedTicket.status] || STATUS_BADGES.Open).bg,
                          color: (STATUS_BADGES[selectedTicket.status] || STATUS_BADGES.Open).color
                        }}
                      >
                        {(STATUS_BADGES[selectedTicket.status] || STATUS_BADGES.Open).label}
                      </span>
                    </div>
                    <p className='thread-meta'>
                      Order <strong>#{selectedTicket.orderNumber}</strong> • Restaurant:{' '}
                      <strong>{selectedTicket.restaurantName || selectedTicket.restaurantId?.name}</strong> • Reported on{' '}
                      {new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {actionError && <div className='thread-alert alert-error'>⚠️ {actionError}</div>}
                {actionSuccess && <div className='thread-alert alert-success'>✅ {actionSuccess}</div>}

                {/* Affected Items Snapshot */}
                {selectedTicket.affectedItems && selectedTicket.affectedItems.length > 0 && (
                  <div className='affected-items-banner'>
                    <strong>Affected Dish(es):</strong>
                    <div className='affected-chips-row'>
                      {selectedTicket.affectedItems.map((item, idx) => (
                        <span key={idx} className='affected-chip'>
                          {item.name} × <strong>{item.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Card if Resolved/Closed */}
                {selectedTicket.resolution?.finalResolution && (
                  <div className='resolution-card'>
                    <div className='resolution-header'>
                      <span>🎯 Official Resolution:</span>
                      <span className='res-type-badge'>
                        {selectedTicket.resolution.resolutionType?.replace(/_/g, ' ') || 'Resolved'}
                      </span>
                    </div>
                    <p className='res-text'>{selectedTicket.resolution.finalResolution}</p>
                    {selectedTicket.status === 'Resolved' && (
                      <div className='reopen-prompt'>
                        <span>Still facing an issue? You can reopen this case within 7 days.</span>
                        {!showReopenBox ? (
                          <button className='reopen-btn' onClick={() => setShowReopenBox(true)}>
                            Reopen Ticket
                          </button>
                        ) : (
                          <div className='reopen-box'>
                            <textarea
                              rows='2'
                              placeholder='Why are you reopening this dispute? (Explain clearly)'
                              value={reopenReason}
                              onChange={(e) => setReopenReason(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                              <button className='cancel-btn' onClick={() => setShowReopenBox(false)}>
                                Cancel
                              </button>
                              <button className='confirm-reopen-btn' onClick={handleReopen}>
                                Confirm Reopen
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Stream */}
                <div className='messages-stream'>
                  {(selectedTicket.messages || []).map((msg, i) => {
                    const isCustomer = msg.senderRole === 'customer';
                    const isSystem = msg.senderRole === 'system';
                    return (
                      <div
                        key={i}
                        className={`message-bubble-wrapper ${
                          isSystem ? 'system-msg' : isCustomer ? 'customer-msg' : 'agent-msg'
                        }`}
                      >
                        <div className='message-sender-row'>
                          <span className='sender-name'>
                            {isCustomer ? '👤 You (Customer)' : isSystem ? '⚡ QuickBites System' : '🛡️ QuickBites Care Team'}
                          </span>
                          <span className='msg-time'>
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className='message-content'>{msg.message}</p>

                        {/* Attachments if any */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className='msg-attachments-grid'>
                            {msg.attachments.map((att, aIdx) => (
                              <a key={aIdx} href={att.url} target='_blank' rel='noopener noreferrer'>
                                <img src={att.url} alt='Attachment' />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reply Box (Disabled if Closed) */}
                {selectedTicket.status !== 'Closed' && (
                  <form className='ticket-reply-form' onSubmit={handleSendReply}>
                    <input
                      type='text'
                      placeholder='Type your reply or response here...'
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      disabled={sendingReply}
                    />
                    <button type='submit' disabled={sendingReply || !replyMessage.trim()}>
                      {sendingReply ? 'Sending...' : 'Send Reply 🚀'}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                Select a ticket from the left panel to view the dispute conversation.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTicketsPage;
