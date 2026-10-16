import React, { useEffect, useState } from 'react';
import './Add.css';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const Add = ({ url, token, user }) => {
  const [image, setImage] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
    isVeg: true,
    prepTimeMinutes: 20,
    restaurantId: '',
    mealType: 'regular',
    spiceLevel: 'medium'
  });

  const isSuperAdmin = user?.role === 'admin';

  // If Admin, fetch all active restaurants so admin can assign dish to any restaurant
  useEffect(() => {
    if (isSuperAdmin && token) {
      axios
        .get(`${url}/api/restaurant/admin/list?status=approved`, { headers: { token } })
        .then((res) => {
          if (res.data.success && res.data.restaurants.length > 0) {
            setRestaurants(res.data.restaurants);
            setData((prev) => ({ ...prev, restaurantId: res.data.restaurants[0]._id }));
          }
        })
        .catch((e) => console.warn('Could not fetch restaurants for admin selector:', e.message));
    }
  }, [isSuperAdmin, token]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) {
      toast.error('Please upload an image for the dish');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', Number(data.price));
    formData.append('category', data.category);
    formData.append('isVeg', data.isVeg);
    formData.append('prepTimeMinutes', Number(data.prepTimeMinutes));
    formData.append('mealType', data.mealType);
    formData.append('spiceLevel', data.spiceLevel);
    if (isSuperAdmin && data.restaurantId) {
      formData.append('restaurantId', data.restaurantId);
    }
    formData.append('image', image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setData({
          name: '',
          description: '',
          price: '',
          category: 'Salad',
          isVeg: true,
          prepTimeMinutes: 20,
          restaurantId: restaurants.length > 0 ? restaurants[0]._id : '',
          mealType: 'regular',
          spiceLevel: 'medium'
        });
        setImage(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add dish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <h3>🍽️ Add New Food Dish</h3>

        {/* Restaurant Selector for Platform Admin */}
        {isSuperAdmin && restaurants.length > 0 && (
          <div className='flex-col' style={{ width: '100%', maxWidth: '500px' }}>
            <p><strong>Target Restaurant:</strong></p>
            <select
              name='restaurantId'
              value={data.restaurantId}
              onChange={onChangeHandler}
              style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
            >
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.address?.city})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className='add-img-upload flex-col'>
          <p>Upload Dish Photo</p>
          <label htmlFor='image'>
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt='' />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden required />
        </div>

        <div className='add-product-name flex-col'>
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type='text'
            name='name'
            placeholder='e.g. Chicken Dum Biryani / Paneer Tikka'
            required
          />
        </div>

        <div className='add-product-description flex-col'>
          <p>Product Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name='description'
            rows='4'
            placeholder='List key ingredients, taste profile, and portion size'
            required
          />
        </div>

        <div className='add-category-price'>
          <div className='add-category flex-col'>
            <p>Category</p>
            <select onChange={onChangeHandler} name='category' value={data.category}>
              <option value='Salad'>Salad</option>
              <option value='Rolls'>Rolls</option>
              <option value='Deserts'>Deserts</option>
              <option value='Sandwich'>Sandwich</option>
              <option value='Cake'>Cake</option>
              <option value='Pure Veg'>Pure Veg</option>
              <option value='Pasta'>Pasta</option>
              <option value='Noodles'>Noodles</option>
              <option value='South Indian'>South Indian</option>
              <option value='Biryani'>Biryani</option>
              <option value='Chaap'>Chaap</option>
              <option value='Continental'>Continental</option>
              <option value='Italian'>Italian</option>
              <option value='Street Food'>Street Food</option>
              <option value='Non-Veg Specials'>Non-Veg Specials</option>
              <option value='Coffee'>Coffee</option>
              <option value='Shakes'>Shakes</option>
              <option value='Juice'>Juice</option>
            </select>
          </div>

          <div className='add-price flex-col'>
            <p>Price (₹)</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type='number'
              name='price'
              placeholder='₹199'
              required
            />
          </div>
        </div>

        {/* Meal Type & Spice Level (For Aaj Kya Khau? Meal Picker & Discovery) */}
        <div className='add-category-price'>
          <div className='add-category flex-col'>
            <p>Meal Fullness (Meal Picker)</p>
            <select onChange={onChangeHandler} name='mealType' value={data.mealType}>
              <option value='light'>Light (Snack / Quick Bite)</option>
              <option value='regular'>Regular (Standard Meal)</option>
              <option value='filling'>Filling (Heavy / Hearty)</option>
            </select>
          </div>

          <div className='add-category flex-col'>
            <p>Spice Level</p>
            <select onChange={onChangeHandler} name='spiceLevel' value={data.spiceLevel}>
              <option value='mild'>Mild (Non-Spicy)</option>
              <option value='medium'>Medium (Balanced)</option>
              <option value='spicy'>Spicy (Hot & Fiery)</option>
            </select>
          </div>
        </div>

        {/* Dietary & Preparation Controls */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700' }}>
            <input
              type='checkbox'
              name='isVeg'
              checked={data.isVeg}
              onChange={onChangeHandler}
              style={{ width: '18px', height: '18px' }}
            />
            {data.isVeg ? '🌱 Pure Vegetarian' : '🍗 Non-Vegetarian'}
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Prep Time:</span>
            <input
              type='number'
              name='prepTimeMinutes'
              min='5'
              max='90'
              value={data.prepTimeMinutes}
              onChange={onChangeHandler}
              style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>mins</span>
          </div>
        </div>

        <button type='submit' className='add-btn' disabled={loading}>
          {loading ? 'Adding...' : 'Add Dish to Menu 🚀'}
        </button>
      </form>
    </div>
  );
};

export default Add;