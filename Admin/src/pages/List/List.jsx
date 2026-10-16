import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = ({ url, token, user }) => {
  const [list, setList] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === 'admin';

  // Load restaurants list for admin filter
  useEffect(() => {
    if (isSuperAdmin && token) {
      axios
        .get(`${url}/api/restaurant/admin/list`, { headers: { token } })
        .then((res) => {
          if (res.data.success) {
            setRestaurants(res.data.restaurants || []);
          }
        })
        .catch((e) => console.warn(e.message));
    }
  }, [isSuperAdmin, token]);

  const fetchList = async () => {
    setLoading(true);
    let fetchUrl = `${url}/api/food/list`;

    if (!isSuperAdmin && user?.restaurantId) {
      fetchUrl += `?restaurantId=${user.restaurantId}`;
    } else if (isSuperAdmin && selectedRestaurant !== 'all') {
      fetchUrl += `?restaurantId=${selectedRestaurant}`;
    }

    try {
      const response = await axios.get(fetchUrl);
      if (response.data.success) {
        setList(response.data.data || []);
      } else {
        toast.error('Failed to fetch food items');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [selectedRestaurant, user]);

  const removeFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this menu dish?')) return;

    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error removing food item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const response = await axios.patch(
        `${url}/api/food/availability`,
        { id: item._id, isAvailable: !item.isAvailable },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setList((prev) =>
          prev.map((f) => (f._id === item._id ? { ...f, isAvailable: !f.isAvailable } : f))
        );
      }
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  return (
    <div className='list add flex-col'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3>{isSuperAdmin ? '🍽️ Platform Food Catalog' : '🍽️ My Restaurant Menu'}</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {list.length} dishes available
          </p>
        </div>

        {/* Restaurant Filter for Admin */}
        {isSuperAdmin && restaurants.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Filter Restaurant:</span>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
            >
              <option value='all'>All Restaurants ({restaurants.length})</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.address?.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ marginTop: '20px', color: '#64748b' }}>Loading menu items...</p>
      ) : list.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: '12px', marginTop: '20px' }}>
          <p>No dishes found for this restaurant.</p>
        </div>
      ) : (
        <div className='list-table'>
          <div className='list-table-format title'>
            <b>Image</b>
            <b>Name & Type</b>
            <b>Restaurant</b>
            <b>Category</b>
            <b>Price</b>
            <b>Status</b>
            <b>Action</b>
          </div>
          {list.map((item, index) => {
            const isVeg = item.isVeg !== false;
            return (
              <div key={index} className='list-table-format' style={{ alignItems: 'center' }}>
                <img
                  src={item.image?.startsWith('http') ? item.image : `${url}/images/${item.image}`}
                  alt=''
                  style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>{item.name}</p>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', marginTop: '3px' }}>
                    <span style={{ fontSize: '11px', color: isVeg ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
                      {isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                    </span>
                    {item.mealType && (
                      <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: '600' }}>
                        🍽️ {item.mealType}
                      </span>
                    )}
                    {item.spiceLevel && (
                      <span style={{ fontSize: '10px', background: '#fef2f2', color: '#dc2626', padding: '1px 5px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: '600' }}>
                        🌶️ {item.spiceLevel}
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                  {item.restaurantId?.name || 'QuickBites Central'}
                </p>
                <p style={{ margin: 0 }}>{item.category}</p>
                <p style={{ margin: 0, fontWeight: '800', color: '#2563eb' }}>₹{item.price}</p>
                <div>
                  <button
                    type='button'
                    onClick={() => toggleAvailability(item)}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: item.isAvailable ? '#dcfce7' : '#fee2e2',
                      color: item.isAvailable ? '#166534' : '#991b1b'
                    }}
                  >
                    {item.isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                  </button>
                </div>
                <p
                  onClick={() => removeFood(item._id)}
                  className='cursor'
                  style={{ color: '#ef4444', fontWeight: '900', fontSize: '15px' }}
                  title='Delete dish'
                >
                  ✕
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default List;