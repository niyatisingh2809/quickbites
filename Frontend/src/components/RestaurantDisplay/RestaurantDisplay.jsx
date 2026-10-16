import React, { useContext } from 'react';
import './RestaurantDisplay.css';
import { StoreContext } from '../../Context/StoreContext';

const RestaurantDisplay = ({ selectedRestaurant, setSelectedRestaurant }) => {
  const { restaurants, currentLocation, url } = useContext(StoreContext);

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <div className='restaurant-display' id='restaurant-display'>
      <div className='restaurant-display-header'>
        <div>
          <h2>Featured Kitchens & Restaurants</h2>
          <p className='restaurant-sub'>
            Serving authentic meals directly to <strong>📍 {currentLocation.city}</strong>
          </p>
        </div>
        {selectedRestaurant && (
          <button
            type='button'
            className='btn-clear-restaurant-filter'
            onClick={() => setSelectedRestaurant(null)}
          >
            ✕ View All Restaurants
          </button>
        )}
      </div>

      <div className='restaurants-scroll-grid'>
        {restaurants.map((rest) => {
          const isSelected = selectedRestaurant === rest._id;
          return (
            <div
              key={rest._id}
              className={`restaurant-customer-card ${isSelected ? 'active-selected' : ''}`}
              onClick={() => setSelectedRestaurant(isSelected ? null : rest._id)}
            >
              <div className='rest-card-image-wrap'>
                <img
                  src={
                    rest.image?.startsWith('http')
                      ? rest.image
                      : rest.image === 'header_img.png'
                      ? '/header_img.png'
                      : `${url}/images/${rest.image}`
                  }
                  alt={rest.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/header_img.png';
                  }}
                />
                <span className={`rest-open-pill ${rest.isOpen ? 'open' : 'closed'}`}>
                  {rest.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                </span>
                <span className='rest-prep-pill'>⏱️ {rest.avgPrepTimeMinutes || 25}m</span>
              </div>

              <div className='rest-card-body'>
                <div className='rest-card-title-row'>
                  <h4 className='rest-card-name'>{rest.name}</h4>
                  <span className='rest-card-rating'>⭐ {rest.rating || 4.5}</span>
                </div>

                <p className='rest-card-cuisines'>
                  {Array.isArray(rest.cuisine) ? rest.cuisine.join(' • ') : rest.cuisine}
                </p>

                <div className='rest-card-footer'>
                  <span className='rest-locality-tag'>📍 {rest.address?.city}</span>
                  <span className='rest-packaging-tag'>Pkg: ₹{rest.packagingFee || 20}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantDisplay;
