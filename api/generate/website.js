/**
 * Vercel Serverless Function: Website Generation
 * POST /api/generate/website
 */

class WebsiteGenerationService {
  generateWebsite(formData, selectedDomain) {
    const content = {
      heroSection: this.generateHeroContent(formData),
      summary: this.generateSummary(formData),
      experience: this.generateExperience(formData),
      skills: this.generateSkills(formData),
      ctaSection: this.generateCTA(formData),
      seoMeta: this.generateSEOMeta(formData)
    };

    return {
      html: this.generateHTML(content, formData),
      css: this.generateCSS(formData),
      js: this.generateJS(formData),
      meta: content.seoMeta
    };
  }

  generateHeroContent(data) {
    return {
      headline: data.fullName || 'Your Name',
      tagline: `${data.currentTitle || 'Professional'} Seeking ${data.targetRole || 'New Role'} Role`,
      subtitle: `Passionate about joining ${data.targetCompany || 'Your Target Company'} to drive innovation and growth`,
      cta: this.getCtaText(data.callToAction, data.targetCompany)
    };
  }

  generateSummary(data) {
    const templates = {
      'entry': `Motivated ${data.targetRole} candidate with fresh perspective and strong foundational skills. Eager to contribute to ${data.targetCompany}'s mission.`,
      'mid': `Experienced ${data.targetRole} with proven track record. Seeking to leverage expertise to drive results at ${data.targetCompany}.`,
      'senior': `Senior ${data.targetRole} with extensive experience leading initiatives. Ready to bring strategic vision to ${data.targetCompany}'s growth objectives.`,
      'executive': `Executive-level ${data.targetRole} with transformational leadership experience. Proven ability to drive innovation aligned with ${data.targetCompany}'s strategic vision.`
    };
    return templates[data.careerLevel] || templates['mid'];
  }

  generateExperience(data) {
    return [{
      title: data.currentTitle || 'Current Role',
      company: 'Current Company',
      duration: '2021 - Present',
      achievements: this.generateAchievements(data),
      relevance: `Direct experience applicable to ${data.targetRole} at ${data.targetCompany}`
    }];
  }

  generateAchievements(data) {
    const templates = {
      'technical-skills': [
        `Led development of scalable systems handling 50K+ users`,
        `Optimized performance resulting in 35% faster response times`
      ],
      'leadership': [
        `Managed team of 8 professionals across multiple projects`,
        `Increased team productivity by 40% through process improvements`
      ],
      'achievements': [
        `Delivered $1.2M revenue increase through strategic initiatives`,
        `Exceeded targets by 25% for 3 consecutive quarters`
      ]
    };

    const achievements = [];
    (data.focusAreas || []).forEach(area => {
      if (templates[area]) achievements.push(...templates[area]);
    });
    return achievements.length > 0 ? achievements : templates['achievements'];
  }

  generateSkills(data) {
    const targetSkills = {
      'Apple': ['iOS Development', 'Swift', 'UX Design', 'Product Strategy'],
      'Google': ['Machine Learning', 'Python', 'Data Analysis', 'Cloud Computing'],
      'Tesla': ['Python', 'AI/ML', 'Manufacturing', 'Sustainability'],
      'Microsoft': ['Azure', 'C#', '.NET', 'Enterprise Solutions'],
      'Amazon': ['AWS', 'Scala', 'Operations', 'Customer Obsession']
    };

    return {
      featured: (data.keySkills || []).slice(0, 6),
      targetRelevant: targetSkills[data.targetCompany] || (data.keySkills || []).slice(0, 4)
    };
  }

  generateCTA(data) {
    const templates = {
      'hire-me': {
        primary: `Hire Me for ${data.targetCompany}`,
        secondary: `Ready to contribute to ${data.targetCompany}'s success`,
        action: 'mailto:' + (data.email || '') + `?subject=Interest%20in%20${data.targetRole}%20Role`
      },
      'contact': {
        primary: `Let's Connect`,
        secondary: `Discuss how I can contribute to ${data.targetCompany}`,
        action: 'mailto:' + (data.email || '')
      },
      'schedule-call': {
        primary: `Schedule Interview`,
        secondary: `Ready to discuss ${data.targetRole} opportunity at ${data.targetCompany}`,
        action: '#calendar-link'
      },
      'view-portfolio': {
        primary: `View My Work`,
        secondary: `See projects relevant to ${data.targetRole} at ${data.targetCompany}`,
        action: data.portfolioUrl || '#portfolio'
      }
    };
    return templates[data.callToAction] || templates['contact'];
  }

  generateSEOMeta(data) {
    return {
      title: `${data.fullName} - ${data.targetRole} | Available for ${data.targetCompany}`,
      description: `${data.fullName} is an experienced ${data.currentTitle} seeking ${data.targetRole} opportunities at ${data.targetCompany}.`,
      keywords: [data.targetRole, data.targetCompany, data.fullName, ...(data.keySkills || [])].join(', ')
    };
  }

  getCtaText(callToAction, targetCompany) {
    const templates = {
      'hire-me': `Hire Me for ${targetCompany}`,
      'contact': `Get In Touch`,
      'schedule-call': `Schedule Interview`,
      'view-portfolio': `View Portfolio`
    };
    return templates[callToAction] || 'Contact Me';
  }

