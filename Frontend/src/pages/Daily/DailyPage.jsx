import React, { useState, useEffect, useContext } from 'react';
import './DailyPage.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { LanguageContext } from '../../Context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const DailyPage = () => {
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' | 'tiffin' | 'group'

  // --- Budget Meal Finder State ---
  const [budgetAmount, setBudgetAmount] = useState(149);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [budgetMeals, setBudgetMeals] = useState([]);
  const [budgetAlternatives, setBudgetAlternatives] = useState([]);
  const [budgetSearching, setBudgetSearching] = useState(false);
  const [budgetSearched, setBudgetSearched] = useState(false);

  // --- Tiffin Subscription State ---
  const [tiffinPlans, setTiffinPlans] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loadingTiffin, setLoadingTiffin] = useState(false);
  const [selectedPlanForSub, setSelectedPlanForSub] = useState(null);
  const [subStartDate, setSubStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [subSlot, setSubSlot] = useState('12:30 PM - 01:30 PM');
  const [subscribing, setSubscribing] = useState(false);
  const [skipDateInput, setSkipDateInput] = useState('');
  const [activeSubForSkip, setActiveSubForSkip] = useState(null);

  // --- Group Order State ---
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedGroupRest, setSelectedGroupRest] = useState('');
  const [groupDuration, setGroupDuration] = useState(45);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const {
    url,
    token,
    currentLocation,
    deliveryAddress,
    restaurants,
    addToCart,
    food_list
  } = useContext(StoreContext);

  const langCtx = useContext(LanguageContext);
  const t = langCtx?.t || ((k) => k);
  const navigate = useNavigate();

  // --- 1. SEARCH BUDGET MEALS ---
  const handleSearchBudgetMeals = async () => {
    setBudgetSearching(true);
    setBudgetSearched(true);
    try {
      const city = currentLocation?.city || deliveryAddress?.city || 'Delhi NCR';
      const response = await axios.post(`${url}/api/budget-meal/search`, {
        maxBudgetRupees: budgetAmount,
        address: { city },
        isVeg: isVegOnly
      });

      if (response.data.success) {
        setBudgetMeals(response.data.fitsBudget || []);
        setBudgetAlternatives(response.data.alternatives || []);
      }
    } catch (err) {
      console.warn('Budget search notice:', err.message);
      // Fallback: client-side filter
      const maxPaise = budgetAmount * 100;
      const filtered = food_list
        .filter((item) => {
          if (isVegOnly && item.isNonVeg) return false;
          const estDeliveredRupees = item.price + 20 + 40 + 5 + Math.round(item.price * 0.05);
          return estDeliveredRupees <= budgetAmount;
        })
        .map((f) => ({
          foodId: f._id,
          name: f.name,
          description: f.description,
          image: f.image,
          foodPriceRupees: f.price,
          finalPayableRupees: f.price + 20 + 40 + 5 + Math.round(f.price * 0.05),
          restaurant: { name: 'QuickBites Express Kitchen' }
        }));
      setBudgetMeals(filtered);
    } finally {
      setBudgetSearching(false);
    }
  };

  // --- 2. FETCH TIFFIN PLANS & SUBSCRIPTIONS ---
  const fetchTiffinData = async () => {
    setLoadingTiffin(true);
    try {
      const city = currentLocation?.city || 'Delhi NCR';
      const plansRes = await axios.get(`${url}/api/tiffin/plans?city=${city}`);
      if (plansRes.data.success) {
        setTiffinPlans(plansRes.data.plans || []);
      }

      if (token) {
        const myRes = await axios.get(`${url}/api/tiffin/my-subscriptions`, {
          headers: { token }
        });
        if (myRes.data.success) {
          setMySubscriptions(myRes.data.subscriptions || []);
        }
      }
    } catch (err) {
      console.warn('Tiffin fetch notice:', err.message);
    } finally {
      setLoadingTiffin(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tiffin') {
      fetchTiffinData();
    }
  }, [activeTab, token]);

  // Activate Tiffin Subscription
  const handleConfirmSubscription = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to activate your Tiffin subscription!');
      return;
    }
    setSubscribing(true);
    try {
      const res = await axios.post(
        `${url}/api/tiffin/subscribe`,
        {
          planId: selectedPlanForSub._id,
          startDate: subStartDate,
          deliverySlot: subSlot,
          deliveryAddress: deliveryAddress || { city: currentLocation?.city || 'Delhi NCR', street: 'My Address' },
          mealType: selectedPlanForSub.mealType
        },
        { headers: { token } }
      );
      if (res.data.success) {
        alert(res.data.message || '🎉 Tiffin Subscription Activated!');
        setSelectedPlanForSub(null);
        fetchTiffinData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate subscription.');
    } finally {
      setSubscribing(false);
    }
  };

  // Skip a meal date
  const handleSkipDate = async (subscriptionId) => {
    if (!skipDateInput) {
      alert('Please select a date to skip.');
      return;
    }
    try {
      const res = await axios.post(
        `${url}/api/tiffin/skip-date`,
        { subscriptionId, dateString: skipDateInput },
        { headers: { token } }
      );
      if (res.data.success) {
        alert(res.data.message);
        setSkipDateInput('');
        setActiveSubForSkip(null);
        fetchTiffinData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not skip meal.');
    }
  };

  // --- 3. CREATE & JOIN GROUP ORDER ---
  const handleCreateGroupOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in to create a group order!');
      return;
    }
    if (!selectedGroupRest) {
      alert('Please choose a restaurant for the group order.');
      return;
    }
    setCreatingGroup(true);
    try {
      const res = await axios.post(
        `${url}/api/group-order/create`,
        {
          restaurantId: selectedGroupRest,
          deliveryAddress: deliveryAddress || { city: currentLocation?.city || 'Delhi NCR', street: 'Office/PG Address' },
          title: groupTitle || 'Office Lunch Squad',
          durationMinutes: groupDuration
        },
        { headers: { token } }
      );
      if (res.data.success) {
        setCreatedGroup(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start group order.');
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="daily-page">
      {/* HEADER SECTION */}
      <div className="daily-hero">
        <div className="daily-badge">
          <span>⚡ QuickBites Daily</span>
          <span className="daily-sub-badge">Students • PGs • Offices</span>
        </div>
        <h1 className="daily-title">Everyday Meals Made Affordable & Effortless</h1>
        <p className="daily-subtitle">
          Find complete meals under your budget, subscribe to wholesome home-style tiffins, or order together with roommates & colleagues.
        </p>

        {/* THREE FEATURE TABS */}
        <div className="daily-tabs-nav">
          <button
            type="button"
            className={`daily-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            💰 Budget Meal Finder
          </button>
          <button
            type="button"
            className={`daily-tab-btn ${activeTab === 'tiffin' ? 'active' : ''}`}
            onClick={() => setActiveTab('tiffin')}
          >
            🍱 Daily Tiffin Plans
          </button>
          <button
            type="button"
            className={`daily-tab-btn ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            👥 Group Food Order
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: BUDGET MEAL FINDER
          ======================================================== */}
      {activeTab === 'budget' && (
        <div className="tab-pane budget-pane">
          <div className="budget-control-card">
            <div className="budget-slider-head">
              <div>
                <h3 className="section-title">Set Your Maximum Delivered Budget</h3>
                <p className="section-sub">
                  Final delivered cost (Food + Packaging + Delivery + Platform Fee + GST). No hidden surprises at checkout!
                </p>
              </div>
              <div className="budget-display-badge">
                <span>Max ₹{budgetAmount}</span>
              </div>
            </div>

            {/* PRESET CHIPS */}
            <div className="budget-presets">
              {[99, 149, 199, 249].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`preset-chip ${budgetAmount === amt ? 'active' : ''}`}
                  onClick={() => setBudgetAmount(amt)}
                >
                  ₹{amt}
                </button>
              ))}
              <input
                type="range"
                min="70"
                max="350"
                step="10"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="budget-slider"
              />
            </div>

            {/* FILTER BAR */}
            <div className="budget-filter-row">
              <label className="veg-filter-toggle">
                <input
                  type="checkbox"
                  checked={isVegOnly}
                  onChange={(e) => setIsVegOnly(e.target.checked)}
                />
                <span>🌱 Pure Veg Only</span>
              </label>

              <button
                type="button"
                className="btn-search-budget"
                onClick={handleSearchBudgetMeals}
                disabled={budgetSearching}
              >
                {budgetSearching ? 'Finding Meals...' : '🔍 Find Meals Under Budget'}
              </button>
            </div>
          </div>

          {/* RESULTS */}
          {budgetSearching ? (
            <div className="daily-loading-box">
              <div className="spinner"></div>
              <p>Calculating delivered cost with packaging, delivery & GST...</p>
            </div>
          ) : budgetSearched ? (
            budgetMeals.length > 0 ? (
              <div className="meals-results-section">
                <h3 className="results-heading">
                  Found {budgetMeals.length} Complete Meals Under ₹{budgetAmount}
                </h3>
                <div className="budget-meals-grid">
                  {budgetMeals.map((meal) => (
                    <div key={meal.foodId} className="budget-meal-card">
                      <div className="meal-card-img-wrap">
                        <img
                          src={meal.image?.startsWith('http') ? meal.image : `/images/${meal.image}`}
                          alt={meal.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            if (url && !e.target.src.includes(url)) {
                              e.target.src = `${url}/images/${meal.image}`;
                            }
                          }}
                        />
                        <span className={`diet-pill ${meal.isVeg ? 'veg' : 'non-veg'}`}>
                          {meal.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}
                        </span>
                      </div>
                      <div className="meal-card-body">
                        <h4 className="meal-title">{meal.name}</h4>
                        <p className="meal-desc">{meal.description}</p>
                        <span className="meal-restaurant">🏬 {meal.restaurant?.name || 'Local Kitchen'}</span>

                        <div className="meal-price-row">
                          <div>
                            <span className="price-label">Delivered Total:</span>
                            <span className="delivered-price">₹{meal.finalPayableRupees}</span>
                          </div>
                          <button
                            type="button"
                            className="btn-add-budget-meal"
                            onClick={() => {
                              addToCart(meal.foodId);
                              alert(`Added ${meal.name} to cart!`);
                            }}
                          >
                            + ADD TO CART
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-budget-box">
                <div className="empty-icon">🍽️</div>
                <h3>No Meals Found Under ₹{budgetAmount}</h3>
                <p>Try slightly raising your budget to ₹{budgetAmount + 50} to view nutritious thalis and combos.</p>
                {budgetAlternatives.length > 0 && (
                  <div className="alternatives-box">
                    <h4 style={{ margin: '14px 0 8px', color: '#0f172a' }}>Close Alternatives Just Above Budget:</h4>
                    <div className="budget-meals-grid">
                      {budgetAlternatives.map((meal) => (
                        <div key={meal.foodId} className="budget-meal-card">
                          <div className="meal-card-img-wrap">
                            <img src={meal.image?.startsWith('http') ? meal.image : `/images/${meal.image}`} alt={meal.name} />
                          </div>
                          <div className="meal-card-body">
                            <h4 className="meal-title">{meal.name}</h4>
                            <span className="delivered-price">₹{meal.finalPayableRupees}</span>
                            <button
                              type="button"
                              className="btn-add-budget-meal"
                              onClick={() => {
                                addToCart(meal.foodId);
                                alert(`Added ${meal.name} to cart!`);
                              }}
                            >
                              + ADD
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="budget-intro-card">
              <h3>🎯 Smart Budget Engine</h3>
              <p>
                Select your budget above and click "Find Meals". We automatically evaluate all kitchen menus in your delivery hub, including packaging, delivery, and taxes, so the price you see is 100% final.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: DAILY TIFFIN SUBSCRIPTION
          ======================================================== */}
      {activeTab === 'tiffin' && (
        <div className="tab-pane tiffin-pane">
          {/* Active Subscriptions Section */}
          {token && mySubscriptions.length > 0 && (
            <div className="my-subs-section">
              <h3 className="subs-heading">My Active Tiffin Subscriptions ({mySubscriptions.length})</h3>
              <div className="subs-grid">
                {mySubscriptions.map((sub) => (
                  <div key={sub._id} className="active-sub-card">
                    <div className="active-sub-head">
                      <div>
                        <span className="sub-num">#{sub.subscriptionNumber}</span>
                        <h4 className="sub-plan-title">{sub.planSnapshot?.title}</h4>
                      </div>
                      <span className={`sub-status-pill ${sub.status}`}>{sub.status.toUpperCase()}</span>
                    </div>

                    <div className="sub-meta-row">
                      <span>⏱️ Slot: {sub.deliverySlot}</span>
                      <span>🍱 Type: {sub.mealType?.toUpperCase()}</span>
                      <span>💰 Earned Credits: ₹{sub.creditsEarnedRupees || 0}</span>
                    </div>

                    <div className="sub-dates-row">
                      <span>Valid: {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}</span>
                      <span>Skips: {sub.skipsUsed || 0}/{sub.planSnapshot?.skipPolicy?.maxSkips || 3} used</span>
                    </div>

                    {sub.status === 'active' && (
                      <div className="sub-actions-row">
                        {activeSubForSkip === sub._id ? (
                          <div className="skip-form-box">
                            <input
                              type="date"
                              value={skipDateInput}
                              onChange={(e) => setSkipDateInput(e.target.value)}
                              className="skip-date-input"
                            />
                            <button
                              type="button"
                              className="btn-confirm-skip"
                              onClick={() => handleSkipDate(sub._id)}
                            >
                              Confirm Skip (+₹{sub.planSnapshot?.skipPolicy?.creditPerSkipRupees || 80} credit)
                            </button>
                            <button
                              type="button"
                              className="btn-cancel-skip"
                              onClick={() => setActiveSubForSkip(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-open-skip"
                            onClick={() => setActiveSubForSkip(sub._id)}
                          >
                            ⏸️ Skip / Pause a Meal Date
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse Available Plans */}
          <div className="tiffin-plans-section">
            <div className="section-header-box">
              <h3 className="section-title">Home-Style Daily Tiffin Plans</h3>
              <p className="section-sub">
                Healthy, hygienically cooked daily meals delivered to your hostel, PG, or office on auto-pilot.
              </p>
            </div>

            {loadingTiffin ? (
              <div className="daily-loading-box">
                <div className="spinner"></div>
                <p>Loading chef curated tiffin plans...</p>
              </div>
            ) : tiffinPlans.length === 0 ? (
              <p>No tiffin plans available in your area right now.</p>
            ) : (
              <div className="tiffin-plans-grid">
                {tiffinPlans.map((plan) => (
                  <div key={plan._id} className="tiffin-plan-card">
                    <div className="plan-card-header">
                      <span className="plan-type-badge">{plan.mealType?.toUpperCase()} • {plan.durationDays} DAYS</span>
                      <h4 className="plan-title">{plan.title}</h4>
                      <p className="plan-desc">{plan.description}</p>
                    </div>

                    <div className="plan-price-box">
                      <div className="price-stack">
                        <span className="price-total">₹{plan.priceRupees}</span>
                        <span className="price-per-day">
                          (₹{Math.round(plan.priceRupees / plan.durationDays)} / meal delivered)
                        </span>
                      </div>
                      <span className="plan-slot-pill">⏰ {plan.deliverySlot}</span>
                    </div>

                    {/* Weekly Menu Preview */}
                    <div className="weekly-menu-box">
                      <span className="menu-title-tag">Weekly Rotating Menu:</span>
                      <div className="menu-days-list">
                        {(plan.weeklyMenu || []).slice(0, 4).map((d, idx) => (
                          <div key={idx} className="menu-day-row">
                            <span className="day-name">{d.dayOfWeek.slice(0, 3)}:</span>
                            <span className="dish-name">{d.mealName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="plan-footer">
                      <div className="skip-perk">
                        <span>🛡️ Flexible: Skip up to {plan.skipPolicy?.maxSkips || 3} meals for ₹{plan.skipPolicy?.creditPerSkipRupees || 80} credit</span>
                      </div>
                      <button
                        type="button"
                        className="btn-subscribe-plan"
                        onClick={() => setSelectedPlanForSub(plan)}
                      >
                        Subscribe to Plan →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription Modal */}
          {selectedPlanForSub && (
            <div className="daily-modal-overlay" onClick={() => setSelectedPlanForSub(null)}>
              <div className="daily-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="daily-modal-header">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Activate Tiffin Plan</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{selectedPlanForSub.title}</p>
                  </div>
                  <button className="btn-close-modal" onClick={() => setSelectedPlanForSub(null)}>✕</button>
                </div>

                <form onSubmit={handleConfirmSubscription} style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Subscription Start Date:
                    </label>
                    <input
                      type="date"
                      value={subStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSubStartDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Delivery Time Slot:
                    </label>
                    <select
                      value={subSlot}
                      onChange={(e) => setSubSlot(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                    >
                      <option value="12:30 PM - 01:30 PM">Lunch: 12:30 PM - 01:30 PM</option>
                      <option value="01:00 PM - 02:00 PM">Lunch: 01:00 PM - 02:00 PM</option>
                      <option value="08:00 PM - 09:00 PM">Dinner: 08:00 PM - 09:00 PM</option>
                    </select>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '12.5px', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Duration:</span>
                      <strong>{selectedPlanForSub.durationDays} Days</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Total Amount:</span>
                      <strong style={{ color: '#2563eb', fontSize: '14px' }}>₹{selectedPlanForSub.priceRupees}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Skip Policy:</span>
                      <span>Up to {selectedPlanForSub.skipPolicy?.maxSkips} skips with refund credits</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForSub(null)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={subscribing}
                      style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {subscribing ? 'Activating...' : `Pay & Activate (₹${selectedPlanForSub.priceRupees})`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: GROUP ORDERING
          ======================================================== */}
      {activeTab === 'group' && (
        <div className="tab-pane group-pane">
          <div className="group-intro-banner">
            <div>
              <h3 className="section-title">Order Together, Save Delivery Fees! 👥</h3>
              <p className="section-sub">
                Host a group order for your office floor or PG hostel. Everyone adds their favorite dishes to one shared cart, and food arrives in a single combined delivery.
              </p>
            </div>
          </div>

          <div className="group-actions-grid">
            {/* Create Group Card */}
            <div className="group-card">
              <h4 className="card-heading">🍕 Start a New Group Order</h4>
              <p className="card-sub">You will be the group host and can finalize checkout for everyone.</p>

              {createdGroup ? (
                <div className="group-created-success">
                  <span className="success-badge">🎉 Group Order Active!</span>
                  <div className="invite-box">
                    <span className="invite-label">Share Invite Code:</span>
                    <strong className="invite-code">{createdGroup.inviteCode}</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 14px' }}>
                    Send this code to friends. Anyone can add their meals from the selected restaurant!
                  </p>
                  <button
                    type="button"
                    className="btn-start-group"
                    onClick={() => {
                      navigator.clipboard?.writeText(createdGroup.inviteCode);
                      alert('Invite code copied to clipboard!');
                    }}
                  >
                    📋 Copy Invite Code
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateGroupOrder} className="group-form">
                  <input
                    type="text"
                    placeholder="Group Title (e.g. 4th Floor Team Lunch)"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    required
                    className="group-input"
                  />

                  <select
                    value={selectedGroupRest}
                    onChange={(e) => setSelectedGroupRest(e.target.value)}
                    required
                    className="group-input"
                  >
                    <option value="">Select Restaurant...</option>
                    {restaurants.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.cuisine?.[0] || 'Food'})
                      </option>
                    ))}
                  </select>

                  <select
                    value={groupDuration}
                    onChange={(e) => setGroupDuration(Number(e.target.value))}
                    className="group-input"
                  >
                    <option value="30">Ordering Window: 30 minutes</option>
                    <option value="45">Ordering Window: 45 minutes</option>
                    <option value="60">Ordering Window: 1 hour</option>
                  </select>

                  <button
                    type="submit"
                    disabled={creatingGroup}
                    className="btn-start-group"
                  >
                    {creatingGroup ? 'Creating Group...' : '🚀 Create Group & Get Invite Link'}
                  </button>
                </form>
              )}
            </div>

            {/* Join Group Card */}
            <div className="group-card">
              <h4 className="card-heading">🔗 Join Colleague's Group Order</h4>
              <p className="card-sub">Got an invite code from your colleague? Enter it below to add your dish.</p>

              <div className="group-form" style={{ marginTop: '20px' }}>
                <input
                  type="text"
                  placeholder="Enter 12-char Invite Code"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="group-input"
                />

                <button
                  type="button"
                  className="btn-join-group"
                  onClick={async () => {
                    if (!joinCodeInput.trim()) {
                      alert('Please enter an invite code.');
                      return;
                    }
                    try {
                      const res = await axios.get(`${url}/api/group-order/${joinCodeInput.trim()}`, {
                        headers: token ? { token } : {}
                      });
                      if (res.data.success) {
                        alert(`Found group order: "${res.data.group.title}". You can now choose meals!`);
                        navigate('/');
                      }
                    } catch (err) {
                      alert(err.response?.data?.message || 'Invalid or expired invite code.');
                    }
                  }}
                >
                  Join Group Order →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPage;
