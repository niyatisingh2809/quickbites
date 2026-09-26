import React, { useState, useEffect, useRef } from 'react';
import './PaymentGatewayModal.css';

// Synthesize authentic payment success chime using Web Audio API (no external audio files needed!)
const playPaymentSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // First high note (523.25 Hz - C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second celebratory note (880 Hz - A5)
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.6);
      } catch (e) {
        console.warn('Audio chime note 2 error:', e);
      }
    }, 120);
  } catch (err) {
    console.warn('Audio context error:', err);
  }
};

const PaymentGatewayModal = ({
  isOpen,
  onClose,
  amount,
  orderDetails,
  initialMethod = 'gpay',
  onPaymentSuccess
}) => {
  if (!isOpen) return null;

  // Tabs: 'upi' | 'card' | 'netbanking' | 'cod'
  const getInitialTab = (method) => {
    if (['gpay', 'paytm', 'phonepe', 'upi'].includes(method)) return 'upi';
    if (method === 'card') return 'card';
    if (method === 'netbanking') return 'netbanking';
    if (method === 'cod') return 'cod';
    return 'upi';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab(initialMethod));
  const [selectedUpiApp, setSelectedUpiApp] = useState(initialMethod === 'gpay' ? 'GPay' : (initialMethod === 'paytm' ? 'Paytm' : 'PhonePe'));
  const [upiIdInput, setUpiIdInput] = useState('');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [cardHolder, setCardHolder] = useState('NIYATI SINGH');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardType, setCardType] = useState('Visa');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // OTP Screen state
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);

  // Real-time Payment Processing Stages: 'form' | 'processing' | 'success' | 'failed'
  const [paymentStage, setPaymentStage] = useState('form');
  const [processingStatusText, setProcessingStatusText] = useState('Connecting to Secure Gateway...');
  const [processingProgress, setProcessingProgress] = useState(15);
  const [generatedTxnId, setGeneratedTxnId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [qrExpiry, setQrExpiry] = useState(180); // 3 minutes QR timer

  // QR Code Expiry Countdown
  useEffect(() => {
    if (paymentStage !== 'form') return;
    const timer = setInterval(() => {
      setQrExpiry((prev) => (prev <= 1 ? 180 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentStage]);

  // Bank OTP Timer
  useEffect(() => {
    if (!showOtpScreen) return;
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtpScreen, otpTimer]);

  // Detect card type
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
    if (val.startsWith('4')) setCardType('Visa');
    else if (val.startsWith('5')) setCardType('Mastercard');
    else if (val.startsWith('6') || val.startsWith('8')) setCardType('RuPay');
    else setCardType('Credit/Debit');
  };

  // Trigger payment execution
  const executePaymentFlow = (methodName, customTxn = null) => {
    const txn = customTxn || `TXN-UPI-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const utr = `${Math.floor(400000000000 + Math.random() * 599999999999)}`;
    setGeneratedTxnId(txn);
    setUtrNumber(utr);
    setPaymentStage('processing');
    setProcessingProgress(20);
    setProcessingStatusText('Connecting to NPCI & Bank Server...');

    setTimeout(() => {
      setProcessingProgress(50);
      setProcessingStatusText(`Authorizing ₹${amount} with ${methodName}...`);
    }, 800);

    setTimeout(() => {
      setProcessingProgress(85);
      setProcessingStatusText('Verifying Security Credentials & 256-Bit SSL...');
    }, 1600);

    setTimeout(() => {
      setProcessingProgress(100);
      setProcessingStatusText('Transaction Approved! Generating Receipt...');
    }, 2300);

    setTimeout(() => {
      playPaymentSuccessChime();
      setPaymentStage('success');

      // Notify parent callback after showing celebration
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentMethod: methodName.toLowerCase().includes('upi') || ['gpay', 'paytm', 'phonepe'].includes(methodName.toLowerCase()) ? (selectedUpiApp.toLowerCase() === 'gpay' ? 'gpay' : (selectedUpiApp.toLowerCase() === 'paytm' ? 'paytm' : 'phonepe')) : (activeTab === 'card' ? 'card' : (activeTab === 'netbanking' ? 'netbanking' : 'cod')),
            transactionId: txn,
            utrNumber: utr
          });
        }
      }, 2500);
    }, 2800);
  };

  // Submit handlers for each tab
  const handleUpiPay = (appTitle) => {
    executePaymentFlow(appTitle || selectedUpiApp);
  };

  const handleCardPayClick = () => {
    setShowOtpScreen(true);
    setOtpTimer(30);
    setOtpValue('');
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setShowOtpScreen(false);
    executePaymentFlow(`Card 3D-Secure (${cardType})`);
  };

  const handleNetBankingPay = () => {
    executePaymentFlow(`${selectedBank} NetBanking`);
  };

  const handleCodConfirm = () => {
    executePaymentFlow('Cash on Delivery');
  };

  const qrMinutes = Math.floor(qrExpiry / 60);
  const qrSeconds = qrExpiry % 60;
  const formattedQrTimer = `${String(qrMinutes).padStart(2, '0')}:${String(qrSeconds).padStart(2, '0')}`;

  return (
    <div className="pg-modal-overlay">
      <div className="pg-modal-container">
        {/* MODAL HEADER */}
        <div className="pg-modal-header">
          <div className="pg-brand-wrap">
            <div className="pg-brand-badge">⚡ QuickBites Pay</div>
            <div className="pg-security-badge">
              <span className="pg-lock-icon">🔒</span> 256-Bit SSL Encrypted
            </div>
          </div>
          {paymentStage === 'form' && (
            <button className="pg-close-btn" onClick={onClose} title="Cancel Payment">
              ✕
            </button>
          )}
        </div>

        {/* ORDER AMOUNT HERO BANNER */}
        <div className="pg-amount-hero">
          <div className="pg-amount-col">
            <span className="pg-amount-label">Payable Amount</span>
            <div className="pg-amount-val">
              <span className="pg-rupee">₹</span>{amount}
            </div>
          </div>
          <div className="pg-merchant-col">
            <span className="pg-merchant-name">QuickBites Food Logistics Pvt Ltd</span>
            <span className="pg-merchant-verified">🛡️ NPCI Verified Merchant</span>
          </div>
        </div>

        {/* ----------------- STAGE 1: FORM SELECTION ----------------- */}
        {paymentStage === 'form' && !showOtpScreen && (
          <div className="pg-body-layout">
            {/* LEFT SIDEBAR: PAYMENT CATEGORIES */}
            <div className="pg-tabs-sidebar">
              <button
                className={`pg-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                onClick={() => setActiveTab('upi')}
              >
                <span className="tab-icon">📱</span>
                <div className="tab-text">
                  <b>UPI / QR Code</b>
                  <span>GPay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                className={`pg-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                onClick={() => setActiveTab('card')}
              >
                <span className="tab-icon">💳</span>
                <div className="tab-text">
                  <b>Debit / Credit Card</b>
                  <span>Visa, Mastercard, RuPay</span>
                </div>
              </button>

              <button
                className={`pg-tab-btn ${activeTab === 'netbanking' ? 'active' : ''}`}
                onClick={() => setActiveTab('netbanking')}
              >
                <span className="tab-icon">🏦</span>
                <div className="tab-text">
                  <b>Net Banking</b>
                  <span>All Major Indian Banks</span>
                </div>
              </button>

              <button
                className={`pg-tab-btn ${activeTab === 'cod' ? 'active' : ''}`}
                onClick={() => setActiveTab('cod')}
              >
                <span className="tab-icon">💵</span>
                <div className="tab-text">
                  <b>Cash on Delivery</b>
                  <span>Pay upon arrival</span>
                </div>
              </button>
            </div>

            {/* RIGHT MAIN PANEL */}
            <div className="pg-tab-content">
              {/* TAB 1: UPI / QR CODE */}
              {activeTab === 'upi' && (
                <div className="pg-tab-pane upi-pane">
                  <div className="upi-pane-header">
                    <h4>Scan UPI QR or Select App</h4>
                    <span className="qr-timer-pill">⏱ Expires in {formattedQrTimer}</span>
                  </div>

                  {/* REAL-LOOKING DYNAMIC UPI QR CODE */}
                  <div className="upi-qr-card">
                    <div className="qr-code-frame">
                      {/* Realistic SVG generated high-density QR code visual */}
                      <svg viewBox="0 0 160 160" width="140" height="140" className="dynamic-qr-svg">
                        <rect width="160" height="160" fill="#ffffff" rx="10" />
                        {/* Corner Targets */}
                        <rect x="14" y="14" width="38" height="38" fill="#0f172a" rx="6" />
                        <rect x="22" y="22" width="22" height="22" fill="#ffffff" rx="3" />
                        <rect x="27" y="27" width="12" height="12" fill="#e23744" rx="2" />

                        <rect x="108" y="14" width="38" height="38" fill="#0f172a" rx="6" />
                        <rect x="116" y="22" width="22" height="22" fill="#ffffff" rx="3" />
                        <rect x="121" y="27" width="12" height="12" fill="#e23744" rx="2" />

                        <rect x="14" y="108" width="38" height="38" fill="#0f172a" rx="6" />
                        <rect x="22" y="116" width="22" height="22" fill="#ffffff" rx="3" />
                        <rect x="27" y="121" width="12" height="12" fill="#e23744" rx="2" />

                        {/* QR Matrix Pixels */}
                        <g fill="#1e293b">
                          <rect x="58" y="18" width="8" height="8" />
                          <rect x="72" y="18" width="8" height="8" />
                          <rect x="86" y="18" width="8" height="8" />
                          <rect x="58" y="32" width="8" height="8" />
                          <rect x="80" y="32" width="8" height="8" />
                          <rect x="66" y="46" width="8" height="8" />
                          <rect x="86" y="46" width="8" height="8" />

                          <rect x="18" y="58" width="8" height="8" />
                          <rect x="32" y="66" width="8" height="8" />
                          <rect x="46" y="58" width="8" height="8" />
                          <rect x="18" y="80" width="8" height="8" />
                          <rect x="38" y="86" width="8" height="8" />

                          <rect x="108" y="58" width="8" height="8" />
                          <rect x="126" y="66" width="8" height="8" />
                          <rect x="136" y="80" width="8" height="8" />

                          <rect x="58" y="108" width="8" height="8" />
                          <rect x="72" y="120" width="8" height="8" />
                          <rect x="86" y="136" width="8" height="8" />
                          <rect x="58" y="136" width="8" height="8" />
                          <rect x="108" y="108" width="8" height="8" />
                          <rect x="126" y="120" width="8" height="8" />
                          <rect x="136" y="136" width="8" height="8" />
                        </g>

                        {/* Center Logo Shield */}
                        <circle cx="80" cy="80" r="18" fill="#ffffff" stroke="#e23744" strokeWidth="2.5" />
                        <text x="80" y="86" textAnchor="middle" fill="#e23744" fontSize="16" fontWeight="bold">Q</text>
                      </svg>
                      <div className="qr-scan-line"></div>
                    </div>

                    <div className="upi-qr-meta">
                      <p className="qr-scan-title">Scan & Pay using any UPI App</p>
                      <div className="upi-supported-badges">
                        <span className="upi-badge-pill">GPay</span>
                        <span className="upi-badge-pill">PhonePe</span>
                        <span className="upi-badge-pill">Paytm</span>
                        <span className="upi-badge-pill">CRED</span>
                        <span className="upi-badge-pill">BHIM</span>
                      </div>
                      <p className="qr-vpa-text">UPI ID: <b>quickbites@hdfcbank</b></p>
                    </div>
                  </div>

                  {/* 1-CLICK INSTANT UPI APPS SELECTOR */}
                  <div className="instant-apps-section">
                    <p className="section-small-title">Or Pay Directly with App:</p>
                    <div className="instant-apps-row">
                      <button
                        className={`upi-app-btn ${selectedUpiApp === 'GPay' ? 'selected' : ''}`}
                        onClick={() => { setSelectedUpiApp('GPay'); handleUpiPay('Google Pay'); }}
                      >
                        <span className="app-icon">🟢</span>
                        <b>Google Pay</b>
                      </button>

                      <button
                        className={`upi-app-btn ${selectedUpiApp === 'PhonePe' ? 'selected' : ''}`}
                        onClick={() => { setSelectedUpiApp('PhonePe'); handleUpiPay('PhonePe'); }}
                      >
                        <span className="app-icon">🟣</span>
                        <b>PhonePe</b>
                      </button>

                      <button
                        className={`upi-app-btn ${selectedUpiApp === 'Paytm' ? 'selected' : ''}`}
                        onClick={() => { setSelectedUpiApp('Paytm'); handleUpiPay('Paytm'); }}
                      >
                        <span className="app-icon">🔵</span>
                        <b>Paytm UPI</b>
                      </button>
                    </div>
                  </div>

                  {/* ENTER CUSTOM UPI ID */}
                  <div className="custom-upi-input-box">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. mobile@upi)"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      className="upi-text-input"
                    />
                    <button
                      className="btn-pay-upi"
                      onClick={() => handleUpiPay(upiIdInput || 'UPI Express')}
                    >
                      Verify & Pay ₹{amount}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARDS */}
              {activeTab === 'card' && (
                <div className="pg-tab-pane card-pane">
                  {/* REALISTIC 3D CARD GRAPHIC */}
                  <div className={`card-graphic-preview ${cardType.toLowerCase()}`}>
                    <div className="card-top-row">
                      <span className="card-chip-icon">💳</span>
                      <span className="card-network-badge">{cardType}</span>
                    </div>
                    <div className="card-number-display">{cardNumber || '•••• •••• •••• ••••'}</div>
                    <div className="card-bottom-row">
                      <div>
                        <span className="card-lbl">CARD HOLDER</span>
                        <div className="card-name-val">{cardHolder || 'NAME ON CARD'}</div>
                      </div>
                      <div>
                        <span className="card-lbl">EXPIRES</span>
                        <div className="card-exp-val">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* FORM FIELDS */}
                  <div className="card-inputs-grid">
                    <div className="field-group full-width">
                      <label>Card Number</label>
                      <input
                        type="text"
                        maxLength="19"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9101 1121"
                      />
                    </div>

                    <div className="field-group full-width">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="Name as on card"
                      />
                    </div>

                    <div className="field-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>

                    <div className="field-group">
                      <label>CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  <div className="card-rbi-notice">
                    <input type="checkbox" id="save-card-rbi" defaultChecked />
                    <label htmlFor="save-card-rbi">Securely tokenized as per RBI compliance guidelines</label>
                  </div>

                  <button className="btn-pay-action" onClick={handleCardPayClick}>
                    Pay ₹{amount} Securely →
                  </button>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === 'netbanking' && (
                <div className="pg-tab-pane netbanking-pane">
                  <h4>Select Popular Bank</h4>
                  <div className="banks-grid">
                    {[
                      { name: 'HDFC Bank', code: 'HDFC', icon: '🏛️' },
                      { name: 'State Bank of India', code: 'SBI', icon: '🏦' },
                      { name: 'ICICI Bank', code: 'ICICI', icon: '🏛️' },
                      { name: 'Axis Bank', code: 'AXIS', icon: '🏦' },
                      { name: 'Kotak Mahindra', code: 'KOTAK', icon: '🏛️' },
                      { name: 'Punjab National Bank', code: 'PNB', icon: '🏦' }
                    ].map((bank) => (
                      <div
                        key={bank.code}
                        className={`bank-item-card ${selectedBank === bank.name ? 'active' : ''}`}
                        onClick={() => setSelectedBank(bank.name)}
                      >
                        <span className="bank-icon">{bank.icon}</span>
                        <span className="bank-name">{bank.name}</span>
                        {selectedBank === bank.name && <span className="bank-check">✓</span>}
                      </div>
                    ))}
                  </div>

                  <div className="netbanking-redirect-note">
                    🔒 You will be securely connected with <b>{selectedBank}</b> 256-bit gateway.
                  </div>

                  <button className="btn-pay-action" onClick={handleNetBankingPay}>
                    Pay ₹{amount} via {selectedBank}
                  </button>
                </div>
              )}

              {/* TAB 4: CASH ON DELIVERY */}
              {activeTab === 'cod' && (
                <div className="pg-tab-pane cod-pane">
                  <div className="cod-hero-box">
                    <span className="cod-icon">💵</span>
                    <h4>Cash on Delivery (COD)</h4>
                    <p>Pay ₹{amount} in cash or scan rider's QR code when your food arrives.</p>
                  </div>
                  <ul className="cod-instructions">
                    <li>✓ Zero advance payment required</li>
                    <li>✓ Delivery partner carries exact change & QR scanner</li>
                    <li>✓ 100% contactless handoff option available</li>
                  </ul>
                  <button className="btn-pay-action btn-cod-action" onClick={handleCodConfirm}>
                    Place Order with COD (₹{amount})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- BANK 3D SECURE OTP MODAL ----------------- */}
        {showOtpScreen && (
          <div className="bank-otp-overlay">
            <div className="bank-otp-card">
              <div className="bank-otp-header">
                <span className="bank-logo-tag">🏦 HDFC / SBI Secure 3D-Pay</span>
                <span className="otp-timer-tag">⏱ {otpTimer}s</span>
              </div>
              <h3>Enter 6-Digit Bank OTP</h3>
              <p className="otp-subtext">
                One Time Password sent to registered mobile ending in <b>•••• 8333</b> for transaction of <b>₹{amount}</b>.
              </p>

              <form onSubmit={handleOtpSubmit} className="otp-form">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  className="otp-digit-input"
                  required
                />

                <div className="otp-helper-row">
                  <button
                    type="button"
                    className="btn-autofill-otp"
                    onClick={() => setOtpValue('742918')}
                  >
                    ⚡ Auto-Fill Test OTP (742918)
                  </button>
                  <span className="resend-otp-text">
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : <a href="#resend" onClick={(e) => { e.preventDefault(); setOtpTimer(30); }}>Resend OTP</a>}
                  </span>
                </div>

                <div className="otp-action-row">
                  <button
                    type="button"
                    className="btn-cancel-otp"
                    onClick={() => setShowOtpScreen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-otp">
                    Authorize Payment ₹{amount}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- STAGE 2: PROCESSING ANIMATION ----------------- */}
        {paymentStage === 'processing' && (
          <div className="pg-processing-stage">
            <div className="processing-shield-wrap">
              <div className="processing-pulse-ring"></div>
              <div className="processing-shield-icon">🛡️</div>
            </div>

            <h3 className="processing-title">{processingStatusText}</h3>
            <p className="processing-sub">
              Do not press back or close the browser window. Encrypting transmission...
            </p>

            {/* PROGRESS BAR */}
            <div className="processing-progress-track">
              <div
                className="processing-progress-fill"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>

            <div className="processing-meta-badges">
              <span>🔒 256-Bit TLS 1.3</span>
              <span>⚡ NPCI Immediate Settlement</span>
              <span>₹{amount} Authorizing</span>
            </div>
          </div>
        )}

        {/* ----------------- STAGE 3: SUCCESS CELEBRATION ----------------- */}
        {paymentStage === 'success' && (
          <div className="pg-success-stage">
            {/* Celebratory Checkmark */}
            <div className="success-checkmark-circle">
              <svg viewBox="0 0 52 52" className="checkmark-svg">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <h2 className="success-headline">Payment Successful!</h2>
            <div className="success-amount-paid">
              <span>₹{amount}</span>
            </div>
            <p className="success-paid-to">
              Paid to <b>QuickBites Kitchens Pvt Ltd</b>
            </p>

            {/* Transaction Receipt Card */}
            <div className="success-receipt-box">
              <div className="receipt-row">
                <span>Transaction ID</span>
                <b>{generatedTxnId}</b>
              </div>
              <div className="receipt-row">
                <span>Bank UTR Ref</span>
                <b>{utrNumber}</b>
              </div>
              <div className="receipt-row">
                <span>Date & Time</span>
                <b>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • Today</b>
              </div>
              <div className="receipt-row">
                <span>Payment Mode</span>
                <b className="mode-badge">{activeTab === 'card' ? 'DEBIT / CREDIT CARD' : (activeTab === 'netbanking' ? `${selectedBank.toUpperCase()} NETBANKING` : (activeTab === 'cod' ? 'CASH ON DELIVERY' : `${selectedUpiApp.toUpperCase()} UPI`))}</b>
              </div>
            </div>

            <div className="success-redirecting-bar">
              <span className="spinner-mini"></span>
              <span>Order confirmed! Redirecting to live Zepto map tracking...</span>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="pg-modal-footer">
          <div className="pg-footer-left">
            <span>Powered by <b>QuickBites Unified Payments</b></span>
          </div>
          <div className="pg-footer-logos">
            <span className="sec-tag">NPCI</span>
            <span className="sec-tag">UPI 2.0</span>
            <span className="sec-tag">RuPay</span>
            <span className="sec-tag">PCI-DSS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