  generateHTML(content, formData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.seoMeta.title}</title>
    <meta name="description" content="${content.seoMeta.description}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>${this.generateCSS(formData)}</style>
</head>
<body class="theme-${formData.style} color-${formData.colorScheme}">
    <header class="hero-section">
        <div class="container">
            <h1 class="hero-headline">${content.heroSection.headline}</h1>
            <p class="hero-tagline">${content.heroSection.tagline}</p>
            <p class="hero-subtitle">${content.heroSection.subtitle}</p>
            <div class="contact-info">
                <span>${formData.email || ''}</span>
                <span>${formData.phone || ''}</span>
                <span>${formData.location || ''}</span>
            </div>
            <a href="${content.ctaSection.action}" class="cta-primary">${content.ctaSection.primary}</a>
        </div>
    </header>

    <section class="summary-section">
        <div class="container">
            <h2>Professional Summary</h2>
            <p>${content.summary}</p>
        </div>
    </section>

    <section class="skills-section">
        <div class="container">
            <h2>Core Competencies</h2>
            <div class="skills-grid">
                ${content.skills.featured.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="target-skills">
                <h3>Relevant to ${formData.targetCompany}</h3>
                <div class="target-skills-list">
                    ${content.skills.targetRelevant.map(skill => `<span class="target-skill">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
    </section>

    <section class="experience-section">
        <div class="container">
            <h2>Professional Experience</h2>
            ${content.experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.title}</h3>
                    <p class="company-duration">${exp.company} | ${exp.duration}</p>
                    <ul class="achievements">
                        ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                    <p class="relevance">${exp.relevance}</p>
                </div>
            `).join('')}
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>${content.ctaSection.primary}</h2>
            <p>${content.ctaSection.secondary}</p>
            <a href="${content.ctaSection.action}" class="cta-button">${content.ctaSection.primary}</a>
        </div>
    </section>
</body>
</html>`;
  }

  generateCSS(formData) {
    const colorSchemes = {
      'professional': { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
      'warm': { primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c' },
      'cool': { primary: '#0891b2', secondary: '#0e7490', accent: '#06b6d4' },
      'vibrant': { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' }
    };
    const colors = colorSchemes[formData.colorScheme] || colorSchemes['professional'];

    return `
:root { --primary: ${colors.primary}; --secondary: ${colors.secondary}; --accent: ${colors.accent}; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.6; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.hero-section { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 80px 0; text-align: center; }
.hero-headline { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; }
.hero-tagline { font-size: 1.5rem; margin-bottom: 1rem; opacity: 0.9; }
.hero-subtitle { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.8; max-width: 600px; margin-left: auto; margin-right: auto; }
.contact-info { display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap; }
.cta-primary, .cta-button { background: white; color: var(--primary); padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; display: inline-block; transition: transform 0.3s ease; }
.cta-primary:hover, .cta-button:hover { transform: translateY(-2px); }
section { padding: 60px 0; }
section:nth-child(even) { background: #f9fafb; }
h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: var(--primary); }
h3 { font-size: 1.5rem; margin-bottom: 1rem; color: var(--secondary); }
.skills-grid, .target-skills-list { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
.skill-tag { background: var(--accent); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 500; }
.target-skill { background: var(--primary); color: white; padding: 10px 20px; border-radius: 25px; font-weight: 600; }
.target-skills { text-align: center; }
.experience-item { background: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid var(--accent); }
.company-duration { color: #6b7280; margin-bottom: 1rem; font-weight: 500; }
.achievements { list-style: none; margin-bottom: 1rem; }
.achievements li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
.achievements li:before { content: '\\2713'; position: absolute; left: 0; color: var(--accent); font-weight: bold; }
.relevance { background: #f9fafb; padding: 1rem; border-radius: 8px; font-style: italic; color: #6b7280; }
.cta-section { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; text-align: center; }
.cta-section h2 { color: white; }
@media (max-width: 768px) { .hero-headline { font-size: 2.5rem; } .contact-info { flex-direction: column; gap: 1rem; } h2 { font-size: 2rem; } }`;
  }

  generateJS(formData) {
    return `console.log('Resume website loaded for ${formData.fullName}');`;
  }

  calculateAppealScore(data) {
    let score = 50;
    if (data.targetCompany) score += 15;
    score += (data.keySkills || []).length * 2;
    if (['modern', 'professional'].includes(data.style)) score += 10;
    score += (data.focusAreas || []).length * 5;
    const levelBonus = { 'entry': 5, 'mid': 10, 'senior': 15, 'executive': 20 };
    score += levelBonus[data.careerLevel] || 10;
    return Math.min(100, score);
  }
}

const service = new WebsiteGenerationService();

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
    const { formData, selectedDomain } = req.body;

    // Validate required fields
    const required = ['fullName', 'email', 'targetRole', 'targetCompany'];
    const missing = required.filter(field => !formData?.[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missing
      });
    }

    const website = service.generateWebsite(formData, selectedDomain);
    const appealScore = service.calculateAppealScore(formData);

    res.status(200).json({
      success: true,
      website,
      domain: selectedDomain,
      analytics: {
        targetCompany: formData.targetCompany,
        role: formData.targetRole,
        experienceLevel: formData.careerLevel,
        skillsCount: (formData.keySkills || []).length,
        designStyle: formData.style,
        focusAreas: formData.focusAreas,
        estimatedAppealScore: appealScore
      },
      meta: {
        generatedAt: new Date().toISOString(),
        targetCompany: formData.targetCompany,
        targetRole: formData.targetRole,
        estimatedAppealScore: appealScore
      }
    });

  } catch (error) {
    console.error('Website generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate website',
      details: error.message
    });
  }
}
