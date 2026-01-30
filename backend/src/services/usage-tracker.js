/**
 * API Usage Tracking Service
 * Track OpenAI API usage and costs for Colin
 */
const fs = require('fs').promises;
const path = require('path');

class UsageTracker {
  constructor() {
    this.usageFile = path.join(process.cwd(), 'api-usage.json');
    this.initializeUsageFile();
  }

  async initializeUsageFile() {
    try {
      await fs.access(this.usageFile);
    } catch (error) {
      // File doesn't exist, create it
      const initialData = {
        totalCost: 0,
        totalTokens: 0,
        dailyUsage: {},
        sessions: [],
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(this.usageFile, JSON.stringify(initialData, null, 2));
    }
  }

  async logUsage(data) {
    const {
      model,
      prompt_tokens,
      completion_tokens,
      total_tokens,
      cost,
      operation,
      userId = 'anonymous'
    } = data;

    try {
      const currentData = await this.getCurrentUsage();
      const today = new Date().toISOString().split('T')[0];

      // Initialize daily usage if needed
      if (!currentData.dailyUsage[today]) {
        currentData.dailyUsage[today] = {
          cost: 0,
          tokens: 0,
          sessions: 0,
          operations: []
        };
      }

      // Update totals
      currentData.totalCost += cost;
      currentData.totalTokens += total_tokens;
      currentData.dailyUsage[today].cost += cost;
      currentData.dailyUsage[today].tokens += total_tokens;
      currentData.dailyUsage[today].sessions++;

      // Log the session
      const session = {
        timestamp: new Date().toISOString(),
        model,
        operation,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        cost: cost,
        userId,
        date: today
      };

      currentData.sessions.push(session);
      currentData.dailyUsage[today].operations.push({
        operation,
        model,
        tokens: total_tokens,
        cost,
        timestamp: new Date().toISOString()
      });
      
      currentData.lastUpdated = new Date().toISOString();

      // Keep only last 30 days of detailed sessions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      currentData.sessions = currentData.sessions.filter(session => 
        new Date(session.timestamp) > thirtyDaysAgo
      );

      await fs.writeFile(this.usageFile, JSON.stringify(currentData, null, 2));
      
      console.log(`💰 API Usage: $${cost.toFixed(4)} | ${total_tokens} tokens | ${operation}`);
      
      return session;
    } catch (error) {
      console.error('Failed to log API usage:', error);
      return null;
    }
  }

  async getCurrentUsage() {
    try {
      const data = await fs.readFile(this.usageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read usage data:', error);
      return {
        totalCost: 0,
        totalTokens: 0,
        dailyUsage: {},
        sessions: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getDailyUsage(days = 7) {
    const data = await this.getCurrentUsage();
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      result.push({
        date: dateStr,
        cost: data.dailyUsage[dateStr]?.cost || 0,
        tokens: data.dailyUsage[dateStr]?.tokens || 0,
        sessions: data.dailyUsage[dateStr]?.sessions || 0,
        operations: data.dailyUsage[dateStr]?.operations || []
      });
    }
    
    return result;
  }

  async getUsageSummary() {
    const data = await this.getCurrentUsage();
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    const todayUsage = data.dailyUsage[today] || { cost: 0, tokens: 0, sessions: 0 };
    
    const monthlyUsage = Object.entries(data.dailyUsage)
      .filter(([date]) => date.startsWith(thisMonth))
      .reduce((acc, [, usage]) => ({
        cost: acc.cost + usage.cost,
        tokens: acc.tokens + usage.tokens,
        sessions: acc.sessions + usage.sessions
      }), { cost: 0, tokens: 0, sessions: 0 });

    return {
      total: {
        cost: data.totalCost,
        tokens: data.totalTokens,
        sessions: data.sessions.length
      },
      today: todayUsage,
      thisMonth: monthlyUsage,
      lastUpdated: data.lastUpdated,
      averageCostPerSession: data.sessions.length > 0 ? data.totalCost / data.sessions.length : 0,
      averageTokensPerSession: data.sessions.length > 0 ? data.totalTokens / data.sessions.length : 0
    };
  }

  // Calculate costs based on OpenAI pricing
  static calculateCost(model, prompt_tokens, completion_tokens) {
    const pricing = {
      'gpt-4': {
        prompt: 0.03 / 1000,    // $0.03 per 1K prompt tokens
        completion: 0.06 / 1000  // $0.06 per 1K completion tokens
      },
      'gpt-4-turbo': {
        prompt: 0.01 / 1000,    // $0.01 per 1K prompt tokens
        completion: 0.03 / 1000  // $0.03 per 1K completion tokens
      },
      'gpt-3.5-turbo': {
        prompt: 0.0015 / 1000,  // $0.0015 per 1K prompt tokens
        completion: 0.002 / 1000 // $0.002 per 1K completion tokens
      }
    };

    const modelPricing = pricing[model] || pricing['gpt-4']; // Default to GPT-4 pricing
    
    const promptCost = prompt_tokens * modelPricing.prompt;
    const completionCost = completion_tokens * modelPricing.completion;
    
    return promptCost + completionCost;
  }
}

module.exports = UsageTracker;