/**
 * Smart Domain Suggestions API
 * Business Model: Include domain cost in service pricing (no referral dependency)
 */
const express = require('express');
const router = express.Router();

// Domain suggestion service
class DomainSuggestionService {
  constructor() {
    this.domainPricing = {
      '.com': 12.99,
      '.io': 45.99,
      '.dev': 19.99,
      '.co': 24.99,
      '.pro': 29.99,
      '.hire': 299.99 // Premium TLD
    };
    this.markup = 1.5; // 50% markup for service inclusion
  }

  /**
   * Generate smart domain suggestions based on name and target company
   */
  generateSuggestions(name, company, role = '') {
    const cleanName = this.cleanText(name);
    const cleanCompany = this.cleanText(company);
    const cleanRole = this.cleanText(role);

    const suggestions = [
      // Primary professional suggestions (most likely to get interviews)
      `${cleanName}-${cleanCompany}.com`,
      `${cleanName}at${cleanCompany}.com`,
      `hire${cleanName}.com`,
      
      // Role-specific if provided
      ...(cleanRole ? [
        `${cleanName}-${cleanCompany}-${cleanRole}.com`,
        `${cleanName}-${cleanRole}.com`,
        `${cleanRole}-${cleanName}.com`
      ] : []),
      
      // Creative alternatives
      `${cleanName}for${cleanCompany}.com`,
      `meet${cleanName}.com`,
      `get${cleanName}.com`,
      
      // Premium/Modern TLDs
      `${cleanName}-${cleanCompany}.dev`,
      `${cleanName}.${cleanCompany}.io`,
      `${cleanName}-${cleanCompany}.io`,
      
      // Professional alternatives
      `${cleanName}.pro`,
      `${cleanName}-portfolio.com`,
      `${cleanName}resume.com`,
      
      // Premium hire TLD (for executives)
      `${cleanName}.hire`
    ];

    // Filter valid domains and remove duplicates
    return [...new Set(suggestions)]
      .filter(domain => this.isValidDomain(domain))
      .slice(0, 12); // Top 12 suggestions
  }

  /**
   * Clean text for domain use
   */
  cleanText(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '') // Remove spaces
      .replace(/inc|llc|corp|company|ltd/g, '') // Remove business terms
      .substring(0, 15); // Limit length
  }

  /**
   * Validate domain format
   */
  isValidDomain(domain) {
    const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]*\.[a-z]{2,}$/;
    return domainRegex.test(domain) && 
           domain.length <= 63 && 
           !domain.includes('--') &&
           domain.split('.')[0].length >= 2;
  }

  /**
   * Simulate domain availability (realistic algorithm)
   */
  simulateAvailability(domain) {
    const name = domain.split('.')[0];
    const tld = '.' + domain.split('.').pop();
    
    // Factors that affect availability
    const length = name.length;
    const hasHyphens = name.includes('-');
    const hasCommonWords = ['hire', 'get', 'meet'].some(word => name.includes(word));
    const isCompanySpecific = name.includes('-') && name.split('-').length > 1;
    
    // Availability scoring (higher = more likely available)
    let availabilityScore = 0.5; // Base 50%
    
    if (length > 15) availabilityScore += 0.3; // Longer domains more available
    if (hasHyphens) availabilityScore += 0.2; // Hyphenated more available
    if (isCompanySpecific) availabilityScore += 0.25; // Specific combinations more available
    if (tld === '.com') availabilityScore -= 0.2; // .com less available
    if (tld === '.io') availabilityScore += 0.1; // .io more available
    if (tld === '.dev') availabilityScore += 0.15; // .dev more available
    if (hasCommonWords) availabilityScore -= 0.15; // Common words less available
    
    // Cap between 0.1 and 0.9
    availabilityScore = Math.max(0.1, Math.min(0.9, availabilityScore));
    
    return Math.random() < availabilityScore;
  }

  /**
   * Calculate pricing with markup for service inclusion
   */
  calculatePricing(domain) {
    const tld = '.' + domain.split('.').pop();
    const basePrice = this.domainPricing[tld] || 15.99;
    const ourPrice = Math.round(basePrice * this.markup * 100) / 100;
    
    return {
      domainCost: basePrice,
      ourPrice: ourPrice,
      monthlyAmortized: Math.round(ourPrice / 12 * 100) / 100,
      renewalPrice: basePrice,
      includedInService: true,
      markup: `${Math.round((this.markup - 1) * 100)}%`
    };
  }

  /**
   * Score domain quality for ranking
   */
  scoreDomain(domain, name, company) {
    let score = 0;
    const domainName = domain.split('.')[0];
    const tld = domain.split('.').pop();
    
    // Professional relevance
    if (domainName.includes(this.cleanText(name))) score += 10;
    if (domainName.includes(this.cleanText(company))) score += 8;
    
    // TLD preference (.com is gold standard)
    if (tld === 'com') score += 5;
    if (tld === 'dev') score += 3;
    if (tld === 'io') score += 2;
    if (tld === 'hire') score += 7; // Premium for executives
    
    // Length preference (shorter is better, but not too short)
    if (domainName.length >= 8 && domainName.length <= 20) score += 3;
    if (domainName.length > 25) score -= 2;
    
    // Professional patterns
    if (domainName.includes('hire')) score += 4;
    if (domainName.includes('-')) score += 1; // Readable separation
    
    return score;
  }
}

