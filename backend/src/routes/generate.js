/**
 * Website Generation API - Enhanced Prompting System
 * Converts detailed user inputs into professional resume websites
 */
const express = require('express');
const router = express.Router();

// Website generation service
class WebsiteGenerationService {
  constructor() {
    this.templateLibrary = new TemplateLibrary();
    this.aiPromptBuilder = new AIPromptBuilder();
    this.codeGenerator = new CodeGenerator();
  }

  /**
   * Generate complete website based on enhanced form data
   */
  async generateWebsite(formData, selectedDomain) {
    try {
      // Build enhanced AI prompt
      const designPrompt = this.aiPromptBuilder.buildDesignPrompt(formData, selectedDomain);
      
      // Generate base template
      const template = this.templateLibrary.selectTemplate(formData);
      
      // Generate AI-enhanced content
      const content = await this.generateAIContent(designPrompt, formData);
      
      // Compile final website
      const website = this.codeGenerator.compile(template, content, formData);
      
      return {
        success: true,
        website: website,
        domain: selectedDomain,
        prompt: designPrompt,
        analytics: this.generateAnalytics(formData)
      };
      
    } catch (error) {
      console.error('Website generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateAIContent(prompt, formData) {
    // This would integrate with Claude API, GPT, or other AI service
    // For now, return structured content based on form data
    
    return {
      heroSection: this.generateHeroContent(formData),
      summary: this.generateSummary(formData), 
      experience: this.generateExperience(formData),
      skills: this.generateSkills(formData),
      ctaSection: this.generateCTA(formData),
      seoMeta: this.generateSEOMeta(formData)
    };
  }

  generateHeroContent(data) {
    const { fullName, currentTitle, targetRole, targetCompany } = data;
    
    return {
      headline: `${fullName}`,
      tagline: `${currentTitle} Seeking ${targetRole} Role`,
      subtitle: `Passionate about joining ${targetCompany} to drive innovation and growth`,
      cta: this.getCtaText(data.callToAction, targetCompany)
    };
  }

  generateSummary(data) {
    const { targetRole, targetCompany, careerLevel, industryExperience } = data;
    
    const summaryTemplates = {
      'entry': `Motivated ${targetRole} candidate with fresh perspective and strong foundational skills. Eager to contribute to ${targetCompany}'s mission while growing expertise in ${industryExperience}.`,
      
      'mid': `Experienced ${targetRole} with proven track record in ${industryExperience}. Seeking to leverage ${data.keySkills.slice(0,3).join(', ')} expertise to drive results at ${targetCompany}.`,
      
      'senior': `Senior ${targetRole} with extensive experience leading ${industryExperience} initiatives. Ready to bring strategic vision and hands-on expertise to ${targetCompany}'s growth objectives.`,
      
      'executive': `Executive-level ${targetRole} with transformational leadership experience. Proven ability to scale ${industryExperience} operations and drive innovation aligned with ${targetCompany}'s strategic vision.`
    };
    
    return summaryTemplates[careerLevel] || summaryTemplates['mid'];
  }

  generateExperience(data) {
    // Generate experience section optimized for target company
    const experiences = [
      {
        title: data.currentTitle || 'Current Role',
        company: 'Current Company',
        duration: '2021 - Present',
        achievements: this.generateAchievements(data),
        relevance: `Direct experience applicable to ${data.targetRole} at ${data.targetCompany}`
      }
    ];
    
    return experiences;
  }

  generateAchievements(data) {
    const achievementTemplates = {
      'technical-skills': [
        `Led development of scalable systems handling ${this.randomMetric()} users`,
        `Optimized performance resulting in ${this.randomPercentage()}% faster response times`,
        `Implemented ${data.keySkills.slice(0,2).join(' and ')} solutions increasing efficiency by ${this.randomPercentage()}%`
      ],
      'leadership': [
        `Managed team of ${this.randomNumber(3,15)} professionals across ${data.industryExperience} projects`,
        `Increased team productivity by ${this.randomPercentage()}% through strategic process improvements`,
        `Mentored ${this.randomNumber(5,20)} junior team members, with ${this.randomPercentage()}% promotion rate`
      ],
      'achievements': [
        `Delivered ${this.randomMetric()} revenue increase through strategic ${data.industryExperience} initiatives`,
        `Reduced costs by ${this.randomPercentage()}% while maintaining quality standards`,
        `Exceeded targets by ${this.randomPercentage()}% for ${this.randomNumber(2,4)} consecutive quarters`
      ]
    };
    
    const relevantAchievements = [];
    data.focusAreas.forEach(area => {
      if (achievementTemplates[area]) {
        relevantAchievements.push(...achievementTemplates[area].slice(0, 2));
      }
    });
    
    return relevantAchievements.length > 0 ? relevantAchievements : achievementTemplates['achievements'];
  }

  generateSkills(data) {
    const skillCategories = {
      technical: data.keySkills.filter(skill => 
        ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Machine Learning', 'Data Analysis'].includes(skill)
      ),
      business: data.keySkills.filter(skill => 
        ['Project Management', 'Team Leadership', 'Product Strategy', 'Marketing', 'Sales', 'Operations'].includes(skill)
      ),
      creative: data.keySkills.filter(skill => 
        ['UX Design'].includes(skill)
      )
    };
    
    return {
      categories: skillCategories,
      featured: data.keySkills.slice(0, 6),
      targetRelevant: this.getTargetRelevantSkills(data)
    };
  }

  getTargetRelevantSkills(data) {
    const companySkillPreferences = {
      'Apple': ['iOS Development', 'Swift', 'UX Design', 'Product Strategy'],
      'Google': ['Machine Learning', 'Python', 'Data Analysis', 'Cloud Computing'],
      'Tesla': ['Python', 'AI/ML', 'Manufacturing', 'Sustainability'],
      'Microsoft': ['Azure', 'C#', '.NET', 'Enterprise Solutions'],
      'Amazon': ['AWS', 'Scala', 'Operations', 'Customer Obsession']
    };
    
    return companySkillPreferences[data.targetCompany] || data.keySkills.slice(0, 4);
  }

  generateCTA(data) {
    const ctaTemplates = {
      'hire-me': {
        primary: `Hire Me for ${data.targetCompany}`,
        secondary: `Ready to contribute to ${data.targetCompany}'s success`,
        action: 'mailto:' + data.email + `?subject=Interest%20in%20${data.targetRole}%20Role`
      },
      'contact': {
        primary: `Let's Connect`,
        secondary: `Discuss how I can contribute to ${data.targetCompany}`,
        action: 'mailto:' + data.email
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
    
    return ctaTemplates[data.callToAction] || ctaTemplates['contact'];
  }

  generateSEOMeta(data) {
    return {
      title: `${data.fullName} - ${data.targetRole} | Available for ${data.targetCompany}`,
      description: `${data.fullName} is an experienced ${data.currentTitle} seeking ${data.targetRole} opportunities at ${data.targetCompany}. Expertise in ${data.keySkills.slice(0,3).join(', ')}.`,
      keywords: [
        data.targetRole,
        data.targetCompany,
        data.fullName,
        ...data.keySkills,
        data.industryExperience
      ].join(', ')
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

  generateAnalytics(data) {
    return {
      targetCompany: data.targetCompany,
      role: data.targetRole,
      experienceLevel: data.careerLevel,
      skillsCount: data.keySkills.length,
      designStyle: data.style,
      focusAreas: data.focusAreas,
      estimatedAppealScore: this.calculateAppealScore(data)
    };
  }

  calculateAppealScore(data) {
    let score = 50; // Base score
    
    // Company-specific domain bonus
    if (data.targetCompany) score += 15;
    
    // Skills alignment
    score += data.keySkills.length * 2;
    
    // Professional design choice
    if (['modern', 'professional'].includes(data.style)) score += 10;
    
    // Focus areas bonus
    score += data.focusAreas.length * 5;
    
    // Experience level adjustment
    const levelBonus = {
      'entry': 5,
      'mid': 10,
      'senior': 15,
      'executive': 20
    };
    score += levelBonus[data.careerLevel] || 10;
    
    return Math.min(100, score);
  }

  randomMetric() {
    const metrics = ['$1.2M', '$500K', '10K+', '50K+', '100K+', '1M+'];
    return metrics[Math.floor(Math.random() * metrics.length)];
  }

  randomPercentage() {
    return Math.floor(Math.random() * 40) + 20; // 20-60%
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

class TemplateLibrary {
  selectTemplate(formData) {
    const templates = {
      'modern': 'modern-professional',
      'classic': 'traditional-elegant', 
      'creative': 'creative-portfolio',
      'minimal': 'clean-minimal',
      'bold': 'impactful-bold'
    };
    
    return templates[formData.style] || 'modern-professional';
  }
}

class AIPromptBuilder {
  buildDesignPrompt(formData, selectedDomain) {
    return `Create a professional resume website for ${formData.fullName}.

CANDIDATE PROFILE:
- Name: ${formData.fullName}
- Current Role: ${formData.currentTitle}
- Target: ${formData.targetRole} at ${formData.targetCompany}
- Level: ${formData.careerLevel}
- Industry: ${formData.industryExperience}
- Skills: ${formData.keySkills.join(', ')}

DESIGN REQUIREMENTS:
- Style: ${formData.style}
- Colors: ${formData.colorScheme}
- Layout: ${formData.layout}
- Focus: ${formData.focusAreas.join(', ')}
- CTA: ${formData.callToAction}
- Domain: ${selectedDomain?.domain}

COMPANY-SPECIFIC OPTIMIZATION:
Target Company: ${formData.targetCompany}
- Research ${formData.targetCompany} company culture and values
- Use terminology familiar to ${formData.targetCompany} recruiters
- Emphasize skills most relevant to ${formData.targetRole} at ${formData.targetCompany}
- Include industry keywords for ${formData.industryExperience}

TECHNICAL SPECIFICATIONS:
- Mobile-responsive design
- Fast loading performance
- Professional typography
- Accessibility compliant
- SEO optimized for "${formData.fullName} ${formData.targetRole} ${formData.targetCompany}"

OUTPUT: Complete HTML, CSS, and JavaScript for a professional resume website.`;
  }
}

class CodeGenerator {
  compile(template, content, formData) {
    return {
      html: this.generateHTML(content, formData),
      css: this.generateCSS(formData),
      js: this.generateJS(formData),
      meta: content.seoMeta
    };
  }

  generateHTML(content, formData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.seoMeta.title}</title>
    <meta name="description" content="${content.seoMeta.description}">
    <meta name="keywords" content="${content.seoMeta.keywords}">
    <link href="styles.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body class="theme-${formData.style} color-${formData.colorScheme}">
    <!-- Hero Section -->
    <header class="hero-section">
        <div class="container">
            <h1 class="hero-headline">${content.heroSection.headline}</h1>
            <p class="hero-tagline">${content.heroSection.tagline}</p>
            <p class="hero-subtitle">${content.heroSection.subtitle}</p>
            <div class="contact-info">
                <span>${formData.email}</span>
                <span>${formData.phone}</span>
                <span>${formData.location}</span>
            </div>
            <a href="${content.ctaSection.action}" class="cta-primary">${content.ctaSection.primary}</a>
        </div>
    </header>

    <!-- Professional Summary -->
    <section class="summary-section">
        <div class="container">
            <h2>Professional Summary</h2>
            <p>${content.summary}</p>
        </div>
    </section>

    <!-- Skills -->
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

    <!-- Experience -->
    <section class="experience-section">
        <div class="container">
            <h2>Professional Experience</h2>
            ${content.experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.title}</h3>
                    <p class="company-duration">${exp.company} | ${exp.duration}</p>
                    <ul class="achievements">
                        ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                    <p class="relevance">${exp.relevance}</p>
                </div>
            `).join('')}
        </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
        <div class="container">
            <h2>${content.ctaSection.primary}</h2>
            <p>${content.ctaSection.secondary}</p>
            <a href="${content.ctaSection.action}" class="cta-button">${content.ctaSection.primary}</a>
        </div>
    </section>

    <script src="script.js"></script>
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

    return `/* Generated CSS for ${formData.fullName} */
:root {
    --primary-color: ${colors.primary};
    --secondary-color: ${colors.secondary};
    --accent-color: ${colors.accent};
    --text-color: #1f2937;
    --text-light: #6b7280;
    --bg-color: #ffffff;
    --bg-light: #f9fafb;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
    line-height: 1.6;
    background: var(--bg-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Hero Section */
.hero-section {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 80px 0;
    text-align: center;
}

.hero-headline {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.hero-tagline {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    opacity: 0.9;
}

.hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.8;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.contact-info {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.cta-primary {
    background: white;
    color: var(--primary-color);
    padding: 16px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: transform 0.3s ease;
}

.cta-primary:hover {
    transform: translateY(-2px);
}

/* Sections */
section {
    padding: 60px 0;
}

section:nth-child(even) {
    background: var(--bg-light);
}

h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
    color: var(--primary-color);
}

h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--secondary-color);
}

/* Skills */
.skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 3rem;
}

.skill-tag {
    background: var(--accent-color);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
}

.target-skills {
    text-align: center;
}

.target-skills h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
}

.target-skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
}

.target-skill {
    background: var(--primary-color);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
}

/* Experience */
.experience-item {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-left: 4px solid var(--accent-color);
}

.company-duration {
    color: var(--text-light);
    margin-bottom: 1rem;
    font-weight: 500;
}

.achievements {
    list-style: none;
    margin-bottom: 1rem;
}

.achievements li {
    padding: 0.5rem 0;
    position: relative;
    padding-left: 1.5rem;
}

.achievements li:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--accent-color);
    font-weight: bold;
}

.relevance {
    background: var(--bg-light);
    padding: 1rem;
    border-radius: 8px;
    font-style: italic;
    color: var(--text-light);
}

/* CTA Section */
.cta-section {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    text-align: center;
}

.cta-section h2 {
    color: white;
}

.cta-button {
    background: white;
    color: var(--primary-color);
    padding: 16px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    display: inline-block;
    margin-top: 1rem;
    transition: transform 0.3s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .hero-headline { font-size: 2.5rem; }
    .contact-info { flex-direction: column; gap: 1rem; }
    .skills-grid, .target-skills-list { justify-content: center; }
    h2 { font-size: 2rem; }
}`;
  }

  generateJS(formData) {
    return `// Generated JavaScript for ${formData.fullName}
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Analytics tracking for ${formData.targetCompany} application
    const trackEvent = (event, data) => {
        console.log('Event:', event, 'Data:', data);
        // Integration with analytics service would go here
    };

    // Track page views
    trackEvent('page_view', {
        candidate: '${formData.fullName}',
        target_company: '${formData.targetCompany}',
        target_role: '${formData.targetRole}'
    });

    // Track CTA clicks
    document.querySelectorAll('.cta-primary, .cta-button').forEach(cta => {
        cta.addEventListener('click', () => {
            trackEvent('cta_click', {
                action: '${formData.callToAction}',
                target: '${formData.targetCompany}'
            });
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate sections on scroll
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Show hero section immediately
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.opacity = '1';
        heroSection.style.transform = 'translateY(0)';
    }
});`;
  }
}

const websiteService = new WebsiteGenerationService();

/**
 * POST /api/generate/website
 * Generate complete resume website from enhanced form data
 */
router.post('/website', async (req, res) => {
  try {
    const { formData, selectedDomain } = req.body;

    // Validate required fields
    const required = ['fullName', 'email', 'targetRole', 'targetCompany'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missing: missing
      });
    }

    // Generate website
    const result = await websiteService.generateWebsite(formData, selectedDomain);
    
    if (result.success) {
      res.json({
        success: true,
        website: result.website,
        domain: result.domain,
        analytics: result.analytics,
        meta: {
          generatedAt: new Date().toISOString(),
          targetCompany: formData.targetCompany,
          targetRole: formData.targetRole,
          estimatedAppealScore: result.analytics.estimatedAppealScore,
          promptUsed: result.prompt
        }
      });
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Website generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate website',
      details: error.message
    });
  }
});

/**
 * GET /api/generate/templates
 * List available design templates
 */
router.get('/templates', (req, res) => {
  res.json({
    success: true,
    templates: [
      {
        id: 'modern-professional',
        name: 'Modern Professional',
        description: 'Clean, contemporary design perfect for tech roles',
        preview: '/templates/modern-professional.jpg',
        bestFor: ['Software Engineer', 'Product Manager', 'Data Scientist']
      },
      {
        id: 'traditional-elegant', 
        name: 'Traditional Elegant',
        description: 'Classic, sophisticated design for traditional industries',
        preview: '/templates/traditional-elegant.jpg',
        bestFor: ['Finance', 'Consulting', 'Legal', 'Healthcare']
      },
      {
        id: 'creative-portfolio',
        name: 'Creative Portfolio',
        description: 'Bold, artistic design showcasing creativity',
        preview: '/templates/creative-portfolio.jpg',
        bestFor: ['Designer', 'Creative Director', 'Marketing', 'Content Creator']
      },
      {
        id: 'clean-minimal',
        name: 'Clean Minimal',
        description: 'Ultra-clean design focusing on content',
        preview: '/templates/clean-minimal.jpg', 
        bestFor: ['Executive', 'Operations', 'Project Manager']
      },
      {
        id: 'impactful-bold',
        name: 'Impactful Bold',
        description: 'Strong, confident design that makes a statement',
        preview: '/templates/impactful-bold.jpg',
        bestFor: ['Sales', 'Business Development', 'Startup', 'Entrepreneur']
      }
    ]
  });
});

/**
 * POST /api/generate/preview
 * Generate quick preview without full generation
 */
router.post('/preview', async (req, res) => {
  try {
    const { formData } = req.body;
    
    const preview = {
      heroPreview: {
        headline: formData.fullName,
        tagline: `${formData.currentTitle} → ${formData.targetRole}`,
        company: formData.targetCompany
      },
      designPreview: {
        style: formData.style,
        colorScheme: formData.colorScheme,
        layout: formData.layout
      },
      contentPreview: {
        skillCount: formData.keySkills?.length || 0,
        focusAreas: formData.focusAreas || [],
        callToAction: formData.callToAction
      },
      seoPreview: {
        title: `${formData.fullName} - ${formData.targetRole} | ${formData.targetCompany}`,
        url: `https://example.com/${formData.fullName?.toLowerCase().replace(/\s+/g, '-')}`
      }
    };

    res.json({
      success: true,
      preview: preview,
      estimatedGenerationTime: '30-45 seconds',
      recommendations: [
        formData.keySkills?.length < 5 ? 'Consider adding more skills for better impact' : null,
        !formData.portfolioUrl ? 'Add portfolio URL to showcase your work' : null,
        formData.focusAreas?.length < 2 ? 'Select more focus areas for comprehensive presentation' : null
      ].filter(Boolean)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Preview generation failed',
      details: error.message
    });
  }
});

module.exports = router;