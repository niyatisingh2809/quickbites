import React, { useContext, useState } from 'react';
import './FavoritesPage.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import FoodItem from '../../components/FoodItem/FoodItem';

const FavoritesPage = () => {
  const { favorites, token, toggleFavoriteRestaurant } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('foods');
  const navigate = useNavigate();

  const favoriteFoods = favorites?.foods || [];
  const favoriteRestaurants = favorites?.restaurants || [];

  if (!token) {
    return (
      <div className="favorites-page">
        <div className="favorites-auth-gate">
          <div className="auth-gate-icon">❤️</div>
          <h2>Your Favorites Await</h2>
          <p>Log in to view and manage your saved dishes and beloved restaurants.</p>
          <button className="btn-explore-menu" onClick={() => navigate('/')}>
            Go to Home & Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div>
          <h1 className="favorites-title">My Favorites ❤️</h1>
          <p className="favorites-subtitle">
            Quickly re-order the dishes and kitchens you love the most
          </p>
        </div>
        <div className="favorites-tab-pills">
          <button
            type="button"
            className={`tab-pill ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            🍲 Dishes ({favoriteFoods.length})
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            🏪 Kitchens ({favoriteRestaurants.length})
          </button>
        </div>
      </div>

      {activeTab === 'foods' ? (
        favoriteFoods.length === 0 ? (
          <div className="favorites-empty-box">
            <div className="empty-icon">🍽️</div>
            <h3>No Favorite Dishes Yet</h3>
            <p>Tap the heart icon on any dish card across the menu to save it here for fast reordering!</p>
            <button className="btn-explore-menu" onClick={() => navigate('/')}>
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteFoods.map((item) => (
              <FoodItem
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                description={item.description}
                image={item.image}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                category={item.category}
                isNonVeg={item.isNonVeg}
              />
            ))}
          </div>
        )
      ) : (
        favoriteRestaurants.length === 0 ? (
          <div className="favorites-empty-box">
            <div className="empty-icon">🏪</div>
            <h3>No Favorite Kitchens Yet</h3>
            <p>Save your go-to restaurants and thali kitchens to check their daily specials in one click!</p>
            <button className="btn-explore-menu" onClick={() => navigate('/')}>
              Browse Kitchens
            </button>
          </div>
        ) : (
          <div className="fav-restaurants-grid">
            {favoriteRestaurants.map((rest) => (
              <div key={rest._id} className="fav-restaurant-card">
                <div className="fav-rest-header">
                  <div>
                    <h3 className="fav-rest-name">{rest.name}</h3>
                    <p className="fav-rest-cuisine">
                      {Array.isArray(rest.cuisine) ? rest.cuisine.join(' • ') : rest.cuisine || 'Multi-Cuisine'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="fav-rest-remove-btn"
                    onClick={() => toggleFavoriteRestaurant(rest._id)}
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                </div>
                <div className="fav-rest-meta">
                  <span>⭐ {rest.rating || '4.5'}</span>
                  <span>⏱️ 25-35 mins</span>
                  <span>📦 ₹{rest.packagingFee || 20} packaging</span>
                </div>
                {rest.address && (
                  <p className="fav-rest-address">
                    📍 {rest.address.area || rest.address.city || 'Local Pilot Hub'}
                  </p>
                )}
                <div className="fav-rest-footer">
                  <span className={`fav-rest-status ${rest.isOpen !== false ? 'open' : 'closed'}`}>
                    {rest.isOpen !== false ? '● Open Now' : '○ Closed'}
                  </span>
                  <button
                    type="button"
                    className="btn-view-kitchen"
                    onClick={() => navigate(`/?restaurant=${rest._id}`)}
                  >
                    View Menu →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default FavoritesPage;
