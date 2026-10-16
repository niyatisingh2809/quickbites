import React, { useContext, useState, useMemo } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../Context/StoreContext';
import { LanguageContext } from '../../Context/LanguageContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category = 'All', setCategory }) => {
  const { food_list } = useContext(StoreContext);
  const langCtx = useContext(LanguageContext);
  const t = langCtx?.t || ((k) => k);

  // Dietary filter: null (unfiltered / both visible) | 'veg' | 'non-veg'
  // By default, neither button is selected and both types of dishes are visible
  const [dietaryFilter, setDietaryFilter] = useState(null);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Toggle dietary filter:
  // - If clicking an inactive filter, switches to that filter
  // - If clicking the currently active filter, deselects it (restores unfiltered view)
  // - Only one filter can be active at a time
  const handleDietaryToggle = (filterType) => {
    setDietaryFilter((prev) => (prev === filterType ? null : filterType));
  };

  // Filter & sort dishes using explicit dietary classification from database/model
  const filteredDishes = useMemo(() => {
    let result = food_list.filter((item) => {
      // 1. Category filter (combined with dietary filter without resetting)
      if (category && category !== 'All' && item.category !== category) {
        return false;
      }

      // 2. Explicit dietary filter (no inference from dish name or description)
      if (dietaryFilter === 'veg') {
        // Show only explicitly classified vegetarian dishes
        if (item.isVeg !== true) return false;
      } else if (dietaryFilter === 'non-veg') {
        // Show only explicitly classified non-vegetarian dishes
        if (item.isVeg !== false) return false;
      }

      // 3. Top rated filter (4.6+ rating)
      if (topRatedOnly && parseFloat(item.rating || 4.5) < 4.6) {
        return false;
      }

      return true;
    });

    // 4. Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-high') {
      result.sort((a, b) => parseFloat(b.rating || 4.5) - parseFloat(a.rating || 4.5));
    }

    return result;
  }, [food_list, category, dietaryFilter, topRatedOnly, sortBy]);

  return (
    <div className='food-display-wrap' id='food-display'>
      {/* HEADER WITH CONTROLS & FILTER BAR */}
      <div className='food-display-header'>
        <div className='food-display-title-group'>
          <span className='dishes-eyebrow'>🔥 FRESHLY PREPARED</span>
          <h2 className='dishes-main-title'>
            {t('topDishes')}
            {category !== 'All' && (
              <span className='category-title-badge'>
                <span>• {category}</span>
                {setCategory && (
                  <button
                    type='button'
                    className='category-title-cross-btn'
                    onClick={() => setCategory('All')}
                    title={`Clear ${category} filter`}
                    aria-label={`Clear ${category} filter`}
                  >
                    ✕
                  </button>
                )}
              </span>
            )}
          </h2>
          <p className='dishes-count-label'>
            Showing <b>{filteredDishes.length}</b> {dietaryFilter === 'veg' ? t('pureVeg') : dietaryFilter === 'non-veg' ? t('nonVeg') : ''} {t('showingDishes')}
          </p>
        </div>

        {/* CONTROLS BAR: DIETARY TOGGLES (VEG & NON-VEG ONLY), TOP RATED & SORT */}
        <div className='food-filter-controls'>
          {/* Dietary Filter Buttons: EXACTLY TWO BUTTONS ("Veg" & "Non-Veg", NO "All" button) */}
          <div className='dietary-toggle-group' role='group' aria-label='Dietary Filter'>
            {/* 1. Veg Button */}
            <button
              type='button'
              role='button'
              aria-pressed={dietaryFilter === 'veg'}
              className={`dietary-toggle-btn veg-toggle ${dietaryFilter === 'veg' ? 'active-veg' : ''}`}
              onClick={() => handleDietaryToggle('veg')}
              title={dietaryFilter === 'veg' ? 'Click to deselect Veg filter' : 'Show only Vegetarian dishes'}
            >
              <span className='dietary-indicator-dot veg-dot' aria-hidden='true'></span>
              <span>{t('veg')}</span>
              {dietaryFilter === 'veg' && (
                <span 
                  className='dietary-cross-icon' 
                  aria-label='Clear Veg filter' 
                  title='Click to clear Veg filter'
                  onClick={(e) => {
                    e.stopPropagation();
                    setDietaryFilter(null);
                  }}
                >
                  ✕
                </span>
              )}
            </button>

            {/* 2. Non-Veg Button */}
            <button
              type='button'
              role='button'
              aria-pressed={dietaryFilter === 'non-veg'}
              className={`dietary-toggle-btn non-veg-toggle ${dietaryFilter === 'non-veg' ? 'active-non-veg' : ''}`}
              onClick={() => handleDietaryToggle('non-veg')}
              title={dietaryFilter === 'non-veg' ? 'Click to deselect Non-Veg filter' : 'Show only Non-Vegetarian dishes'}
            >
              <span className='dietary-indicator-dot non-veg-dot' aria-hidden='true'></span>
              <span>{t('nonVeg')}</span>
              {dietaryFilter === 'non-veg' && (
                <span 
                  className='dietary-cross-icon' 
                  aria-label='Clear Non-Veg filter' 
                  title='Click to clear Non-Veg filter'
                  onClick={(e) => {
                    e.stopPropagation();
                    setDietaryFilter(null);
                  }}
                >
                  ✕
                </span>
              )}
            </button>
          </div>

          {/* Top Rated Toggle */}
          <button
            type='button'
            role='button'
            aria-pressed={topRatedOnly}
            className={`filter-chip-btn ${topRatedOnly ? 'active-gold' : ''}`}
            onClick={() => setTopRatedOnly(!topRatedOnly)}
            title='Toggle 4.6+ rated dishes'
          >
            <span>{t('rated46Plus')}</span>
          </button>

          {/* Sort Dropdown */}
          <div className='sort-select-wrapper'>
            <span className='sort-icon' aria-hidden='true'>⚡</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='sort-select-input'
              aria-label='Sort dishes'
            >
              <option value='default'>{t('featured')}</option>
              <option value='price-low'>{t('priceLowToHigh')}</option>
              <option value='price-high'>{t('priceHighToLow')}</option>
              <option value='rating-high'>{t('topRatedFirst')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* DISHES GRID OR HELPFUL EMPTY STATE */}
      {filteredDishes.length === 0 ? (
        <div className='no-dishes-found' role='status' aria-live='polite'>
          <span className='empty-dish-icon' aria-hidden='true'>🍽️</span>
          <h3>{t('noDishesFound')}</h3>
          <p>
            {dietaryFilter
              ? `There are no ${dietaryFilter === 'veg' ? t('pureVeg') : t('nonVeg')} dishes found${category !== 'All' ? ` in the "${category}" category` : ''}.`
              : `No dishes found${category !== 'All' ? ` for "${category}"` : ''}.`}
          </p>
          <div className='empty-actions-row'>
            {dietaryFilter && (
              <button
                type='button'
                onClick={() => setDietaryFilter(null)}
                className='btn-clear-dietary'
              >
                {t('clearDietaryFilter')} ({dietaryFilter === 'veg' ? t('veg') : t('nonVeg')})
              </button>
            )}
            <button
              type='button'
              onClick={() => {
                setDietaryFilter(null);
                setTopRatedOnly(false);
                setSortBy('default');
              }}
              className='btn-reset-filters'
            >
              {t('resetFilters')}
            </button>
          </div>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredDishes.map((item, index) => (
            <FoodItem
              key={item._id || index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
              category={item.category}
              isNonVeg={item.isVeg === false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;