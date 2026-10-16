import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AnalyticsDashboard = ({ url, token, user }) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);

  const isSuperAdmin = user?.role === 'admin';

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let queryUrl = `${url}/api/analytics/performance?period=${period}`;
      if (isSuperAdmin && selectedRestaurant !== 'all') {
        queryUrl += `&restaurantId=${selectedRestaurant}`;
      }

      const response = await axios.get(queryUrl, {
        headers: token ? { token } : {}
      });

      if (response.data.success) {
        setAnalyticsData(response.data);
      } else {
        toast.error('Failed to load performance analytics.');
      }
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
      toast.error('Network error loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, period, selectedRestaurant]);

  const summary = analyticsData?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    avgPrepTimeMinutes: 0,
    avgAcceptanceSpeedMinutes: 0,
    totalDisputes: 0,
    disputeRate: 0
  };

  const maxRevenue = Math.max(
    1,
    ...(analyticsData?.dailyTrend?.map((d) => d.revenue) || [1000])
  );

  return (
    <div className="analytics-page">
      {/* HEADER SECTION */}
      <div className="analytics-header">
        <div>
          <div className="analytics-badge-row">
            <span className="live-clock-badge">🕒 Asia/Kolkata (IST)</span>
            <span className="live-status-pill">● Operations Live</span>
          </div>
          <h2 className="analytics-title">
            {isSuperAdmin ? '📊 Platform Performance & Kitchen KPIs' : '📊 Restaurant Operations & Performance'}
          </h2>
          <p className="analytics-subtitle">
            Real-time analytics for food prep speed, order throughput, revenue & customer dispute rates.
          </p>
        </div>

        {/* CONTROLS (PERIOD + RESTAURANT SELECTOR) */}
        <div className="analytics-controls">
          {isSuperAdmin && (
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="analytics-select"
            >
              <option value="all">🌐 All Platform Kitchens</option>
              {analyticsData?.allRestaurants?.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <div className="period-pill-group">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`period-btn ${period === p.id ? 'active' : ''}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading-box">
          <div className="spinner"></div>
          <p>Calculating live kitchen metrics across IST timezone...</p>
        </div>
      ) : (
        <>
          {/* TOP KPI CARDS */}
          <div className="kpi-grid">
            {/* Revenue */}
            <div className="kpi-card revenue-card">
              <div className="kpi-icon-wrap">💰</div>
              <div className="kpi-info">
                <span className="kpi-label">Gross Revenue</span>
                <h3 className="kpi-value">₹{summary.totalRevenue.toLocaleString('en-IN')}</h3>
                <span className="kpi-subtext">Avg ₹{summary.averageOrderValue} per order</span>
              </div>
            </div>

            {/* Orders Count */}
            <div className="kpi-card orders-card">
              <div className="kpi-icon-wrap">📦</div>
              <div className="kpi-info">
                <span className="kpi-label">Total Orders</span>
                <h3 className="kpi-value">{summary.totalOrders}</h3>
                <div className="kpi-pills-row">
                  <span className="pill-completed">✓ {summary.completedOrders} Delivered</span>
                  {summary.cancelledOrders > 0 && (
                    <span className="pill-cancelled">✕ {summary.cancelledOrders} Cancelled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preparation Time */}
            <div className="kpi-card prep-card">
              <div className="kpi-icon-wrap">⏱️</div>
              <div className="kpi-info">
                <span className="kpi-label">Avg Kitchen Prep Time</span>
                <h3 className="kpi-value">
                  {summary.avgPrepTimeMinutes} <span className="unit">mins</span>
                </h3>
                <span className={`kpi-status-tag ${summary.avgPrepTimeMinutes <= 25 ? 'fast' : 'moderate'}`}>
                  {summary.avgPrepTimeMinutes <= 25 ? '⚡ Optimum Velocity' : '⚠️ Heavy Kitchen Load'}
                </span>
              </div>
            </div>

            {/* Acceptance Speed */}
            <div className="kpi-card speed-card">
              <div className="kpi-icon-wrap">⚡</div>
              <div className="kpi-info">
                <span className="kpi-label">Order Acceptance Speed</span>
                <h3 className="kpi-value">
                  {summary.avgAcceptanceSpeedMinutes} <span className="unit">mins</span>
                </h3>
                <span className="kpi-subtext">Avg time before cooking begins</span>
              </div>
            </div>

            {/* Dispute Rate */}
            <div className="kpi-card dispute-card">
              <div className="kpi-icon-wrap">🎧</div>
              <div className="kpi-info">
                <span className="kpi-label">Customer Dispute Rate</span>
                <h3 className="kpi-value">
                  {summary.disputeRate}% <span className="unit">({summary.totalDisputes} issues)</span>
                </h3>
                <span className={`kpi-status-tag ${summary.disputeRate <= 2.5 ? 'fast' : 'high-risk'}`}>
                  {summary.disputeRate <= 2.5 ? '🛡️ Quality Healthy (<2.5%)' : '🚨 High Dispute Alert'}
                </span>
              </div>
            </div>
          </div>

          {/* CHARTS & LEADERBOARD SECTION */}
          <div className="analytics-details-grid">
            {/* Revenue Trend Visualizer */}
            <div className="chart-card">
              <div className="card-head">
                <div>
                  <h4 className="card-title">📈 Revenue & Volume Trend</h4>
                  <p className="card-subtitle">Daily order throughput in Asia/Kolkata standard time</p>
                </div>
              </div>

              {analyticsData?.dailyTrend && analyticsData.dailyTrend.length > 0 ? (
                <div className="bar-chart-container">
                  {analyticsData.dailyTrend.map((day, idx) => {
                    const heightPercent = Math.max(8, Math.round((day.revenue / maxRevenue) * 100));
                    return (
                      <div key={idx} className="bar-col" title={`${day.date}: ₹${day.revenue} (${day.orders} orders)`}>
                        <div className="bar-tooltip">₹{day.revenue}</div>
                        <div className="bar-fill-wrap">
                          <div
                            className="bar-fill"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className="bar-label">{day.label}</span>
                        <span className="bar-orders-count">{day.orders} ord</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="chart-empty">No trend data available for this range.</p>
              )}
            </div>

            {/* Top Dishes Leaderboard */}
            <div className="leaderboard-card">
              <div className="card-head">
                <div>
                  <h4 className="card-title">🏆 Top Selling Menu Items</h4>
                  <p className="card-subtitle">Dishes ordered most frequently by customers</p>
                </div>
              </div>

              {analyticsData?.topDishes && analyticsData.topDishes.length > 0 ? (
                <div className="leaderboard-list">
                  {analyticsData.topDishes.map((dish, idx) => (
                    <div key={idx} className="leaderboard-item">
                      <div className="rank-badge">#{idx + 1}</div>
                      <div className="dish-details">
                        <span className="dish-name">{dish.name}</span>
                        <span className="dish-stats">
                          {dish.quantity} units ordered • ₹{dish.revenue.toLocaleString('en-IN')} revenue
                        </span>
                      </div>
                      <span className="dish-pill">Bestseller</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-empty">No dish orders recorded in this range.</div>
              )}
            </div>
          </div>

          {/* DISPUTE BREAKDOWN BAR */}
          {analyticsData?.disputeCategoryBreakdown && Object.keys(analyticsData.disputeCategoryBreakdown).length > 0 && (
            <div className="disputes-breakdown-card">
              <h4 className="card-title">⚠️ Customer Dispute Breakdown by Root Cause</h4>
              <p className="card-subtitle">Identifies operational kitchen or packaging bottlenecks</p>
              <div className="dispute-pills-row">
                {Object.entries(analyticsData.disputeCategoryBreakdown).map(([category, count]) => (
                  <div key={category} className="dispute-category-pill">
                    <span className="cat-name">{category}</span>
                    <span className="cat-count">{count} {count === 1 ? 'ticket' : 'tickets'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
