import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ setShowLogin }) => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    promoCode,
    discount,
    applyPromo,
    removePromo
  } = useContext(StoreContext);

  const [inputCode, setInputCode] = useState("");
  const navigate = useNavigate();

  const handleProceed = () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      if (setShowLogin) {
        setShowLogin(true);
      } else {
        alert("⚠️ Please sign in / login first to proceed to checkout!");
      }
      return;
    }
    if (getTotalCartAmount() === 0) {
      alert("🛒 Your cart is empty! Please add some delicious items first.");
      return;
    }
    navigate('/order');
  };

  const handleApplyPromo = (codeToApply) => {
    const code = codeToApply || inputCode;
    if (!code) {
      alert("Please enter a promo code");
      return;
    }
    const res = applyPromo(code);
    alert(res.message);
    if (res.success) {
      setInputCode("");
    }
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : (discount === 40 && promoCode === "FREESHIP" ? 0 : 40);
  const finalTotal = Math.max(0, subtotal - (promoCode === "FREESHIP" ? 0 : discount) + deliveryFee);

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img
                    src={item.image?.startsWith("http") ? item.image : `/images/${item.image}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      if (url && !e.target.src.includes(url)) {
                        e.target.src = `${url}/images/${item.image}`;
                      }
                    }}
                    alt={item.name}
                  />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
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
                  <p>-₹{discount} <span onClick={removePromo} style={{ color: "red", cursor: "pointer", marginLeft: "6px" }}>[✕]</span></p>
                </div>
              </>
            )}
            <hr />
            <div className='cart-total-details'>
              <b>Total</b>
              <b>₹{subtotal === 0 ? 0 : finalTotal}</b>
            </div>
          </div>
          <button onClick={handleProceed}>PROCEED TO CHECKOUT</button>
        </div>

        <div className='cart-promocode'>
          <div>
            <p>Have a promo code? Enter it below:</p>
            <div className='cart-promocode-input'>
              <input
                type='text'
                placeholder='e.g. WELCOME50, TASTY10'
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button type='button' onClick={() => handleApplyPromo()}>Apply</button>
            </div>

            <div style={{ marginTop: "15px" }}>
              <p style={{ fontWeight: 600, fontSize: "14px", color: "#333", marginBottom: "8px" }}>🔥 Available Offers (Click to apply):</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span
                  onClick={() => handleApplyPromo("WELCOME50")}
                  style={{ background: "#fff2e8", color: "#d4380d", border: "1px dashed #ffbb96", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                >
                  WELCOME50 (50% OFF)
                </span>
                <span
                  onClick={() => handleApplyPromo("TASTY10")}
                  style={{ background: "#f6ffed", color: "#389e0d", border: "1px dashed #b7eb8f", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                >
                  TASTY10 (₹40 OFF)
                </span>
                <span
                  onClick={() => handleApplyPromo("FREESHIP")}
                  style={{ background: "#e6f7ff", color: "#096dd9", border: "1px dashed #91d5ff", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                >
                  FREESHIP (Free Delivery)
                </span>
                <span
                  onClick={() => handleApplyPromo("FOODIE20")}
                  style={{ background: "#fffbe6", color: "#d48806", border: "1px dashed #ffe58f", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                >
                  FOODIE20 (20% OFF)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;