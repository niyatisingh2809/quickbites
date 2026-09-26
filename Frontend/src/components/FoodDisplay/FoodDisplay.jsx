import React, { useContext, useState, useMemo } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  const [vegOnly, setVegOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Helper to detect if dish is non-veg by name or category
  const isNonVegDish = (item) => {
    const text = `${item.name} ${item.category} ${item.description}`.toLowerCase();
    return text.includes('chicken') || text.includes('egg') || text.includes('fish') || text.includes('mutton') || text.includes('meat') || text.includes('prawn');
  };

  // Filter & sort dishes
  const filteredDishes = useMemo(() => {
    let result = food_list.filter((item) => {
      // Category filter
      if (category !== 'All' && item.category !== category) return false;

      // Veg only filter
      if (vegOnly && isNonVegDish(item)) return false;

      // Top rated only filter
      if (topRatedOnly && parseFloat(item.rating || 4.5) < 4.6) return false;

      return true;
    });

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-high') {
      result.sort((a, b) => parseFloat(b.rating || 4.5) - parseFloat(a.rating || 4.5));
    }

    return result;
  }, [food_list, category, vegOnly, topRatedOnly, sortBy]);

  return (
    <div className='food-display-wrap' id='food-display'>
      {/* HEADER WITH CONTROLS & FILTER BAR */}
      <div className='food-display-header'>
        <div>
          <span className='dishes-eyebrow'>🔥 FRESHLY PREPARED</span>
          <h2 className='dishes-main-title'>
            Top Dishes Near You
            {category !== 'All' && <span className='category-title-badge'>• {category}</span>}
          </h2>
          <p className='dishes-count-label'>
            Showing <b>{filteredDishes.length}</b> delicious options ready for lightning delivery
          </p>
        </div>

        {/* CONTROLS BAR: FILTERS & SORT */}
        <div className='food-filter-controls'>
          {/* Veg Only Toggle */}
          <button
            type='button'
            className={`filter-chip-btn ${vegOnly ? 'active-veg' : ''}`}
            onClick={() => setVegOnly(!vegOnly)}
          >
            <span className='veg-symbol-icon'>🟢</span>
            <span>Pure Veg</span>
          </button>

          {/* Top Rated Toggle */}
          <button
            type='button'
            className={`filter-chip-btn ${topRatedOnly ? 'active-gold' : ''}`}
            onClick={() => setTopRatedOnly(!topRatedOnly)}
          >
            <span>⭐ 4.6+ Rated</span>
          </button>

          {/* Sort Dropdown */}
          <div className='sort-select-wrapper'>
            <span className='sort-icon'>⚡</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='sort-select-input'
            >
              <option value='default'>Featured</option>
              <option value='price-low'>Price: Low to High</option>
              <option value='price-high'>Price: High to Low</option>
              <option value='rating-high'>Top Rated First</option>
            </select>
          </div>
        </div>
      </div>

      {/* DISHES GRID */}
      {filteredDishes.length === 0 ? (
        <div className='no-dishes-found'>
          <span className='empty-dish-icon'>🍽️</span>
          <h3>No dishes match your selected filters</h3>
          <p>Try resetting the "Pure Veg" or "Top Rated" filter to view more dishes.</p>
          <button
            onClick={() => { setVegOnly(false); setTopRatedOnly(false); setSortBy('default'); }}
            className='btn-reset-filters'
          >
            Reset Filters
          </button>
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
              isNonVeg={isNonVegDish(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;