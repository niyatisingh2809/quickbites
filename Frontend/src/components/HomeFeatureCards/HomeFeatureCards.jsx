import React, { useContext } from 'react';
import './HomeFeatureCards.css';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../Context/LanguageContext';

const HomeFeatureCards = () => {
  const navigate = useNavigate();
  const langCtx = useContext(LanguageContext);
  const t = langCtx?.t || ((k) => k);

  return (
    <section className='home-feature-cards-section' aria-label='QuickBites Special Features'>
      {/* Card 1: Build Your Own Thali */}
      <div 
        className='feature-card feature-card-thali' 
        onClick={() => navigate('/thali')}
        role='region'
        aria-label={t('thaliCardTitle')}
      >
        <div className='feature-card-top'>
          <div className='feature-card-badge badge-thali'>
            <span>🍱 CUSTOMIZE YOUR THALI</span>
          </div>
          <div className='feature-card-icon-wrap thali-icon-wrap' aria-hidden='true'>
            <span className='feature-card-icon'>🍱</span>
          </div>
        </div>

        <div className='feature-card-body'>
          <h2 className='feature-card-title'>{t('thaliCardTitle')}</h2>
          <p className='feature-card-desc'>{t('thaliCardSub')}</p>
        </div>

        <div className='feature-card-action'>
          <button 
            type='button' 
            className='feature-btn btn-thali' 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/thali');
            }}
            aria-label={t('buildThaliBtn')}
          >
            <span>{t('buildThaliBtn')}</span>
            <span className='btn-arrow' aria-hidden='true'>→</span>
          </button>
        </div>
      </div>

      {/* Card 2: Aaj Kya Khau? */}
      <div 
        className='feature-card feature-card-picker' 
        onClick={() => navigate('/aaj-kya-khau')}
        role='region'
        aria-label={t('mealPickerTitle')}
      >
        <div className='feature-card-top'>
          <div className='feature-card-badge badge-picker'>
            <span>🎲 SMART MEAL FINDER</span>
          </div>
          <div className='feature-card-icon-wrap picker-icon-wrap' aria-hidden='true'>
            <span className='feature-card-icon'>🍽️</span>
          </div>
        </div>

        <div className='feature-card-body'>
          <h2 className='feature-card-title'>{t('mealPickerTitle')}</h2>
          <p className='feature-card-desc'>{t('mealPickerSub')}</p>
        </div>

        <div className='feature-card-action'>
          <button 
            type='button' 
            className='feature-btn btn-picker' 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/aaj-kya-khau');
            }}
            aria-label={t('helpMeChooseBtn')}
          >
            <span>{t('helpMeChooseBtn')}</span>
            <span className='btn-arrow' aria-hidden='true'>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeFeatureCards;
