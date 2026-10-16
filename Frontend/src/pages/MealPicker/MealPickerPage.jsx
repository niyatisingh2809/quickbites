import React, { useState, useEffect, useContext } from 'react';
import './MealPickerPage.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import ThaliBuilderModal from '../../components/ThaliBuilder/ThaliBuilderModal';

const MealPickerPage = () => {
  const { url, addToCart, addThaliToCart, currentLocation, deliveryAddress } = useContext(StoreContext);
  const navigate = useNavigate();

  // Questionnaire Filters
  const [budget, setBudget] = useState(200);
  const [cuisine, setCuisine] = useState('Surprise Me');
  const [dietary, setDietary] = useState('any');
  const [spice, setSpice] = useState('medium');
  const [mealSize, setMealSize] = useState('regular');

  // State
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [advice, setAdvice] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState('');
  const [activeThaliTemplate, setActiveThaliTemplate] = useState(null);

  const cuisineOptions = [
    { label: '🎲 Surprise Me', value: 'Surprise Me' },
    { label: '🍛 North Indian', value: 'North Indian' },
    { label: '🥘 Biryani', value: 'Biryani' },
    { label: '🥢 Chinese', value: 'Chinese' },
    { label: '🌯 Rolls', value: 'Rolls' },
    { label: '🥗 Salad / Healthy', value: 'Salad' },
    { label: '🍨 Desserts', value: 'Dessert' }
  ];

  const fetchSuggestions = async (newOffset = 0) => {
    setLoading(true);
    try {
      const payload = {
        budgetRupees: Number(budget),
        address: deliveryAddress?.city
          ? deliveryAddress
          : currentLocation
          ? { city: currentLocation.city, state: currentLocation.state }
          : null,
        cuisine,
        dietary,
        spice,
        mealSize,
        offset: newOffset
      };

      const res = await axios.post(`${url}/api/meal-picker/suggest`, payload);
      if (res.data.success) {
        if (newOffset === 0) {
          setMatches(res.data.matches || []);
          setShowFilters(false); // Collapse form to focus on results
        } else {
          setMatches((prev) => [...prev, ...(res.data.matches || [])]);
        }
        setTotalMatches(res.data.totalMatches || 0);
        setHasMore(Boolean(res.data.hasMore));
        setCurrentOffset(newOffset);
        setAdvice(res.data.advice || '');
        setHasSearched(true);
      }
    } catch (err) {
      console.error('Meal suggestion error:', err);
      alert('Failed to fetch meal suggestions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchSuggestions(0);
  };

  const handleShowMore = () => {
    fetchSuggestions(currentOffset + 3);
  };

  const handleOrderMeal = async (meal) => {
    if (meal.isThali) {
      // Fetch full thali template to open builder
      try {
        const res = await axios.get(`${url}/api/thali/${meal.templateId || meal.id}`);
        if (res.data.success) {
          setActiveThaliTemplate(res.data.template);
        }
      } catch (e) {
        alert('Could not open thali builder');
      }
    } else {
      addToCart(meal.id);
      setFeedbackToast(`🎉 "${meal.name}" added to cart!`);
      setTimeout(() => setFeedbackToast(''), 4000);
    }
  };

  return (
    <div className='meal-picker-page'>
      {/* Header */}
      <div className='meal-picker-header'>
        <span className='meal-picker-badge'>🎲 Can't Decide What to Eat?</span>
        <h1>Aaj Kya Khau? — Meal Picker</h1>
        <p>
          Tell us your budget, spice mood, and meal size. Our rule engine finds the top 3 best matching
          meals from active kitchens with 100% transparent pricing.
        </p>
      </div>

      {/* Filter Questionnaire */}
      {showFilters && (
        <form className='picker-form-card' onSubmit={handleSearchSubmit}>
          {/* 1. Budget Question */}
          <div className='picker-question-block'>
            <div className='picker-label-row'>
              <h3 className='picker-label'>💰 1. What is your maximum budget?</h3>
              <span style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '800' }}>
                ₹{budget} Maximum
              </span>
            </div>
            <div className='budget-presets-row'>
              {[120, 180, 250, 350, 500].map((b) => (
                <button
                  key={b}
                  type='button'
                  className={`picker-chip ${budget === b ? 'selected' : ''}`}
                  onClick={() => setBudget(b)}
                >
                  ₹{b}
                </button>
              ))}
              <div className='budget-input-wrap'>
                <span className='budget-currency-symbol'>₹</span>
                <input
                  type='number'
                  min={50}
                  max={2000}
                  className='budget-input-field'
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* 2. Cuisine Mood */}
          <div className='picker-question-block'>
            <div className='picker-label-row'>
              <h3 className='picker-label'>🍽️ 2. What cuisine are you craving?</h3>
            </div>
            <div className='picker-chips-grid'>
              {cuisineOptions.map((c) => (
                <button
                  key={c.value}
                  type='button'
                  className={`picker-chip ${cuisine === c.value ? 'selected' : ''}`}
                  onClick={() => setCuisine(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Dietary & Spice Preferences */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className='picker-question-block'>
              <div className='picker-label-row'>
                <h3 className='picker-label'>🥗 3. Dietary Choice</h3>
              </div>
              <div className='picker-chips-grid'>
                <button
                  type='button'
                  className={`picker-chip ${dietary === 'veg' ? 'selected' : ''}`}
                  onClick={() => setDietary('veg')}
                >
                  🟢 Veg Only
                </button>
                <button
                  type='button'
                  className={`picker-chip ${dietary === 'any' ? 'selected' : ''}`}
                  onClick={() => setDietary('any')}
                >
                  🍽️ Any (Veg / Non-Veg)
                </button>
              </div>
            </div>

            <div className='picker-question-block'>
              <div className='picker-label-row'>
                <h3 className='picker-label'>🌶️ 4. Spice Level</h3>
              </div>
              <div className='picker-chips-grid'>
                <button
                  type='button'
                  className={`picker-chip ${spice === 'mild' ? 'selected' : ''}`}
                  onClick={() => setSpice('mild')}
                >
                  Mild
                </button>
                <button
                  type='button'
                  className={`picker-chip ${spice === 'medium' ? 'selected' : ''}`}
                  onClick={() => setSpice('medium')}
                >
                  Medium
                </button>
                <button
                  type='button'
                  className={`picker-chip ${spice === 'spicy' ? 'selected' : ''}`}
                  onClick={() => setSpice('spicy')}
                >
                  Spicy 🔥
                </button>
              </div>
            </div>
          </div>

          {/* 5. Meal Size */}
          <div className='picker-question-block'>
            <div className='picker-label-row'>
              <h3 className='picker-label'>🍱 5. How hungry are you?</h3>
            </div>
            <div className='picker-chips-grid'>
              <button
                type='button'
                className={`picker-chip ${mealSize === 'light' ? 'selected' : ''}`}
                onClick={() => setMealSize('light')}
              >
                🥪 Light Bite (Snack / Roll / Salad)
              </button>
              <button
                type='button'
                className={`picker-chip ${mealSize === 'regular' ? 'selected' : ''}`}
                onClick={() => setMealSize('regular')}
              >
                🍛 Regular Meal
              </button>
              <button
                type='button'
                className={`picker-chip ${mealSize === 'filling' ? 'selected' : ''}`}
                onClick={() => setMealSize('filling')}
              >
                🍱 Full Thali / Heavy Feast
              </button>
            </div>
          </div>

          <button type='submit' className='picker-submit-btn' disabled={loading}>
            {loading ? 'Finding Best Meals...' : '🔍 Pick My Meal Now'}
          </button>
        </form>
      )}

      {/* Results View */}
      {hasSearched && (
        <div className='picker-results-section'>
          <div className='picker-results-header'>
            <div>
              <h2>Recommended For You ({totalMatches} matches found)</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Under ₹{budget} • {cuisine} • {dietary === 'veg' ? 'Pure Veg' : 'Any'} • {spice} spice • {mealSize}
              </p>
            </div>
            <button
              className='picker-change-btn'
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '▲ Hide Preferences' : '✏️ Change Preferences'}
            </button>
          </div>

          {loading && matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <p>Finding perfect dishes fitting your budget...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className='picker-empty-card'>
              <h3>No meals matched all criteria</h3>
              <p>{advice || 'Try increasing your budget or choosing Surprise Me.'}</p>
              <div className='picker-empty-actions'>
                <button
                  className='picker-empty-action-btn'
                  onClick={() => {
                    setBudget(budget + 60);
                    setCuisine('Surprise Me');
                    fetchSuggestions(0);
                  }}
                >
                  Increase Budget by ₹60 & Surprise Me
                </button>
                <button
                  className='picker-empty-action-btn'
                  onClick={() => {
                    setCuisine('Surprise Me');
                    setMealSize('any');
                    fetchSuggestions(0);
                  }}
                >
                  Try Any Meal Size
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className='picker-cards-grid'>
                {matches.map((meal, index) => (
                  <div key={meal.id || index} className='picker-meal-card'>
                    <div className='picker-card-img-wrap'>
                      <img
                        src={meal.image?.startsWith('http') ? meal.image : `/images/${meal.image || 'header_img.png'}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/header_img.png';
                        }}
                        alt={meal.name}
                        className='picker-card-img'
                      />
                      <div className='picker-card-tags'>
                        {meal.isVeg && <span className='picker-tag-pill veg'>● Veg</span>}
                        {meal.isThali && <span className='picker-tag-pill' style={{ color: '#0369a1' }}>🍱 Thali</span>}
                      </div>
                    </div>

                    <div className='picker-card-content'>
                      <span className='picker-card-restaurant'>
                        🏪 {meal.restaurant?.name} • ⭐ {meal.restaurant?.rating || '4.5'}
                      </span>
                      <h3 className='picker-card-name'>{meal.name}</h3>
                      <p style={{ margin: '0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                        {meal.description?.length > 90
                          ? `${meal.description.slice(0, 90)}...`
                          : meal.description}
                      </p>

                      {/* Rule Explanation */}
                      <div className='picker-card-explanation'>
                        💡 {meal.explanation}
                      </div>

                      <div className='picker-card-footer'>
                        <div className='picker-price-area'>
                          <span className='picker-price-label'>
                            {meal.hasExactDeliveredPrice ? 'Total Delivered Price' : 'Estimated Food Price'}
                          </span>
                          <span className='picker-price-amount'>
                            ₹{meal.finalPriceRupees}
                          </span>
                        </div>

                        <button className='picker-order-btn' onClick={() => handleOrderMeal(meal)}>
                          {meal.isThali ? '🍱 Customize' : '+ Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className='picker-more-btn-wrap'>
                  <button className='picker-more-btn' onClick={handleShowMore} disabled={loading}>
                    {loading ? 'Loading...' : '🎲 Show More Options'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Thali Customization Modal if recommended */}
      {activeThaliTemplate && (
        <ThaliBuilderModal
          isOpen={Boolean(activeThaliTemplate)}
          onClose={() => setActiveThaliTemplate(null)}
          onCancel={() => setActiveThaliTemplate(null)}
          template={activeThaliTemplate}
          onSave={(thaliPayload) => {
            addThaliToCart(thaliPayload);
            setActiveThaliTemplate(null);
            setFeedbackToast(`🎉 "${thaliPayload.templateName}" added to cart!`);
            setTimeout(() => setFeedbackToast(''), 4000);
          }}
        />
      )}

      {/* Quick Cart Notification Toast */}
      {feedbackToast && (
        <div className='thali-feedback-toast'>
          <span>{feedbackToast}</span>
          <button className='thali-toast-link' onClick={() => navigate('/cart')}>
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
};

export default MealPickerPage;
