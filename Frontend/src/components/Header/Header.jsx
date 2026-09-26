import React, { useState } from 'react';
import './Header.css';

const Header = ({ setCategory }) => {
  const [searchVal, setSearchVal] = useState('');

  const handleQuickTagClick = (catName) => {
    if (setCategory) setCategory(catName);
    const target = document.getElementById('explore-menu') || document.getElementById('food-display');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const target = document.getElementById('food-display');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='hero-banner-wrap' id='header'>
      <div className='hero-card'>
        {/* Soft background ambient glow spots */}
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>

        <div className="hero-grid">
          {/* LEFT CONTENT COLUMN */}
          <div className='hero-left-content'>
            {/* Live Express Delivery Badge */}
            <div className='hero-pill-badge'>
              <span className='pulse-dot'></span>
              <span>⚡ 10-Minute Express Delivery • Noida & Delhi NCR</span>
            </div>

            {/* Main Headline with High-Impact Typography */}
            <h1 className='hero-headline'>
              Crave it. Order it.<br />
              <span className='hero-accent-text'>Delivered in 10 Mins!</span>
            </h1>

            {/* Subtitle */}
            <p className='hero-subtext'>
              Aapki har craving ka instant ilaaj! From hot sizzling rolls and wholesome thalis to artisanal coffee and delicious desserts — cooked fresh and delivered at lightning speed.
            </p>

            {/* Quick Hero Search Bar */}
            <form onSubmit={handleSearchSubmit} className='hero-search-box'>
              <span className='hero-search-icon'>🔍</span>
              <input
                type='text'
                placeholder='Search "Paneer Tikka", "Cold Coffee", "Biryani"...'
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className='hero-search-input'
              />
              <button type='submit' className='btn-hero-search'>
                Find Food
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div className='hero-quick-tags'>
              <span className='quick-tag-label'>Popular:</span>
              <button type="button" onClick={() => handleQuickTagClick('Rolls')} className='quick-tag-pill'>🌯 Rolls</button>
              <button type="button" onClick={() => handleQuickTagClick('Coffee')} className='quick-tag-pill'>☕ Coffee</button>
              <button type="button" onClick={() => handleQuickTagClick('South Indian')} className='quick-tag-pill'>🥘 South Indian</button>
              <button type="button" onClick={() => handleQuickTagClick('Pure Veg')} className='quick-tag-pill'>🥗 Veg Meals</button>
              <button type="button" onClick={() => handleQuickTagClick('Pasta')} className='quick-tag-pill'>🍝 Pasta</button>
            </div>

            {/* Trust Stats Bar */}
            <div className='hero-stats-row'>
              <div className='hero-stat-item'>
                <span className='stat-val'>⭐ 4.9 / 5</span>
                <span className='stat-lbl'>50k+ Happy Foodies</span>
              </div>
              <div className='stat-divider'></div>
              <div className='hero-stat-item'>
                <span className='stat-val'>⚡ 10-15 Mins</span>
                <span className='stat-lbl'>Average Delivery</span>
              </div>
              <div className='stat-divider'></div>
              <div className='hero-stat-item'>
                <span className='stat-val'>🛡️ 100% Fresh</span>
                <span className='stat-lbl'>Hygienic Kitchens</span>
              </div>
            </div>
          </div>

          {/* RIGHT VISUAL SHOWCASE */}
          <div className='hero-right-visual'>
            <div className='hero-image-card-wrap'>
              <div className='hero-image-frame'>
                <img src='/header_img.png' alt='QuickBites Delicious Food' className='hero-main-dish-img' />
              </div>

              {/* Floating Badge 1: Promo Offer */}
              <div className='floating-chip chip-promo'>
                <span className='chip-icon'>🔥</span>
                <div>
                  <p className='chip-title'>FLAT 50% OFF</p>
                  <span className='chip-sub'>Use Code: <b>QUICK50</b></span>
                </div>
              </div>

              {/* Floating Badge 2: Live Rider Status */}
              <div className='floating-chip chip-rider'>
                <span className='chip-icon'>🛵</span>
                <div>
                  <p className='chip-title'>Live Rider Tracking</p>
                  <span className='chip-sub'>Sector 18 Store En Route</span>
                </div>
              </div>

              {/* Floating Badge 3: Fresh & Hot */}
              <div className='floating-chip chip-rating'>
                <span className='chip-icon'>👨‍🍳</span>
                <div>
                  <p className='chip-title'>Cooked Fresh & Hot</p>
                  <span className='chip-sub'>100% Fresh Ingredients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;