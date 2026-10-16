import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AppDownload/AppDownload';
import HomeFeatureCards from '../../components/HomeFeatureCards/HomeFeatureCards';

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div className='home-page'>
      <Header setCategory={setCategory} />
      <HomeFeatureCards />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} setCategory={setCategory} />
      <AppDownload />
    </div>
  );
};

export default Home;