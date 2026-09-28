import React, { useState, useEffect, useContext, useRef } from 'react';
import './SearchModal.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ showSearch, setShowSearch }) => {
  const { food_list, url, cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Popular search suggestions
  const trendingTags = [
    "Masala Dosa", "Filter Coffee", "KitKat Shake", 
    "Hakka Noodles", "Paneer Butter Masala", "Truffle Cake", 
    "Caesar Salad", "Kiwi Juice", "Cold Brew", "Alfredo Pasta"
  ];

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [showSearch]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, setShowSearch]);

  if (!showSearch) return null;

  const filteredDishes = searchTerm.trim() === ''
    ? []
    : food_list.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      });

  const handleDishClick = (item) => {
    setShowSearch(false);
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('food-display');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="search-modal-backdrop" onClick={() => setShowSearch(false)}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="search-modal-input-wrap">
          <span className="search-input-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search 120+ dishes, shakes, coffee, cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
          <button className="search-modal-close-btn" onClick={() => setShowSearch(false)}>
            Close
          </button>
        </div>

        {/* Trending Tags (Shown when input is empty) */}
        {searchTerm.trim() === '' ? (
          <div className="search-suggestions-section">
            <p className="search-section-title">🔥 Trending & Popular Searches</p>
            <div className="search-tags-cloud">
              {trendingTags.map((tag, idx) => (
                <button
                  key={idx}
                  className="search-tag-chip"
                  onClick={() => setSearchTerm(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="search-featured-box">
              <p className="search-section-title">✨ Recommended for you</p>
              <div className="search-featured-list">
                {food_list.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="search-featured-item" onClick={() => handleDishClick(item)}>
                    <img
                      src={item.image?.startsWith("http") ? item.image : `/images/${item.image}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        if (url && !e.target.src.includes(url)) e.target.src = `${url}/images/${item.image}`;
                      }}
                      alt={item.name}
                    />
                    <div>
                      <p className="featured-name">{item.name}</p>
                      <span className="featured-price">₹{item.price} • {item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div className="search-results-section">
            <p className="search-results-count">
              Found <b>{filteredDishes.length}</b> {filteredDishes.length === 1 ? 'dish' : 'dishes'} for "{searchTerm}"
            </p>

            {filteredDishes.length === 0 ? (
              <div className="search-no-results">
                <span className="no-results-emoji">🍽️</span>
                <h4>No dishes found</h4>
                <p>Try searching for "dosa", "coffee", "shake", "pasta", or "noodles".</p>
              </div>
            ) : (
              <div className="search-results-grid">
                {filteredDishes.map((item) => {
                  const qty = cartItems[item._id] || 0;
                  return (
                    <div key={item._id} className="search-result-card">
                      <div className="search-result-img-wrap" onClick={() => handleDishClick(item)}>
                        <img
                          src={item.image?.startsWith("http") ? item.image : `/images/${item.image}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            if (url && !e.target.src.includes(url)) e.target.src = `${url}/images/${item.image}`;
                          }}
                          alt={item.name}
                        />
                        <span className="search-card-category">{item.category}</span>
                      </div>

                      <div className="search-result-info">
                        <div className="search-card-top-row">
                          <h4 className="search-card-title" onClick={() => handleDishClick(item)}>
                            {item.name}
                          </h4>
                          <span className="search-rating-badge">
                            ★ {(item.rating || 4.5).toFixed(1)}
                          </span>
                        </div>
                        <p className="search-card-desc">{item.description}</p>
                        
                        <div className="search-card-bottom-row">
                          <span className="search-card-price">₹{item.price}</span>
                          
                          {qty === 0 ? (
                            <button
                              className="search-add-btn"
                              onClick={() => addToCart(item._id)}
                            >
                              + Add
                            </button>
                          ) : (
                            <div className="search-item-counter">
                              <button onClick={() => removeFromCart(item._id)} className="counter-btn">-</button>
                              <span className="counter-num">{qty}</span>
                              <button onClick={() => addToCart(item._id)} className="counter-btn">+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
