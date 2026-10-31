const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    this.provider = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'anthropic'
  }

  /**
   * Analyze app with AI for detailed insights
   */
  async analyzeAppWithAI({ appName, packageName, permissions, riskReasons }) {
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }

    try {
      const prompt = this._buildPrompt(appName, packageName, permissions, riskReasons);
      
      let insights;
      if (this.provider === 'anthropic') {
        insights = await this._analyzeWithClaude(prompt);
      } else {
        insights = await this._analyzeWithOpenAI(prompt);
      }

      return { insights };
    } catch (error) {
      logger.error('AI analysis failed', { 
        error: error.message,
        provider: this.provider,
      });
      throw error;
    }
  }

  /**
   * Build analysis prompt
   */
  _buildPrompt(appName, packageName, permissions, riskReasons) {
    return `You are a mobile security expert. Analyze this Android app for security risks.

App Name: ${appName}
Package Name: ${packageName}
Permissions: ${permissions.join(', ') || 'None'}

Initial Risk Analysis Found:
${riskReasons.map(r => `- ${r}`).join('\n')}

Provide a brief analysis (2-3 sentences) covering:
1. Why these permissions might be concerning for this type of app
2. What potential risks exist
3. Whether the user should keep or remove this app

Be clear, direct, and avoid technical jargon. Write for a non-technical user.`;
  }

  /**
   * Analyze with OpenAI GPT
   */
  async _analyzeWithOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a mobile security expert who explains risks clearly to non-technical users.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Analyze with Anthropic Claude
   */
  async _analyzeWithClaude(prompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.content[0].text.trim();
  }
}

module.exports = new AIService();
