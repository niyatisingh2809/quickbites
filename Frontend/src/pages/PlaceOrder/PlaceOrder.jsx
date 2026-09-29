import React, { useState, useEffect, useContext } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PaymentGatewayModal from '../../components/PaymentGatewayModal/PaymentGatewayModal';

const PlaceOrder = ({ setShowLogin }) => {
  const {
    getTotalCartAmount,
    token,
    user,
    food_list,
    cartItems,
    url,
    setCartItems,
    discount,
    promoCode,
    deliveryAddress,
    updateDeliveryAddress
  } = useContext(StoreContext);

  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderPayload, setPendingOrderPayload] = useState(null);

  const [data, setData] = useState(() => {
    const addr = deliveryAddress || {};
    const u = user || {};
    const nameParts = (u.name || "").trim().split(" ");
    return {
      firstName: addr.firstName || nameParts[0] || "",
      lastName: addr.lastName || nameParts.slice(1).join(" ") || "",
      email: addr.email || u.email || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zipcode: addr.zipcode || "",
      country: addr.country || "India",
      phone: addr.phone || u.phone || ""
    };
  });

  // Keep delivery data in sync if user logs in on this page
  useEffect(() => {
    if (user) {
      setData((prev) => {
        const nameParts = (user.name || "").trim().split(" ");
        return {
          ...prev,
          firstName: prev.firstName || nameParts[0] || "",
          lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
          email: prev.email || user.email || ""
        };
      });
    }
  }, [user]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => {
      const updated = { ...prev, [name]: value };
      if (updateDeliveryAddress) {
        updateDeliveryAddress(updated);
      }
      return updated;
    });
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : (discount === 40 && promoCode === "FREESHIP" ? 0 : 40);
  const finalAmount = Math.max(0, subtotal - (promoCode === "FREESHIP" ? 0 : discount) + deliveryFee);

  const navigate = useNavigate();

  useEffect(() => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      if (setShowLogin) {
        setShowLogin(true);
      }
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  const placeOrder = (event) => {
    event.preventDefault();
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      if (setShowLogin) {
        setShowLogin(true);
      } else {
        alert("⚠️ Please sign in first to place your order!");
      }
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    if (orderItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Save final address to ensure next time it is remembered
    if (updateDeliveryAddress) {
      updateDeliveryAddress(data);
    }

    let orderData = {
      address: data,
      items: orderItems,
      amount: finalAmount,
      paymentMethod: paymentMethod,
      upiId: upiId || undefined,
      promoCode: promoCode || undefined,
      discount: discount || 0
    };

    setPendingOrderPayload(orderData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    const activeToken = token || localStorage.getItem("token");
    try {
      setIsSubmitting(true);
      const finalPayload = {
        ...(pendingOrderPayload || {
          address: data,
          items: food_list.filter(i => cartItems[i._id] > 0).map(i => ({ ...i, quantity: cartItems[i._id] })),
          amount: finalAmount,
          promoCode: promoCode || undefined,
          discount: discount || 0
        }),
        paymentMethod: paymentResult.paymentMethod || paymentMethod,
        transactionId: paymentResult.transactionId
      };

      let orderId;
      try {
        const response = await axios.post(url + "/api/order/placecod", finalPayload, {
          headers: { token: activeToken }
        });

        if (response.data && response.data.success) {
          orderId = response.data.orderId;
        }
      } catch (apiErr) {
        console.warn("Server order sync notice:", apiErr.message);
      }

      // Generate local tracking order if server is asleep
      if (!orderId) {
        orderId = "QB" + Math.floor(100000 + Math.random() * 900000);
      }

      // Always persist to local orders for instant retrieval
      try {
        const existingOrders = JSON.parse(localStorage.getItem("quickbites_orders")) || [];
        existingOrders.unshift({
          _id: orderId,
          ...finalPayload,
          status: "Food Processing",
          date: new Date().toISOString(),
          payment: true
        });
        localStorage.setItem("quickbites_orders", JSON.stringify(existingOrders));
      } catch (e) {}

      if (setCartItems) setCartItems({});
      try {
        localStorage.removeItem("quickbites_cart");
      } catch (e) {}

      setShowPaymentModal(false);
      navigate(`/track/${orderId}`);
    } catch (err) {
      console.error("Order error:", err);
      alert("Something went wrong. Please try again.");
      setShowPaymentModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p className="title" style={{ margin: 0 }}>Delivery Information</p>
          <span style={{ fontSize: '12px', color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
            💾 Auto-saved details
          </span>
        </div>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email Address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street Address / Flat No.' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Pincode / Zip' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone Number (+91)' />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>
          <div>
            <div className='cart-total-details'>
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            <div className='cart-total-details'>
              <p>Delivery Fee</p>
              <p>₹{deliveryFee} {promoCode === "FREESHIP" ? <span style={{ color: "green" }}>(Free)</span> : ""}</p>
            </div>
            {discount > 0 && promoCode !== "FREESHIP" && (
              <>
                <hr />
                <div className='cart-total-details' style={{ color: "green" }}>
                  <p>Promo Discount ({promoCode})</p>
                  <p>-₹{discount}</p>
                </div>
              </>
            )}
            <hr />
            <div className='cart-total-details'>
              <b>Total Payable</b>
              <b>₹{finalAmount}</b>
            </div>
          </div>

          <div className="payment-options">
            <h3 style={{ marginTop: "24px", marginBottom: "14px", fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
              Select Payment Method
            </h3>
            
            <div className="payment-options-grid">
              <label className={`payment-card ${paymentMethod === "gpay" ? "active" : ""}`}>
                <input type="radio" name="payment" value="gpay" checked={paymentMethod === "gpay"} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="pay-icon">📱</span>
                <div className="pay-details">
                  <span className="pay-title">Google Pay (UPI)</span>
                  <span className="pay-badge">Instant Cashback</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === "paytm" ? "active" : ""}`}>
                <input type="radio" name="payment" value="paytm" checked={paymentMethod === "paytm"} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="pay-icon">💙</span>
                <div className="pay-details">
                  <span className="pay-title">Paytm Wallet / UPI</span>
                  <span className="pay-badge">Flat ₹25 off</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === "phonepe" ? "active" : ""}`}>
                <input type="radio" name="payment" value="phonepe" checked={paymentMethod === "phonepe"} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="pay-icon">🟣</span>
                <div className="pay-details">
                  <span className="pay-title">PhonePe</span>
                  <span className="pay-badge">Fast UPI</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === "card" ? "active" : ""}`}>
                <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="pay-icon">💳</span>
                <div className="pay-details">
                  <span className="pay-title">Debit / Credit Card</span>
                  <span className="pay-sub">Visa, Mastercard, RuPay</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === "netbanking" ? "active" : ""}`}>
                <input type="radio" name="payment" value="netbanking" checked={paymentMethod === "netbanking"} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="pay-icon">🏦</span>
                <div className="pay-details">
                  <span className="pay-title">Net Banking</span>
                  <span className="pay-sub">SBI, HDFC, ICICI & more</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === "cod" ? "active" : ""}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} />
                <span className="pay-icon">💵</span>
                <div className="pay-details">
                  <span className="pay-title">Cash on Delivery</span>
                  <span className="pay-sub">Pay cash or UPI at doorstep</span>
                </div>
              </label>
            </div>

            {(paymentMethod === "gpay" || paymentMethod === "paytm" || paymentMethod === "phonepe") && (
              <div className="upi-input-container" style={{ marginTop: "16px" }}>
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g. mobile@upi, name@okhdfcbank) - Optional"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px"
                  }}
                />
              </div>
            )}
          </div>

          <button type='submit' disabled={isSubmitting} style={{ marginTop: "24px" }}>
            {isSubmitting ? "Processing Payment..." : `PROCEED TO PAY (₹${finalAmount}) 🔒`}
          </button>
        </div>
      </div>

      {/* High-fidelity Realistic Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={finalAmount}
        initialMethod={paymentMethod}
        orderDetails={pendingOrderPayload}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </form>
  );
};

export default PlaceOrder;