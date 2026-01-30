/**
 * API Usage Dashboard for Colin
 * Real-time monitoring of OpenAI API costs and usage
 */
import React, { useState, useEffect } from 'react';
import './UsageDashboard.css';

const UsageDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    
    // Set up live updates every 30 seconds
    const interval = setInterval(loadLiveData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/usage/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.dashboard.summary);
        setDailyUsage(data.dashboard.dailyTrend);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveData = async () => {
    try {
      const response = await fetch('/api/usage/live');
      const data = await response.json();
      
      if (data.success) {
        setLiveData(data.live);
      }
    } catch (error) {
      console.error('Failed to load live data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="usage-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading API usage data...</p>
      </div>
    );
  }

  return (
    <div className="usage-dashboard">
      <div className="dashboard-header">
        <h2>🔮 API Usage Dashboard</h2>
        <p>Monitor your OpenAI API costs and usage in real-time</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <div className="amount">{formatCurrency(summary?.total.cost || 0)}</div>
            <div className="detail">{summary?.total.sessions || 0} sessions total</div>
          </div>
        </div>

        <div className="summary-card today">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>Today</h3>
            <div className="amount">{formatCurrency(summary?.today.cost || 0)}</div>
            <div className="detail">{summary?.today.sessions || 0} sessions</div>
          </div>
        </div>

        <div className="summary-card month">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>This Month</h3>
            <div className="amount">{formatCurrency(summary?.thisMonth.cost || 0)}</div>
            <div className="detail">{summary?.thisMonth.sessions || 0} sessions</div>
          </div>
        </div>

        <div className="summary-card average">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <h3>Avg Per Session</h3>
            <div className="amount">{formatCurrency(summary?.averageCostPerSession || 0)}</div>
            <div className="detail">{Math.round(summary?.averageTokensPerSession || 0).toLocaleString()} tokens</div>
          </div>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="chart-container">
        <h3>💹 Daily Usage Trend (Last 7 Days)</h3>
        <div className="daily-chart">
          {dailyUsage.map((day, index) => (
            <div key={index} className="chart-bar">
              <div 
                className="bar"
                style={{
                  height: `${Math.max(5, (day.cost / Math.max(...dailyUsage.map(d => d.cost), 1)) * 100)}px`
                }}
                title={`${formatDate(day.date)}: ${formatCurrency(day.cost)}`}
              ></div>
              <div className="bar-label">
                <div className="date">{formatDate(day.date)}</div>
                <div className="amount">{formatCurrency(day.cost)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      {liveData && (
        <div className="live-activity">
          <h3>🔴 Live Activity</h3>
          <div className="live-stats">
            <div className="live-stat">
              <span className="label">Today:</span>
              <span className="value">{formatCurrency(liveData.todayCost)}</span>
            </div>
            <div className="live-stat">
              <span className="label">Status:</span>
              <span className={`status ${liveData.status}`}>
                {liveData.status === 'high' ? '🔥 High' :
                 liveData.status === 'medium' ? '⚠️ Medium' : '✅ Normal'}
              </span>
            </div>
          </div>

          {liveData.recentOperations && liveData.recentOperations.length > 0 && (
            <div className="recent-operations">
              <h4>Recent Operations</h4>
              {liveData.recentOperations.map((op, index) => (
                <div key={index} className="operation">
                  <div className="op-info">
                    <span className="op-name">{op.operation}</span>
                    <span className="op-model">{op.model}</span>
                  </div>
                  <div className="op-cost">
                    <span className="cost">{formatCurrency(op.cost)}</span>
                    <span className="tokens">{op.tokens.toLocaleString()} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Tips */}
      <div className="tips-section">
        <h3>💡 Cost Optimization Tips</h3>
        <div className="tips-grid">
          <div className="tip">
            <h4>Use GPT-3.5 for Simple Tasks</h4>
            <p>GPT-3.5 Turbo is 10x cheaper than GPT-4 for basic content generation.</p>
          </div>
          <div className="tip">
            <h4>Optimize Prompt Length</h4>
            <p>Shorter, focused prompts use fewer tokens and cost less.</p>
          </div>
          <div className="tip">
            <h4>Batch Similar Requests</h4>
            <p>Group similar operations to reduce API overhead.</p>
          </div>
        </div>
      </div>

      {/* Google API Info */}
      <div className="api-info">
        <h3>🔑 Google API Setup</h3>
        <p>To find your Google API credentials:</p>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Create a new project or select existing one</li>
          <li>Navigate to "APIs & Services" → "Credentials"</li>
          <li>Click "Create Credentials" → "API Key"</li>
          <li>Copy the API key and add to your .env file</li>
        </ol>
        <div className="api-needed">
          <h4>APIs you'll need to enable:</h4>
          <ul>
            <li>Google Domains API (for domain registration)</li>
            <li>Google Analytics API (for website analytics)</li>
            <li>Gmail API (for email automation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;