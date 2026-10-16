import React, { useState, useEffect } from 'react';
import './AppDownload.css';
import { assets } from '../../assets/assets';

const AppDownload = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredAppPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredAppPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (window.deferredAppPrompt) {
      window.deferredAppPrompt.prompt();
      const choice = await window.deferredAppPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      window.deferredAppPrompt = null;
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // General guidance or trigger browser address bar install
      alert('To install QuickBites as an app:\n\n1. On Android/Chrome: Tap the 3 dots (⋮) menu and select "Install app" or "Add to Home Screen".\n2. On Desktop: Click the Install icon (💻) in your address bar.');
    }
  };

  return (
    <div className='app-download-section' id='app-download'>
      <div className='app-download-card'>
        <div className='app-download-content'>
          <span className='app-badge-pill'>⚡ LIGHTNING FAST EXPERIENCE</span>
          <h2 className='app-download-title'>
            Use QuickBites in Full-Screen <br />
            <span className='app-highlight-text'>Mobile & Desktop App</span>
          </h2>
          <p className='app-download-desc'>
            Install QuickBites on your phone or computer for instant access, live order tracking, offline menu browsing, and exclusive instant discounts. No 50MB download needed!
          </p>

          <div className='app-actions-row'>
            {isInstalled ? (
              <div className='app-installed-badge'>
                <span>✅ QuickBites App Installed & Ready</span>
              </div>
            ) : (
              <button 
                type='button' 
                className='btn-install-app-main'
                onClick={handleInstallClick}
                title='Install QuickBites as an App'
              >
                <span className='btn-install-icon'>📲</span>
                <span className='btn-install-text'>Install QuickBites App</span>
              </button>
            )}

            <div className='app-download-platforms'>
              <div 
                className='platform-badge-btn' 
                onClick={handleInstallClick}
                role='button'
                tabIndex={0}
                title='Get on Google Play'
              >
                <img src={assets.play_store} alt='Google Play Store' />
              </div>
              <div 
                className='platform-badge-btn' 
                onClick={handleInstallClick}
                role='button'
                tabIndex={0}
                title='Download on App Store'
              >
                <img src={assets.app_store} alt='Apple App Store' />
              </div>
            </div>
          </div>
        </div>

        <div className='app-preview-visual'>
          <div className='app-phone-mockup'>
            <div className='mockup-screen'>
              <div className='mockup-notch'></div>
              <div className='mockup-header'>
                <span className='mockup-logo'>⚡🍔 QuickBites</span>
                <span className='mockup-dot'></span>
              </div>
              <div className='mockup-banner'>
                <span>🔥 10-Min Fast Delivery</span>
              </div>
              <div className='mockup-items'>
                <div className='mockup-item-row'>
                  <div className='mockup-thumb'>🍱</div>
                  <div className='mockup-meta'>
                    <div className='mockup-line-1'></div>
                    <div className='mockup-line-2'></div>
                  </div>
                </div>
                <div className='mockup-item-row'>
                  <div className='mockup-thumb'>🍲</div>
                  <div className='mockup-meta'>
                    <div className='mockup-line-1'></div>
                    <div className='mockup-line-2'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className='ios-guide-modal-overlay' onClick={() => setShowIosGuide(false)}>
          <div className='ios-guide-card' onClick={(e) => e.stopPropagation()}>
            <div className='ios-guide-header'>
              <h3>Install on iPhone / iPad</h3>
              <button type='button' className='ios-guide-close' onClick={() => setShowIosGuide(false)}>✕</button>
            </div>
            <div className='ios-guide-body'>
              <ol className='ios-steps-list'>
                <li>
                  Tap the <b>Share</b> button <span className='ios-icon-share'>⎋</span> at the bottom of your Safari screen.
                </li>
                <li>
                  Scroll down and tap <b>Add to Home Screen</b> <span className='ios-icon-plus'>➕</span>.
                </li>
                <li>
                  Tap <b>Add</b> in the top right corner.
                </li>
              </ol>
              <p className='ios-guide-note'>
                QuickBites will launch as a full-screen native app without the Safari browser address bar!
              </p>
            </div>
            <button type='button' className='ios-guide-done-btn' onClick={() => setShowIosGuide(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDownload;