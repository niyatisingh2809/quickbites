import React, { useEffect, useState, useContext } from 'react';
import './ThaliPage.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import ThaliBuilderModal from '../../components/ThaliBuilder/ThaliBuilderModal';
import { useNavigate } from 'react-router-dom';

const ThaliPage = () => {
  const { url, addThaliToCart, currentLocation } = useContext(StoreContext);
  const [thalis, setThalis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchThalis = async () => {
      setLoading(true);
      try {
        const cityParam = currentLocation?.city ? `?city=${encodeURIComponent(currentLocation.city)}` : '';
        let res = await axios.get(`${url}/api/thali/list${cityParam}`);
        if (res.data.success && res.data.templates && res.data.templates.length > 0) {
          setThalis(res.data.templates);
        } else {
          // If city-specific fetch returned 0, fallback to all available templates
          const fallbackRes = await axios.get(`${url}/api/thali/list`);
          if (fallbackRes.data.success) {
            setThalis(fallbackRes.data.templates || []);
          }
        }
      } catch (err) {
        console.warn('Failed to load thali templates:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchThalis();
  }, [url, currentLocation?.city]);

  const handleSaveThali = (thaliPayload) => {
    addThaliToCart(thaliPayload);
    setToastMessage(`🎉 "${thaliPayload.templateName}" added to your cart!`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  return (
    <div className='thali-page'>
      {/* Header */}
      <div className='thali-page-header'>
        <span className='thali-page-badge'>🍱 Custom Homestyle Meals</span>
        <h1>Build Your Own Thali</h1>
        <p>
          Customize your complete Indian meal step-by-step. Choose your favorite breads, rice, dal,
          special sabzi, and desserts — freshly prepared by our partner kitchens.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>Loading fresh Thali templates...</p>
        </div>
      ) : thalis.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px' }}>
          <h3>No Thalis available right now in {currentLocation?.city || 'your area'}.</h3>
          <p style={{ color: '#64748b' }}>Please check back soon or try selecting Delhi NCR from location selector.</p>
        </div>
      ) : (
        <div className='thali-grid'>
          {thalis.map((thali) => (
            <div key={thali._id} className='thali-card'>
              <div className='thali-card-img-wrap'>
                <img
                  src={thali.image?.startsWith('http') ? thali.image : `/images/${thali.image || 'food_veg_thali.jpg'}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/food_veg_thali.jpg';
                  }}
                  alt={thali.name}
                  className='thali-card-img'
                />
                {thali.isVeg && (
                  <span className='thali-card-veg-tag'>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span>
                    Pure Veg
                  </span>
                )}
              </div>

              <div className='thali-card-content'>
                <span className='thali-card-restaurant'>
                  🏪 {thali.restaurantId?.name || 'QuickBites Kitchen'}
                </span>
                <h3 className='thali-card-title'>{thali.name}</h3>
                <p className='thali-card-desc'>{thali.description}</p>

                {/* Groups preview */}
                {thali.componentGroups && thali.componentGroups.length > 0 && (
                  <div className='thali-groups-preview'>
                    <div className='thali-groups-preview-title'>Included Customizations:</div>
                    <div className='thali-groups-chips'>
                      {thali.componentGroups.map((grp) => (
                        <span key={grp.groupId} className='thali-group-chip'>
                          {grp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className='thali-card-footer'>
                  <div>
                    <div className='thali-base-price-label'>Starts from</div>
                    <div className='thali-base-price-num'>₹{thali.basePriceRupees}</div>
                  </div>

                  <button className='thali-build-btn' onClick={() => setActiveTemplate(thali)}>
                    <span>⚙️</span> Customize Thali
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Builder Modal */}
      {activeTemplate && (
        <ThaliBuilderModal
          isOpen={Boolean(activeTemplate)}
          onClose={() => setActiveTemplate(null)}
          onCancel={() => setActiveTemplate(null)}
          template={activeTemplate}
          onSave={handleSaveThali}
        />
      )}

      {/* Quick Cart Notification Toast */}
      {toastMessage && (
        <div className='thali-feedback-toast'>
          <span>{toastMessage}</span>
          <button className='thali-toast-link' onClick={() => navigate('/cart')}>
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
};

export default ThaliPage;
