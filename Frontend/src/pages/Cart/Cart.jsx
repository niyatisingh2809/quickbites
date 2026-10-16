import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThaliBuilderModal from '../../components/ThaliBuilder/ThaliBuilderModal';

const Cart = ({ setShowLogin }) => {
  const {
    cartItems,
    customThalis,
    food_list,
    removeFromCart,
    addThaliToCart,
    removeThaliFromCart,
    updateThaliInCart,
    getTotalCartAmount,
    getTotalItemsCount,
    getPricingBreakdown,
    cartRestaurant,
    url,
    token,
    promoCode,
    discount,
    applyPromo,
    removePromo
  } = useContext(StoreContext);

  const [inputCode, setInputCode] = useState('');
  const [editingThali, setEditingThali] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const handleProceed = () => {
    if (isProcessing) return;
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) {
      if (setShowLogin) {
        setShowLogin(true);
      } else {
        alert('⚠️ Please sign in / login first to proceed to checkout!');
      }
      return;
    }
    if (getTotalItemsCount() === 0) {
      alert('🛒 Your cart is empty! Please add some delicious items or build a thali first.');
      return;
    }
    setIsProcessing(true);
    navigate('/order');
  };

  const handleCancelCheckout = () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      // Discard active thali edit if any
      setEditingTemplate(null);
      setEditingThali(null);
      // Navigate back to menu / home while preserving all cart items untouched
      navigate('/');
    } catch (err) {
      console.error('Error during cancel checkout:', err);
      alert('⚠️ An error occurred while cancelling. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = (codeToApply) => {
    const code = codeToApply || inputCode;
    if (!code) {
      alert('Please enter a promo code');
      return;
    }
    const res = applyPromo(code);
    alert(res.message);
    if (res.success) {
      setInputCode('');
    }
  };

  const handleEditThali = async (thali) => {
    setLoadingEdit(true);
    try {
      const res = await axios.get(`${url}/api/thali/${thali.templateId}`);
      if (res.data.success) {
        setEditingTemplate(res.data.template);
        setEditingThali(thali);
      } else {
        alert('Could not load thali template for editing');
      }
    } catch (err) {
      console.error('Edit thali error:', err);
      alert('Failed to open thali editor. Please try again.');
    } finally {
      setLoadingEdit(false);
    }
  };

  const pricing = getPricingBreakdown();
  const hasRegularItems = Object.values(cartItems).some((q) => q > 0);
  const hasThalis = (customThalis || []).length > 0;
  const isCartEmpty = !hasRegularItems && !hasThalis;

  return (
    <div className='cart'>
      {/* Restaurant Header */}
      {cartRestaurant && !isCartEmpty && (
        <div style={{ background: '#eff6ff', padding: '12px 18px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '800', textTransform: 'uppercase' }}>Current Ordering Restaurant</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', color: '#0f172a' }}>🏪 {cartRestaurant.name}</h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Packaging Fee: ₹{cartRestaurant.packagingFee || 20}</span>
        </div>
      )}

      {isCartEmpty ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px' }}>
          <p style={{ fontSize: '42px', margin: '0 0 10px 0' }}>🛒</p>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>Explore our chef-special foods or customize your own fresh wholesome Thali!</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', fontWeight: '700', cursor: 'pointer' }}
            >
              Browse Menu
            </button>
            <button
              onClick={() => navigate('/thali')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
            >
              🍱 Build Your Own Thali
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Custom Thalis Section */}
          {hasThalis && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🍱 Custom Thalis ({customThalis.length})
                </h3>
                <button
                  onClick={() => navigate('/thali')}
                  style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  + Add Another Thali
                </button>
              </div>

              {customThalis.map((thali) => (
                <div key={thali.cartItemId} className='cart-thali-card'>
                  <div className='cart-thali-info'>
                    <div className='cart-thali-header'>
                      {thali.isVeg && <span className='thali-veg-badge' title='Pure Veg'></span>}
                      <h4 className='cart-thali-name'>{thali.templateName}</h4>
                      <span className='cart-thali-tag'>Custom Configured</span>
                    </div>

                    {/* Components summary */}
                    <div className='cart-thali-components-list'>
                      {(thali.components || []).map((c, i) => (
                        <span key={i}>
                          <strong>{c.groupName || 'Dish'}:</strong> {c.name} {c.quantity > 1 ? `x${c.quantity}` : ''}
                          {c.portion ? ` (${c.portion})` : ''}{' '}
                          {c.extraPriceRupees > 0 && <span style={{ color: '#d97706', fontWeight: '700' }}>(+₹{c.extraPriceRupees * (c.quantity || 1)})</span>}
                          {i < thali.components.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </div>

                    {thali.preparationInstructions && (
                      <div className='cart-thali-prep-note'>
                        👨‍🍳 Note: {thali.preparationInstructions}
                      </div>
                    )}
                  </div>

                  <div className='cart-thali-pricing'>
                    <div className='cart-thali-price-total'>
                      ₹{thali.unitPriceRupees * thali.quantity}
                    </div>
                    <div className='cart-thali-price-sub'>
                      ₹{thali.unitPriceRupees} each ({thali.quantity > 1 ? `${thali.quantity} thalis` : '1 thali'})
                    </div>

                    <div className='cart-thali-actions'>
                      <button
                        className='cart-thali-edit-btn'
                        disabled={loadingEdit}
                        onClick={() => handleEditThali(thali)}
                        title='Modify selected rotis, dal, or upgrade items'
                      >
                        ✏️ Edit Thali
                      </button>

                      <div className='cart-thali-qty-box'>
                        <button
                          className='cart-thali-qty-btn'
                          onClick={() => removeThaliFromCart(thali.cartItemId)}
                        >
                          -
                        </button>
                        <span className='cart-thali-qty-num'>{thali.quantity}</span>
                        <button
                          className='cart-thali-qty-btn'
                          onClick={() => addThaliToCart(thali)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className='cart-thali-delete-btn'
                        onClick={() => removeThaliFromCart(thali.cartItemId)}
                        title='Remove thali'
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standard A-la-carte Items Section */}
          {hasRegularItems && (
            <div className='cart-items'>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>
                🍽️ A-la-carte Dishes
              </h3>
              <div className='cart-items-title'>
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
                      <div className='cart-items-title cart-items-item'>
                        <img
                          src={item.image?.startsWith('http') ? item.image : `/images/${item.image}`}
                          onError={(e) => {
                            if (!e.target.dataset.triedBackend && url && !item.image?.startsWith('http')) {
                              e.target.dataset.triedBackend = "true";
                              e.target.src = `${url}/images/${item.image}`;
                            } else if (!e.target.dataset.triedFallback) {
                              e.target.dataset.triedFallback = "true";
                              e.target.src = "/images/food_1.png";
                            }
                          }}
                          alt={item.name}
                        />
                        <p>{item.name}</p>
                        <p>₹{item.price}</p>
                        <p>{cartItems[item._id]}</p>
                        <p>₹{item.price * cartItems[item._id]}</p>
                        <p onClick={() => removeFromCart(item._id)} className='cross'>
                          ✕
                        </p>
                      </div>
                      <hr />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Cart Bottom Summary & Checkout */}
          <div className='cart-bottom'>
            <div className='cart-total'>
              <h2>Bill Details</h2>
              <div>
                <div className='cart-total-details'>
                  <p>Item Subtotal</p>
                  <p>₹{pricing.subtotal}</p>
                </div>
                <hr />
                <div className='cart-total-details'>
                  <p>Restaurant Packaging Fee</p>
                  <p>₹{pricing.packagingFee}</p>
                </div>
                <hr />
                <div className='cart-total-details'>
                  <p>Delivery Fee</p>
                  <p>
                    ₹{pricing.deliveryFee}{' '}
                    {promoCode === 'FREESHIP' ? <span style={{ color: 'green' }}>(Free)</span> : ''}
                  </p>
                </div>
                <hr />
                <div className='cart-total-details'>
                  <p>Platform Fee</p>
                  <p>₹{pricing.platformFee}</p>
                </div>
                <hr />
                <div className='cart-total-details'>
                  <p>GST & Restaurant Taxes (5%)</p>
                  <p>₹{pricing.gstTax}</p>
                </div>
                {pricing.discount > 0 && (
                  <>
                    <hr />
                    <div className='cart-total-details' style={{ color: 'green' }}>
                      <p>Promo Discount ({promoCode})</p>
                      <p>
                        -₹{pricing.discount}{' '}
                        <span
                          onClick={removePromo}
                          style={{ color: 'red', cursor: 'pointer', marginLeft: '6px' }}
                        >
                          [✕]
                        </span>
                      </p>
                    </div>
                  </>
                )}
                <hr />
                <div className='cart-total-details'>
                  <b style={{ fontSize: '17px', color: '#0f172a' }}>To Pay</b>
                  <b style={{ fontSize: '20px', color: '#1d4ed8' }}>₹{pricing.total}</b>
                </div>
              </div>
              <div className='cart-checkout-actions'>
                <button
                  type='button'
                  className='cart-btn-cancel'
                  onClick={handleCancelCheckout}
                  disabled={isProcessing}
                  aria-label='Cancel and continue shopping'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='cart-btn-proceed'
                  onClick={handleProceed}
                  disabled={isProcessing}
                  aria-label='Proceed to checkout'
                >
                  {isProcessing ? 'Proceeding...' : 'PROCEED TO CHECKOUT'}
                </button>
              </div>
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
                  <button type='button' onClick={() => handleApplyPromo()}>
                    Apply
                  </button>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#333', marginBottom: '8px' }}>
                    🔥 Available Offers (Click to apply):
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      onClick={() => handleApplyPromo('WELCOME50')}
                      style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px dashed #93c5fd', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      WELCOME50 (50% OFF)
                    </span>
                    <span
                      onClick={() => handleApplyPromo('TASTY10')}
                      style={{ background: '#f6ffed', color: '#389e0d', border: '1px dashed #b7eb8f', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      TASTY10 (₹40 OFF)
                    </span>
                    <span
                      onClick={() => handleApplyPromo('FREESHIP')}
                      style={{ background: '#e6f7ff', color: '#096dd9', border: '1px dashed #91d5ff', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      FREESHIP (Free Delivery)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Thali Edit Modal */}
      {editingTemplate && editingThali && (
        <ThaliBuilderModal
          isOpen={Boolean(editingTemplate)}
          onClose={() => {
            setEditingTemplate(null);
            setEditingThali(null);
          }}
          onCancel={() => {
            // Cancel discards unsaved edits and preserves the original item in cart
            setEditingTemplate(null);
            setEditingThali(null);
          }}
          template={editingTemplate}
          existingConfig={editingThali}
          onSave={(updatedConfig) => {
            updateThaliInCart(editingThali.cartItemId, updatedConfig);
            setEditingTemplate(null);
            setEditingThali(null);
          }}
        />
      )}
    </div>
  );
};

export default Cart;