/**
 * API Usage Dashboard Routes
 * Real-time monitoring of OpenAI API costs for Colin
 */
const express = require('express');
const router = express.Router();
const UsageTracker = require('../services/usage-tracker');

const usageTracker = new UsageTracker();

/**
 * GET /api/usage/dashboard
 * Main usage dashboard with current costs and trends
 */
router.get('/dashboard', async (req, res) => {
  try {
    const summary = await usageTracker.getUsageSummary();
    const dailyUsage = await usageTracker.getDailyUsage(7); // Last 7 days
    
    res.json({
      success: true,
      dashboard: {
        summary,
        dailyTrend: dailyUsage,
        alerts: generateUsageAlerts(summary),
        recommendations: generateRecommendations(summary, dailyUsage)
      },
      meta: {
        currency: 'USD',
        period: 'Last 7 days',
        lastUpdated: summary.lastUpdated
      }
    });
  } catch (error) {
    console.error('Usage dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load usage dashboard',
      details: error.message
    });
  }
});

/**
 * GET /api/usage/summary
 * Quick summary for header/widget display
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await usageTracker.getUsageSummary();
    
    res.json({
      success: true,
      summary: {
        totalCost: summary.total.cost,
        todayCost: summary.today.cost,
        monthCost: summary.thisMonth.cost,
        sessionsToday: summary.today.sessions,
        avgCostPerSession: summary.averageCostPerSession,
        lastUpdated: summary.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load usage summary'
    });
  }
});

/**
 * GET /api/usage/daily/:days
 * Daily usage breakdown for charts
 */
router.get('/daily/:days?', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const dailyUsage = await usageTracker.getDailyUsage(Math.min(days, 30)); // Max 30 days
    
    res.json({
      success: true,
      dailyUsage,
      period: `${days} days`,
      totalCost: dailyUsage.reduce((sum, day) => sum + day.cost, 0),
      totalTokens: dailyUsage.reduce((sum, day) => sum + day.tokens, 0)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load daily usage'
    });
  }
});

/**
 * GET /api/usage/live
 * Live usage stats (for real-time updates)
 */
router.get('/live', async (req, res) => {
  try {
    const currentData = await usageTracker.getCurrentUsage();
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = currentData.dailyUsage[today] || { cost: 0, tokens: 0, sessions: 0 };
    
    // Get last 5 operations for live feed
    const recentOperations = currentData.sessions
      .slice(-5)
      .reverse()
      .map(session => ({
        operation: session.operation,
        cost: session.cost,
        tokens: session.total_tokens,
        model: session.model,
        time: session.timestamp
      }));
    
    res.json({
      success: true,
      live: {
        todayCost: todayUsage.cost,
        todayTokens: todayUsage.tokens,
        sessionsToday: todayUsage.sessions,
        recentOperations,
        status: todayUsage.cost > 10 ? 'high' : todayUsage.cost > 5 ? 'medium' : 'normal'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load live usage'
    });
  }
});

/**
 * POST /api/usage/track
 * Manual usage tracking (for testing)
 */
router.post('/track', async (req, res) => {
  try {
    const { model, operation, prompt_tokens, completion_tokens } = req.body;
    
    if (!model || !operation || !prompt_tokens || !completion_tokens) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: model, operation, prompt_tokens, completion_tokens'
      });
    }
    
    const total_tokens = prompt_tokens + completion_tokens;
    const cost = UsageTracker.calculateCost(model, prompt_tokens, completion_tokens);
    
    const session = await usageTracker.logUsage({
      model,
      operation,
      prompt_tokens,
      completion_tokens,
      total_tokens,
      cost,
      userId: req.ip
    });
    
    if (session) {
      res.json({
        success: true,
        session,
        cost: cost,
        message: `Tracked ${operation} - $${cost.toFixed(4)}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to track usage'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track usage',
      details: error.message
    });
  }
});

/**
 * Generate usage alerts based on spending patterns
 */
function generateUsageAlerts(summary) {
  const alerts = [];
  
  // High daily spending alert
  if (summary.today.cost > 5) {
    alerts.push({
      type: 'warning',
      title: 'High Daily Spending',
      message: `Today's costs ($${summary.today.cost.toFixed(2)}) are above normal`,
      action: 'Review recent operations'
    });
  }
  
  // Monthly budget alert (assuming $50/month budget)
  const monthlyBudget = 50;
  if (summary.thisMonth.cost > monthlyBudget * 0.8) {
    alerts.push({
      type: 'alert',
      title: 'Monthly Budget Alert',
      message: `Used ${((summary.thisMonth.cost / monthlyBudget) * 100).toFixed(0)}% of monthly budget`,
      action: 'Consider optimizing prompts'
    });
  }
  
  // Cost per session alert
  if (summary.averageCostPerSession > 1) {
    alerts.push({
      type: 'info',
      title: 'High Cost Per Session',
      message: `Average $${summary.averageCostPerSession.toFixed(3)} per operation`,
      action: 'Optimize prompt length'
    });
  }
  
  return alerts;
}

/**
 * Generate cost optimization recommendations
 */
function generateRecommendations(summary, dailyUsage) {
  const recommendations = [];
  
  // Token efficiency
  if (summary.averageTokensPerSession > 3000) {
    recommendations.push({
      title: 'Reduce Prompt Length',
      description: 'Average prompts are quite long. Consider shorter, more focused prompts.',
      impact: 'Could reduce costs by 30-50%',
      priority: 'high'
    });
  }
  
  // Model selection
  recommendations.push({
    title: 'Consider GPT-3.5 for Simple Tasks',
    description: 'GPT-3.5 Turbo is 10x cheaper for basic content generation.',
    impact: 'Significant cost reduction for simple tasks',
    priority: 'medium'
  });
  
  // Batch processing
  if (summary.today.sessions > 20) {
    recommendations.push({
      title: 'Batch Similar Requests',
      description: 'Group similar operations to reduce API overhead.',
      impact: 'Reduce costs by 20-30%',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

module.exports = router;