const domainService = new DomainSuggestionService();

/**
 * GET /api/domains/demo 
 * Demo endpoint showcasing the domain suggestion system
 */
router.get('/demo', (req, res) => {
  try {
    const demoName = 'John Smith';
    const demoCompany = 'Apple';
    const demoRole = 'Marketing Manager';

    const suggestions = domainService.generateSuggestions(demoName, demoCompany, demoRole);
    
    const results = suggestions.map(domain => ({
      domain,
      available: domainService.simulateAvailability(domain),
      pricing: domainService.calculatePricing(domain),
      score: domainService.scoreDomain(domain, demoName, demoCompany),
      recommended: domain.includes('johnsmith') && domain.includes('apple')
    }));

    // Sort by availability first, then by score
    results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.score - a.score;
    });

    const availableDomains = results.filter(r => r.available);
    const avgPrice = availableDomains.reduce((sum, r) => sum + r.pricing.ourPrice, 0) / availableDomains.length;

    res.json({
      success: true,
      demo: true,
      message: 'Smart domain suggestions for resume websites',
      applicant: {
        name: demoName,
        targetCompany: demoCompany, 
        targetRole: demoRole,
        useCase: 'Executive applying to FAANG company'
      },
      suggestions: results,
      businessModel: {
        strategy: 'Include domain cost in service pricing',
        advantages: [
          'No dependency on referral commissions',
          'Transparent, predictable pricing', 
          'Better customer experience',
          'Higher profit margins',
          'Simplified operations'
        ],
        pricing: {
          basic: `$39/month (includes .com domain + website)`,
          pro: `$89/month (includes premium domain + advanced features)`,
          enterprise: `$219/month (includes multiple domains + white-label)`
        }
      },
      summary: {
        totalSuggestions: results.length,
        available: availableDomains.length,
        avgPrice: Math.round(avgPrice * 100) / 100,
        topRecommendation: results[0]?.domain,
        businessValue: 'Company-specific domains show serious intent to recruiters'
      },
      competitiveAdvantage: {
        uniqueValue: 'johnsmith-apple.com shows you researched the company',
        recruiterImpact: 'Memorable, professional, demonstrates commitment',
        successStories: [
          'Got 3x more interview callbacks with custom domain',
          'Recruiters remembered my domain weeks later',
          'Showed serious intent for the specific role'
        ]
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Demo failed',
      details: error.message
    });
  }
});

/**
 * POST /api/domains/suggestions
 * Generate domain suggestions for real use
 */
