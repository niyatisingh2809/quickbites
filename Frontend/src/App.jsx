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
import ThaliPage from './pages/Thali/ThaliPage';
import MealPickerPage from './pages/MealPicker/MealPickerPage';
import CustomerTicketsPage from './pages/Support/CustomerTicketsPage';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import DailyPage from './pages/Daily/DailyPage';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className='app-layout'>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      <SearchModal showSearch={showSearch} setShowSearch={setShowSearch} />
      
      {/* Full-width sticky top app navbar header */}
      <header className='app-header-bar'>
        <div className='app-header-inner'>
          <Navbar setShowLogin={setShowLogin} setShowSearch={setShowSearch} />
        </div>
      </header>

      {/* Responsive full-screen main content */}
      <main className='app-main-content'>
        <div className='app'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/daily' element={<DailyPage />} />
            <Route path='/thali' element={<ThaliPage />} />
            <Route path='/aaj-kya-khau' element={<MealPickerPage />} />
            <Route path='/favorites' element={<FavoritesPage />} />
            <Route path='/cart' element={<Cart setShowLogin={setShowLogin} />} />
            <Route path='/order' element={<PlaceOrder setShowLogin={setShowLogin} />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/myorders' element={<MyOrders setShowLogin={setShowLogin} />} />
            <Route path='/track/:orderId' element={<TrackOrder />} />
            <Route path='/support/tickets' element={<CustomerTicketsPage />} />
            <Route path='/support/ticket/:ticketId' element={<CustomerTicketsPage />} />
          </Routes>
        </div>
      </main>

      <FloatingCartBar setShowLogin={setShowLogin} />
      <Footer />
    </div>
  );
};

export default App;