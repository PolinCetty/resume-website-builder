/**
 * Smart Resume Website Builder - Enhanced UI
 * Focus: Better prompting for improved site design
 */
import React, { useState, useEffect } from 'react';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    portfolioUrl: '',
    
    // Professional Profile
    currentTitle: '',
    targetRole: '',
    targetCompany: '',
    industryExperience: '',
    keySkills: [],
    
    // Career Goals
    careerLevel: '', // entry, mid, senior, executive
    salaryRange: '',
    workStyle: '', // remote, hybrid, onsite
    
    // Design Preferences
    style: '', // modern, classic, creative, minimal, bold
    colorScheme: '', // professional, warm, cool, vibrant
    layout: '', // single-column, two-column, creative
    
    // Content Focus
    focusAreas: [], // technical-skills, leadership, achievements, education, projects
    callToAction: '', // hire-me, contact, schedule-call, view-portfolio
  });

  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedSite, setGeneratedSite] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Test data for rapid testing in development
  const TEST_DATA = {
    fullName: 'Jane Developer',
    email: 'jane@example.com',
    phone: '555-123-4567',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/janedev',
    portfolioUrl: 'https://janedev.com',
    currentTitle: 'Senior Software Engineer',
    targetRole: 'Staff Engineer',
    targetCompany: 'Google',
    industryExperience: 'Tech',
    keySkills: ['JavaScript', 'React', 'Node.js', 'AWS'],
    careerLevel: 'senior',
    salaryRange: '',
    workStyle: '',
    style: 'modern',
    colorScheme: 'professional',
    layout: 'two-column',
    focusAreas: ['technical-skills', 'achievements'],
    callToAction: 'hire-me'
  };

  const enableTestMode = () => {
    setFormData(TEST_DATA);
  };

  // Enhanced prompting for better site design
  const generateDesignPrompt = () => {
    const { 
      fullName, currentTitle, targetRole, targetCompany, careerLevel, 
      style, colorScheme, layout, focusAreas, callToAction 
    } = formData;

    const prompt = `Create a professional resume website for ${fullName}, a ${currentTitle} targeting a ${targetRole} position at ${targetCompany}.

CANDIDATE PROFILE:
- Career Level: ${careerLevel}
- Current Role: ${currentTitle}
- Target: ${targetRole} at ${targetCompany}
- Industry Focus: ${formData.industryExperience}

DESIGN REQUIREMENTS:
- Style: ${style} (${getStyleDescription(style)})
- Color Scheme: ${colorScheme} 
- Layout: ${layout}
- Focus Areas: ${focusAreas.join(', ')}
- Primary CTA: ${callToAction}

SPECIFIC DESIGN INSTRUCTIONS:
1. HEADER SECTION:
   - Hero banner with ${fullName}'s name prominently displayed
   - Professional tagline targeting ${targetCompany}
   - Clean, scannable contact information
   - ${callToAction === 'schedule-call' ? 'Prominent calendar booking link' : 
       callToAction === 'hire-me' ? 'Bold "Hire Me" button with email link' :
       callToAction === 'contact' ? 'Contact form or email button' :
       'Portfolio/work samples showcase button'}

2. PROFESSIONAL SUMMARY:
   - 2-3 sentences specifically mentioning ${targetRole} aspirations
   - Highlight relevant experience for ${targetCompany} industry
   - Include key achievements with quantifiable metrics
   - Show cultural fit for ${targetCompany} if research available

3. EXPERIENCE SECTION:
   ${focusAreas.includes('technical-skills') ? '- Technical skills prominently featured' : ''}
   ${focusAreas.includes('leadership') ? '- Leadership experience highlighted' : ''}
   ${focusAreas.includes('achievements') ? '- Quantifiable achievements emphasized' : ''}
   - Each role should connect to ${targetRole} requirements
   - Use action verbs relevant to ${targetCompany} industry

4. SKILLS & EXPERTISE:
   - Skills organized by relevance to ${targetRole}
   - Technical and soft skills balanced for ${careerLevel} level
   - Industry-specific competencies for ${targetCompany}

5. DESIGN AESTHETICS:
   - ${getColorGuidance(colorScheme)}
   - ${getLayoutGuidance(layout)}
   - ${getStyleGuidance(style)}
   - Mobile-responsive design essential
   - Fast loading, professional typography
   - Subtle animations that enhance, don't distract

6. COMPANY-SPECIFIC ELEMENTS:
   - Research ${targetCompany} values and incorporate relevant keywords
   - Use industry terminology familiar to ${targetCompany} recruiters
   - If possible, reference ${targetCompany} projects, values, or recent news
   - Demonstrate knowledge of ${targetRole} responsibilities

7. CALL-TO-ACTION STRATEGY:
   - ${getCtaStrategy(callToAction, targetCompany)}

8. SEO & FINDABILITY:
   - Title tag: "${fullName} - ${targetRole} | Available for ${targetCompany}"
   - Meta description highlighting ${targetRole} expertise
   - Keywords: ${targetRole}, ${targetCompany}, ${formData.keySkills.join(', ')}

DOMAIN CONTEXT: This will be hosted on ${selectedDomain?.domain || 'custom domain'} to show serious intent for ${targetCompany} position.

Create HTML/CSS/JS that makes ${fullName} irresistible for the ${targetRole} at ${targetCompany}.`;

    return prompt;
  };

  const getStyleDescription = (style) => {
    const descriptions = {
      'modern': 'Clean lines, minimalist design, contemporary typography',
      'classic': 'Traditional, elegant, timeless professional appearance', 
      'creative': 'Bold, artistic, showcases personality and creativity',
      'minimal': 'Ultra-clean, white space focused, essential elements only',
      'bold': 'Strong colors, confident design, makes a statement'
    };
    return descriptions[style] || 'Professional and polished';
  };

  const getColorGuidance = (colorScheme) => {
    const guidance = {
      'professional': 'Navy blue, charcoal gray, white - corporate appropriate',
      'warm': 'Warm grays, soft oranges, cream - approachable and friendly', 
      'cool': 'Blues, teals, silver - tech-forward and modern',
      'vibrant': 'Rich colors, high contrast - creative and energetic'
    };
    return guidance[colorScheme] || 'Professional color palette';
  };

  const getLayoutGuidance = (layout) => {
    const guidance = {
      'single-column': 'Linear flow, easy mobile reading, clean progression',
      'two-column': 'Sidebar for skills/contact, main content area',
      'creative': 'Asymmetrical, visual hierarchy, portfolio showcase'
    };
    return guidance[layout] || 'Clean, professional layout';
  };

  const getStyleGuidance = (style) => {
    const guidance = {
      'modern': 'Sans-serif fonts, card-based sections, subtle shadows',
      'classic': 'Serif accents, traditional spacing, formal structure',
      'creative': 'Mixed typography, visual elements, personality showcase',
      'minimal': 'Plenty of whitespace, single font family, essential only',
      'bold': 'Strong typography, confident spacing, high contrast'
    };
    return guidance[style] || 'Professional appearance';
  };

  const getCtaStrategy = (cta, company) => {
    const strategies = {
      'hire-me': `Bold "Hire Me for ${company}" button above the fold, email integration`,
      'contact': `Professional contact form with subject line "Interest in ${company} ${formData.targetRole} Role"`,
      'schedule-call': `Calendar integration for easy interview scheduling, "Let's Discuss ${company} Opportunity"`,
      'view-portfolio': `Showcase work relevant to ${company} industry, "See My ${formData.targetRole} Work"`
    };
    return strategies[cta] || `Professional contact method focused on ${company} opportunity`;
  };

  // Generate domain suggestions when target company changes
  useEffect(() => {
    if (formData.fullName && formData.targetCompany) {
      generateDomainSuggestions();
    }
  }, [formData.fullName, formData.targetCompany, formData.targetRole]);

  const generateDomainSuggestions = async () => {
    try {
      const response = await fetch('/api/domains/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          targetCompany: formData.targetCompany,
          targetRole: formData.targetRole
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setDomainSuggestions(data.suggestions);
        // Auto-select the top available recommendation
        const topChoice = data.suggestions.find(d => d.available && d.recommended);
        if (topChoice) {
          setSelectedDomain(topChoice);
        }
      }
    } catch (error) {
      console.error('Domain suggestions failed:', error);
    }
  };

  const generateWebsite = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/generate/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          selectedDomain
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedSite(data.website);
        setPreviewMode(true);
      } else {
        setGenerationError(data.error || 'Failed to generate website');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      keySkills: prev.keySkills.includes(skill)
        ? prev.keySkills.filter(s => s !== skill)
        : [...prev.keySkills, skill]
    }));
  };

  const handleFocusAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
    'Project Management', 'Team Leadership', 'Data Analysis', 'Machine Learning',
    'UX Design', 'Product Strategy', 'Marketing', 'Sales', 'Operations'
  ];

  const focusAreaOptions = [
    { id: 'technical-skills', label: 'Technical Skills', desc: 'Emphasize technical expertise' },
    { id: 'leadership', label: 'Leadership', desc: 'Highlight management experience' },
    { id: 'achievements', label: 'Achievements', desc: 'Focus on measurable results' },
    { id: 'education', label: 'Education', desc: 'Emphasize academic background' },
    { id: 'projects', label: 'Projects', desc: 'Showcase specific work examples' }
  ];

  return (
    <div className="resume-builder">
      <div className="builder-header">
        <div className="progress-bar">
          <div className={`step ${step >= 1 ? 'completed' : ''}`}>1. Basic Info</div>
          <div className={`step ${step >= 2 ? 'completed' : ''}`}>2. Professional Profile</div>
          <div className={`step ${step >= 3 ? 'completed' : ''}`}>3. Design Preferences</div>
          <div className={`step ${step >= 4 ? 'completed' : ''}`}>4. Domain Selection</div>
          <div className={`step ${step >= 5 ? 'completed' : ''}`}>5. Generate & Preview</div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <button onClick={enableTestMode} className="test-mode-btn">
            Fill Test Data
          </button>
        )}
      </div>

      {step === 1 && (
        <div className="step-content">
          <h2>📝 Basic Information</h2>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            <input
              type="text"
              placeholder="Location (City, State)"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
            <input
              type="url"
              placeholder="LinkedIn Profile URL"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
            />
            <input
              type="url"
              placeholder="Portfolio/Website URL (optional)"
              value={formData.portfolioUrl}
              onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
            />
          </div>
          <button 
            className="next-btn"
            onClick={() => setStep(2)}
            disabled={!formData.fullName || !formData.email}
          >
            Next: Professional Profile →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>💼 Professional Profile</h2>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Current Job Title"
              value={formData.currentTitle}
              onChange={(e) => handleInputChange('currentTitle', e.target.value)}
            />
            <input
              type="text"
              placeholder="Target Role (e.g., Senior Product Manager)"
              value={formData.targetRole}
              onChange={(e) => handleInputChange('targetRole', e.target.value)}
            />
            <input
              type="text"
              placeholder="Target Company (e.g., Apple, Google, Tesla)"
              value={formData.targetCompany}
              onChange={(e) => handleInputChange('targetCompany', e.target.value)}
            />
            
            <select
              value={formData.careerLevel}
              onChange={(e) => handleInputChange('careerLevel', e.target.value)}
            >
              <option value="">Select Career Level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-7 years)</option>
              <option value="senior">Senior Level (8-15 years)</option>
              <option value="executive">Executive Level (15+ years)</option>
            </select>

            <input
              type="text"
              placeholder="Industry Experience (e.g., FinTech, Healthcare, E-commerce)"
              value={formData.industryExperience}
              onChange={(e) => handleInputChange('industryExperience', e.target.value)}
            />
          </div>

          <div className="skills-section">
            <h3>Key Skills</h3>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <label key={skill} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.keySkills.includes(skill)}
                    onChange={() => handleSkillsChange(skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="next-btn" onClick={() => setStep(3)}>
            Next: Design Preferences →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <h2>🎨 Design Preferences</h2>
          <p>These choices will help create a site that appeals to your target company's culture</p>
          
          <div className="design-section">
            <h3>Style</h3>
            <div className="radio-grid">
              {['modern', 'classic', 'creative', 'minimal', 'bold'].map(style => (
                <label key={style} className="radio-option">
                  <input
                    type="radio"
                    name="style"
                    value={style}
                    checked={formData.style === style}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                  />
                  <div className="option-content">
                    <strong>{style.charAt(0).toUpperCase() + style.slice(1)}</strong>
                    <p>{getStyleDescription(style)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="design-section">
            <h3>Color Scheme</h3>
            <div className="radio-grid">
              {['professional', 'warm', 'cool', 'vibrant'].map(color => (
                <label key={color} className="radio-option">
                  <input
                    type="radio"
                    name="colorScheme"
                    value={color}
                    checked={formData.colorScheme === color}
                    onChange={(e) => handleInputChange('colorScheme', e.target.value)}
                  />
                  <div className="option-content">
                    <strong>{color.charAt(0).toUpperCase() + color.slice(1)}</strong>
                    <p>{getColorGuidance(color)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="design-section">
            <h3>Focus Areas</h3>
            <div className="checkbox-grid">
              {focusAreaOptions.map(area => (
                <label key={area.id} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.focusAreas.includes(area.id)}
                    onChange={() => handleFocusAreaChange(area.id)}
                  />
                  <div className="option-content">
                    <strong>{area.label}</strong>
                    <p>{area.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button className="next-btn" onClick={() => setStep(4)}>
            Next: Domain Selection →
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="step-content">
          <h2>🌐 Smart Domain Suggestions</h2>
          <p>Company-specific domains show serious intent to recruiters!</p>
          
          {domainSuggestions.length > 0 && (
            <div className="domain-suggestions">
              {domainSuggestions.filter(d => d.available).map(domain => (
                <div 
                  key={domain.domain} 
                  className={`domain-option ${selectedDomain?.domain === domain.domain ? 'selected' : ''}`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  <div className="domain-info">
                    <h3>{domain.domain}</h3>
                    {domain.recommended && <span className="recommended">⭐ Recommended</span>}
                    <p className="pricing">
                      ${domain.pricing.monthlyAmortized}/month (${domain.pricing.ourPrice}/year)
                    </p>
                  </div>
                  <div className="domain-benefits">
                    <p>✓ Shows targeted interest in {formData.targetCompany}</p>
                    <p>✓ Memorable for recruiters</p>
                    <p>✓ Professional impression</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            className="next-btn" 
            onClick={() => setStep(5)}
            disabled={!selectedDomain}
          >
            Generate Website →
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="step-content">
          <h2>Generate Your Professional Website</h2>
          <div className="generation-summary">
            <h3>Ready to Create:</h3>
            <ul>
              <li><strong>Candidate:</strong> {formData.fullName}</li>
              <li><strong>Target:</strong> {formData.targetRole} at {formData.targetCompany}</li>
              <li><strong>Domain:</strong> {selectedDomain?.domain}</li>
              <li><strong>Style:</strong> {formData.style} with {formData.colorScheme} colors</li>
              <li><strong>Focus:</strong> {formData.focusAreas.join(', ')}</li>
            </ul>
          </div>

          {generationError && (
            <div className="error-message">
              {generationError}
            </div>
          )}

          <button
            className="generate-btn"
            onClick={generateWebsite}
            disabled={!selectedDomain || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              'Generate Professional Website'
            )}
          </button>

          {generatedSite && (
            <div className="preview-section">
              <h3>Preview & Deploy</h3>
              <iframe
                srcDoc={generatedSite.html}
                title="Website Preview"
                className="preview-iframe"
                sandbox="allow-scripts"
              />
              <div className="deploy-actions">
                <button onClick={() => setStep(3)}>Edit Design</button>
                <button>Deploy to {selectedDomain?.domain}</button>
                <button
                  onClick={() => {
                    const blob = new Blob([generatedSite.html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'resume-website.html';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Files
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;