import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url, token, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [handoverCodes, setHandoverCodes] = useState({});
  const [verifyingOrder, setVerifyingOrder] = useState({});

  const isSuperAdmin = user?.role === 'admin';

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/list`, {
        headers: token ? { token } : {}
      });
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyHandover = async (orderId) => {
    const code = handoverCodes[orderId];
    if (!code || code.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit pickup handover code.');
      return;
    }
    setVerifyingOrder(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.post(
        `${url}/api/order/verify-pickup`,
        { orderId, code: code.trim() },
        { headers: token ? { token } : {} }
      );
      if (response.data.success) {
        toast.success(response.data.message || 'Handover Verified! Status moved to Out for Delivery.');
        setHandoverCodes(prev => ({ ...prev, [orderId]: '' }));
        fetchAllOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Handover Code! Rider cannot take parcel.');
    } finally {
      setVerifyingOrder(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleGetRiderCode = async (orderId) => {
    try {
      const response = await axios.get(`${url}/api/order/pickup-code/${orderId}`, {
        headers: token ? { token } : {}
      });
      if (response.data.success) {
        toast.info(`🔑 Order #${response.data.orderNumber} Rider Handover Code: ${response.data.pickupCode}`, {
          autoClose: 10000
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch rider handover code.');
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(
        `${url}/api/order/status`,
        { orderId, status: newStatus },
        { headers: token ? { token } : {} }
      );
      if (response.data.success) {
        toast.success(`Order status updated to [${newStatus}]`);
        fetchAllOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className='order add'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3>{isSuperAdmin ? '📦 Platform Live Orders' : '📦 Kitchen Orders'}</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {orders.length} total orders recorded
          </p>
        </div>
        <button
          type='button'
          onClick={fetchAllOrders}
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Orders
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px' }}>
          <p>No orders currently active.</p>
        </div>
      ) : (
        <div className='order-list'>
          {orders.map((order, index) => (
            <div key={index} className='order-item'>
              <img src={assets.parcel_icon} alt='' />
              <div>
                <div className='order-item-food'>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: item.isThali ? '6px' : '2px' }}>
                      <strong>{item.name}</strong> × {item.quantity}
                      {item.isThali && item.thaliConfiguration && (
                        <div style={{ background: '#f0f9ff', borderLeft: '3px solid #0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', marginTop: '3px' }}>
                          <span style={{ fontWeight: '700', color: '#0369a1' }}>🍱 Kitchen Customization:</span>{' '}
                          {(item.thaliConfiguration.components || []).map(c => `${c.name}${c.portion ? ` (${c.portion})` : ''}${c.quantity > 1 ? ` x${c.quantity}` : ''}`).join(', ')}
                          {item.thaliConfiguration.preparationInstructions && (
                            <div style={{ color: '#b45309', fontWeight: '700', marginTop: '2px' }}>
                              ⚠️ Kitchen Note: {item.thaliConfiguration.preparationInstructions}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className='order-item-name'>
                  {order.address?.firstName + ' ' + (order.address?.lastName || '')}
                </p>
                <div className='order-item-address'>
                  <p>{order.address?.street + ','}</p>
                  <p>
                    {order.address?.city +
                      ', ' +
                      (order.address?.state || '') +
                      ' • ' +
                      (order.address?.zipcode || '')}
                  </p>
                </div>
                <p className='order-item-phone'>📞 {order.address?.phone}</p>
                {order.deliveryInstructions && (order.deliveryInstructions.gateNotes || order.deliveryInstructions.landmark || (order.deliveryInstructions.preferences && order.deliveryInstructions.preferences.length > 0)) && (
                  <div style={{ background: '#fef3c7', borderLeft: '3px solid #d97706', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', marginTop: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#b45309' }}>🛵 Delivery Instructions:</span>
                    {order.deliveryInstructions.landmark && <div style={{ color: '#78350f', marginTop: '2px' }}>📍 <strong>Landmark:</strong> {order.deliveryInstructions.landmark}</div>}
                    {order.deliveryInstructions.gateNotes && <div style={{ color: '#78350f', marginTop: '2px' }}>🚪 <strong>Gate Note:</strong> {order.deliveryInstructions.gateNotes}</div>}
                    {order.deliveryInstructions.preferences && order.deliveryInstructions.preferences.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {order.deliveryInstructions.preferences.map(pref => (
                          <span key={pref} style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '600' }}>
                            ✓ {pref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Payment: <strong>{order.paymentMethod?.toUpperCase()}</strong> | Status:{' '}
                  <span style={{ color: order.payment ? '#16a34a' : '#d97706', fontWeight: '800' }}>
                    {order.payment ? 'PAID ✓' : 'PENDING'}
                  </span>
                </p>
              </div>
              <p>Items : {order.items?.length || 0}</p>
              <p style={{ fontWeight: '800', color: '#2563eb' }}>₹{order.amount}</p>
              <div>
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  style={{ padding: '8px', borderRadius: '8px', border: '1.5px solid #2563eb', fontWeight: '700', width: '100%' }}
                >
                  <option value='Food Processing'>Food Processing</option>
                  <option value='Preparing'>Preparing in Kitchen</option>
                  <option value='Ready for pickup'>Ready for Pickup</option>
                  <option value='Out for delivery'>Out for Delivery</option>
                  <option value='Delivered'>Delivered</option>
                  <option value='Cancelled'>Cancelled</option>
                </select>

                {(order.status === 'Ready for pickup' || order.status === 'Ready for Pickup') && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>
                      🔐 Handover Verification
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type='text'
                        maxLength={6}
                        placeholder='6-digit code'
                        value={handoverCodes[order._id] || ''}
                        onChange={(e) => setHandoverCodes({ ...handoverCodes, [order._id]: e.target.value })}
                        style={{ width: '85px', padding: '6px', borderRadius: '6px', border: '1px solid #86efac', fontWeight: '700', textAlign: 'center', letterSpacing: '2px', fontSize: '12px' }}
                      />
                      <button
                        type='button'
                        disabled={verifyingOrder[order._id]}
                        onClick={() => handleVerifyHandover(order._id)}
                        style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {verifyingOrder[order._id] ? '...' : 'Verify'}
                      </button>
                    </div>
                    {isSuperAdmin && (
                      <button
                        type='button'
                        onClick={() => handleGetRiderCode(order._id)}
                        style={{ marginTop: '6px', background: 'transparent', border: 'none', color: '#2563eb', fontSize: '10.5px', textDecoration: 'underline', cursor: 'pointer', padding: 0, display: 'block' }}
                      >
                        Admin Debug: Show Rider Code
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;