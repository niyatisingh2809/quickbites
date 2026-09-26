import React, { useState } from 'react';
import Navbar from './pages/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import FloatingCartBar from './components/FloatingCartBar/FloatingCartBar';
import SearchModal from './components/SearchModal/SearchModal';
import TrackOrder from './pages/TrackOrder/TrackOrder';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      <SearchModal showSearch={showSearch} setShowSearch={setShowSearch} />
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} setShowSearch={setShowSearch} />  
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart setShowLogin={setShowLogin} />} />
          <Route path='/order' element={<PlaceOrder setShowLogin={setShowLogin} />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders setShowLogin={setShowLogin} />} />
          <Route path='/track/:orderId' element={<TrackOrder />} />
        </Routes>
      </div>
      <FloatingCartBar setShowLogin={setShowLogin} />
      <Footer />
    </>
  );
};

export default App;