/**
 * Vercel Serverless Function: Domain Suggestions
 * POST /api/domains/suggestions
 */

class DomainSuggestionService {
  constructor() {
    this.domainPricing = {
      '.com': 12.99,
      '.io': 45.99,
      '.dev': 19.99,
      '.co': 24.99,
      '.pro': 29.99,
      '.hire': 299.99
    };
    this.markup = 1.5;
  }

  generateSuggestions(name, company, role = '') {
    const cleanName = this.cleanText(name);
    const cleanCompany = this.cleanText(company);
    const cleanRole = this.cleanText(role);

    const suggestions = [
      `${cleanName}-${cleanCompany}.com`,
      `${cleanName}at${cleanCompany}.com`,
      `hire${cleanName}.com`,
      ...(cleanRole ? [
        `${cleanName}-${cleanCompany}-${cleanRole}.com`,
        `${cleanName}-${cleanRole}.com`
      ] : []),
      `${cleanName}for${cleanCompany}.com`,
      `meet${cleanName}.com`,
      `${cleanName}-${cleanCompany}.dev`,
      `${cleanName}-${cleanCompany}.io`,
      `${cleanName}.pro`,
      `${cleanName}-portfolio.com`,
      `${cleanName}resume.com`
    ];

    return [...new Set(suggestions)]
      .filter(domain => this.isValidDomain(domain))
      .slice(0, 12);
  }

  cleanText(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .replace(/inc|llc|corp|company|ltd/g, '')
      .substring(0, 15);
  }

  isValidDomain(domain) {
    const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]*\.[a-z]{2,}$/;
    return domainRegex.test(domain) &&
           domain.length <= 63 &&
           !domain.includes('--') &&
           domain.split('.')[0].length >= 2;
  }

  simulateAvailability(domain) {
    const name = domain.split('.')[0];
    const tld = '.' + domain.split('.').pop();

    let availabilityScore = 0.5;
    if (name.length > 15) availabilityScore += 0.3;
    if (name.includes('-')) availabilityScore += 0.2;
    if (tld === '.com') availabilityScore -= 0.2;
    if (tld === '.io') availabilityScore += 0.1;
    if (tld === '.dev') availabilityScore += 0.15;

    availabilityScore = Math.max(0.1, Math.min(0.9, availabilityScore));
    return Math.random() < availabilityScore;
  }

  calculatePricing(domain) {
    const tld = '.' + domain.split('.').pop();
    const basePrice = this.domainPricing[tld] || 15.99;
    const ourPrice = Math.round(basePrice * this.markup * 100) / 100;

    return {
      domainCost: basePrice,
      ourPrice: ourPrice,
      monthlyAmortized: Math.round(ourPrice / 12 * 100) / 100,
      renewalPrice: basePrice,
      includedInService: true
    };
  }

  scoreDomain(domain, name, company) {
    let score = 0;
    const domainName = domain.split('.')[0];
    const tld = domain.split('.').pop();

    if (domainName.includes(this.cleanText(name))) score += 10;
    if (domainName.includes(this.cleanText(company))) score += 8;
    if (tld === 'com') score += 5;
    if (tld === 'dev') score += 3;
    if (tld === 'io') score += 2;
    if (domainName.length >= 8 && domainName.length <= 20) score += 3;
    if (domainName.includes('hire')) score += 4;
    if (domainName.includes('-')) score += 1;

    return score;
  }
}

const domainService = new DomainSuggestionService();

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, targetCompany, targetRole } = req.body;

    if (!name || !targetCompany) {
      return res.status(400).json({
        error: 'Name and target company are required',
        example: {
          name: 'Sarah Johnson',
          targetCompany: 'Google',
          targetRole: 'Product Manager'
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

    results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.score - a.score;
    });

    const availableDomains = results.filter(r => r.available);
    const bestOption = availableDomains[0];

    res.status(200).json({
      success: true,
      applicant: { name, targetCompany, targetRole },
      suggestions: results.slice(0, 8),
      recommendation: {
        topChoice: bestOption?.domain,
        reasoning: bestOption ?
          `${bestOption.domain} combines your name with ${targetCompany}, showing targeted interest` :
          'Consider alternative TLDs or slightly longer domain names',
        estimatedImpact: '3x higher callback rate with company-specific domain'
      }
    });

  } catch (error) {
    console.error('Domain suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate domain suggestions',
      details: error.message
    });
  }
}