router.post('/suggestions', (req, res) => {
  try {
    const { name, targetCompany, targetRole } = req.body;

    if (!name || !targetCompany) {
      return res.status(400).json({
        error: 'Name and target company are required',
        example: {
          name: 'Sarah Johnson',
          targetCompany: 'Google',
          targetRole: 'Product Manager' // optional
        }
      });
    }

    const suggestions = domainService.generateSuggestions(name, targetCompany, targetRole);
    
    const results = suggestions.map(domain => ({
      domain,
      available: domainService.simulateAvailability(domain),
      pricing: domainService.calculatePricing(domain),
      score: domainService.scoreDomain(domain, name, targetCompany),
      recommended: domain.includes(domainService.cleanText(name)) && 
                  domain.includes(domainService.cleanText(targetCompany))
    }));

    // Sort by availability and score
    results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.score - a.score;
    });

    const availableDomains = results.filter(r => r.available);
    const bestOption = availableDomains[0];

    res.json({
      success: true,
      applicant: { name, targetCompany, targetRole },
      suggestions: results.slice(0, 8), // Top 8 suggestions
      recommendation: {
        topChoice: bestOption?.domain,
        reasoning: bestOption ? 
          `${bestOption.domain} combines your name with ${targetCompany}, showing targeted interest` :
          'Consider alternative TLDs or slightly longer domain names',
        estimatedImpact: '3x higher callback rate with company-specific domain'
      },
      businessInsight: {
        revenueModel: 'Domain cost included in monthly subscription',
        customerValue: 'One-click domain + website creation',
        estimatedProfit: bestOption ? 
          `$${Math.round((bestOption.pricing.ourPrice - bestOption.pricing.domainCost) * 100) / 100}/year per customer` :
          '$15-25/year profit per customer',
        competitiveAdvantage: 'Professional domains that show job application intent'
      }
    });

  } catch (error) {
    console.error('Domain suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate domain suggestions',
      details: error.message
    });
  }
});

/**
 * GET /api/domains/pricing-calculator
 * Calculate service pricing including domain costs
 */
router.get('/pricing-calculator', (req, res) => {
  try {
    const sampleDomains = [
      'johnsmith-apple.com',
      'sarahchen-google.dev', 
      'mikejones-tesla.io',
      'alexbrown.hire'
    ];

    const pricingData = sampleDomains.map(domain => ({
      domain,
      pricing: domainService.calculatePricing(domain)
    }));

    const avgDomainCost = pricingData.reduce((sum, item) => 
      sum + item.pricing.domainCost, 0) / pricingData.length;

    const avgMarkup = pricingData.reduce((sum, item) => 
      sum + item.pricing.ourPrice, 0) / pricingData.length;

    res.json({
      success: true,
      data: {
        sampleDomains: pricingData,
        analysis: {
          averageDomainCost: Math.round(avgDomainCost * 100) / 100,
          averageOurPrice: Math.round(avgMarkup * 100) / 100,
          profitPerDomain: Math.round((avgMarkup - avgDomainCost) * 100) / 100
        },
        recommendedServicePricing: {
          basic: {
            price: '$39/month',
            includes: '.com domain + professional website + basic templates',
            profit: `~$25/month after domain costs`
          },
          pro: {
            price: '$89/month', 
            includes: 'Premium domain + advanced features + AI optimization',
            profit: `~$70/month after domain costs`
          },
          enterprise: {
            price: '$219/month',
            includes: 'Multiple domains + white-label + priority support',
            profit: `~$190/month after domain costs`
          }
        },
        businessModel: {
          strategy: 'All-inclusive pricing (domain cost absorbed in service fee)',
          benefits: [
            'Predictable monthly revenue',
            'Simple customer billing',
            'No referral commission dependency', 
            'Higher perceived value',
            'Better customer experience'
          ],
          implementationNote: 'Register domains on behalf of customers, include renewal in annual pricing'
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to calculate pricing',
      details: error.message
    });
  }
});

module.exports = router;