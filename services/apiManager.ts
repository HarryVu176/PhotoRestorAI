/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface APIProvider {
  name: string;
  baseUrl: string;
  apiKeys: string[]; // Changed from single apiKey to array of keys
  currentKeyIndex: number; // Track which key is currently being used
  model: string;
  isActive: boolean;
  dailyLimit?: number;
  usedToday?: number;
  lastResetDate?: string;
  keyUsage?: { [key: string]: number }; // Track usage per key
}

class APIManager {
  private providers: APIProvider[] = [];
  private currentProviderIndex = 0;
  private maxRetries = 3;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // OpenRouter API - Support multiple keys
    const openRouterKeys = this.parseAPIKeys(import.meta.env.VITE_OPENROUTER_API_KEY);
    if (openRouterKeys.length > 0) {
      this.providers.push({
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKeys: openRouterKeys,
        currentKeyIndex: 0,
        model: 'google/gemini-2.5-flash-image-preview',
        isActive: true,
        dailyLimit: 100, // Per key
        usedToday: this.getTodayUsage('openrouter'),
        lastResetDate: this.getLastResetDate('openrouter'),
        keyUsage: this.getKeyUsage('openrouter', openRouterKeys)
      });
    }

    // Gemini API - Support multiple keys
    const geminiKeys = this.parseAPIKeys(import.meta.env.VITE_GEMINI_API_KEY);
    if (geminiKeys.length > 0) {
      this.providers.push({
        name: 'Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        apiKeys: geminiKeys,
        currentKeyIndex: 0,
        model: 'gemini-2.0-flash-exp',
        isActive: true,
        dailyLimit: 1500, // Per key
        usedToday: this.getTodayUsage('gemini'),
        lastResetDate: this.getLastResetDate('gemini'),
        keyUsage: this.getKeyUsage('gemini', geminiKeys)
      });
    }

    // Hugging Face Free API - Support multiple keys
    const huggingFaceKeys = this.parseAPIKeys(import.meta.env.VITE_HUGGINGFACE_API_KEY);
    if (huggingFaceKeys.length > 0) {
      this.providers.push({
        name: 'HuggingFace',
        baseUrl: 'https://api-inference.huggingface.co',
        apiKeys: huggingFaceKeys,
        currentKeyIndex: 0,
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        isActive: true,
        dailyLimit: 1000, // Per key
        usedToday: this.getTodayUsage('huggingface'),
        lastResetDate: this.getLastResetDate('huggingface'),
        keyUsage: this.getKeyUsage('huggingface', huggingFaceKeys)
      });
    }

    // Replicate Free API - Support multiple keys
    const replicateKeys = this.parseAPIKeys(import.meta.env.VITE_REPLICATE_API_KEY);
    if (replicateKeys.length > 0) {
      this.providers.push({
        name: 'Replicate',
        baseUrl: 'https://api.replicate.com/v1',
        apiKeys: replicateKeys,
        currentKeyIndex: 0,
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        isActive: true,
        dailyLimit: 50, // Per key
        usedToday: this.getTodayUsage('replicate'),
        lastResetDate: this.getLastResetDate('replicate'),
        keyUsage: this.getKeyUsage('replicate', replicateKeys)
      });
    }

    console.log(`Initialized ${this.providers.length} API providers:`, 
      this.providers.map(p => `${p.name} (${p.apiKeys.length} keys)`));
  }

  private parseAPIKeys(envValue?: string): string[] {
    if (!envValue) return [];
    
    // Support comma-separated keys: VITE_OPENROUTER_API_KEY=key1,key2,key3
    return envValue.split(',')
      .map(key => key.trim())
      .filter(key => key.length > 0);
  }

  private getKeyUsage(provider: string, keys: string[]): { [key: string]: number } {
    const today = new Date().toDateString();
    const usage: { [key: string]: number } = {};
    
    keys.forEach((key, index) => {
      const keyId = `key_${index}`;
      const stored = localStorage.getItem(`api_usage_${provider}_${keyId}_${today}`);
      usage[keyId] = stored ? parseInt(stored) : 0;
    });
    
    return usage;
  }

  private getTodayUsage(provider: string): number {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`api_usage_${provider}_${today}`);
    return stored ? parseInt(stored) : 0;
  }

  private getLastResetDate(provider: string): string {
    return localStorage.getItem(`api_reset_${provider}`) || new Date().toDateString();
  }

  private incrementUsage(provider: string, keyIndex: number = 0) {
    const today = new Date().toDateString();
    const keyId = `key_${keyIndex}`;
    const current = this.getTodayUsage(provider);
    const keyUsageKey = `api_usage_${provider}_${keyId}_${today}`;
    const currentKeyUsage = localStorage.getItem(keyUsageKey);
    
    localStorage.setItem(`api_usage_${provider}_${today}`, (current + 1).toString());
    localStorage.setItem(keyUsageKey, (currentKeyUsage ? parseInt(currentKeyUsage) + 1 : 1).toString());
    localStorage.setItem(`api_reset_${provider}`, today);
    
    // Update current provider usage
    const currentProvider = this.providers.find(p => p.name.toLowerCase() === provider.toLowerCase());
    if (currentProvider) {
      currentProvider.usedToday = current + 1;
      currentProvider.lastResetDate = today;
      if (currentProvider.keyUsage) {
        currentProvider.keyUsage[keyId] = (currentProvider.keyUsage[keyId] || 0) + 1;
      }
    }
  }

  private getCurrentApiKey(provider: APIProvider): string {
    return provider.apiKeys[provider.currentKeyIndex] || '';
  }

  private rotateToNextKey(provider: APIProvider): boolean {
    if (provider.apiKeys.length <= 1) return false;
    
    provider.currentKeyIndex = (provider.currentKeyIndex + 1) % provider.apiKeys.length;
    console.log(`🔄 Rotated ${provider.name} to key index ${provider.currentKeyIndex}`);
    return true;
  }

  private isProviderAvailable(provider: APIProvider): boolean {
    if (!provider.isActive) return false;
    
    // Check if any key is available
    for (let i = 0; i < provider.apiKeys.length; i++) {
      const keyId = `key_${i}`;
      const keyUsage = provider.keyUsage?.[keyId] || 0;
      
      if (!provider.dailyLimit || keyUsage < provider.dailyLimit) {
        // This key is available, set it as current
        provider.currentKeyIndex = i;
        return true;
      }
    }
    
    // Check if it's a new day - reset usage
    const today = new Date().toDateString();
    if (provider.lastResetDate !== today) {
      provider.usedToday = 0;
      provider.lastResetDate = today;
      provider.currentKeyIndex = 0;
      
      // Reset key usage
      if (provider.keyUsage) {
        Object.keys(provider.keyUsage).forEach(key => {
          provider.keyUsage![key] = 0;
        });
      }
      
      return true;
    }
    
    return false;
  }

  private getNextAvailableProvider(): APIProvider | null {
    const availableProviders = this.providers.filter(p => this.isProviderAvailable(p));
    
    if (availableProviders.length === 0) {
      return null;
    }
    
    // Rotate through available providers
    this.currentProviderIndex = this.currentProviderIndex % availableProviders.length;
    return availableProviders[this.currentProviderIndex];
  }

  async generateImage(prompt: string, imageFile?: File): Promise<string> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.maxRetries) {
      const provider = this.getNextAvailableProvider();
      
      if (!provider) {
        throw new Error('All API providers have exceeded quota or are unavailable. Please try again later.');
      }

      // Try each key for the current provider
      let keyAttempts = 0;
      const maxKeyAttempts = provider.apiKeys.length;

      while (keyAttempts < maxKeyAttempts) {
        try {
          console.log(`Attempting to use ${provider.name} with key ${provider.currentKeyIndex + 1}/${provider.apiKeys.length} (attempt ${attempts + 1}/${this.maxRetries})`);
          
          let result: string;
          
          switch (provider.name) {
            case 'OpenRouter':
              result = await this.callOpenRouterAPI(provider, prompt, imageFile);
              break;
            case 'Gemini':
              result = await this.callGeminiAPI(provider, prompt, imageFile);
              break;
            case 'HuggingFace':
              result = await this.callHuggingFaceAPI(provider, prompt, imageFile);
              break;
            case 'Replicate':
              result = await this.callReplicateAPI(provider, prompt, imageFile);
              break;
            default:
              throw new Error(`Unknown provider: ${provider.name}`);
          }

          // Success - increment usage and return
          this.incrementUsage(provider.name.toLowerCase(), provider.currentKeyIndex);
          this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
          
          return result;

        } catch (error) {
          console.error(`${provider.name} key ${provider.currentKeyIndex + 1} failed:`, error);
          lastError = error as Error;
          
          // Check if it's a quota/rate limit error
          if (this.isQuotaError(error)) {
            console.log(`Key ${provider.currentKeyIndex + 1} hit quota, trying next key...`);
            
            // Try rotating to next key
            if (this.rotateToNextKey(provider)) {
              keyAttempts++;
              continue; // Try next key
            } else {
              // No more keys available, mark provider as temporarily unavailable
              provider.isActive = false;
              console.log(`Marking ${provider.name} as temporarily unavailable (all keys exhausted)`);
              break; // Break out of key loop
            }
          } else {
            // Non-quota error, try next key
            if (this.rotateToNextKey(provider)) {
              keyAttempts++;
              continue;
            } else {
              break; // No more keys to try
            }
          }
        }
      }

      attempts++;
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    }

    throw new Error(`All API providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  private isQuotaError(error: any): boolean {
    const errorMsg = error?.message?.toLowerCase() || '';
    const quotaKeywords = ['quota', 'limit', 'rate limit', 'insufficient', 'exceeded', '429', '402'];
    return quotaKeywords.some(keyword => errorMsg.includes(keyword));
  }

  private async callOpenRouterAPI(provider: APIProvider, prompt: string, imageFile?: File): Promise<string> {
    const currentApiKey = this.getCurrentApiKey(provider);
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PhotoRestorAI'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'user',
            content: imageFile 
              ? [
                  { type: 'text', text: prompt },
                  { 
                    type: 'image_url', 
                    image_url: { 
                      url: await this.fileToBase64(imageFile) 
                    } 
                  }
                ]
              : prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    
    // For image generation models, the response might be different
    // This is a simplified version - you'll need to adapt based on actual API response
    return data.choices[0]?.message?.content || data.data?.[0]?.url || '';
  }

  private async callGeminiAPI(provider: APIProvider, prompt: string, imageFile?: File): Promise<string> {
    const currentApiKey = this.getCurrentApiKey(provider);
    
    const endpoint = imageFile 
      ? `${provider.baseUrl}/models/${provider.model}:generateContent?key=${currentApiKey}`
      : `${provider.baseUrl}/models/${provider.model}:generateContent?key=${currentApiKey}`;

    const contents = imageFile ? {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: imageFile.type,
              data: (await this.fileToBase64(imageFile)).split(',')[1]
            }
          }
        ]
      }]
    } : {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contents)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callHuggingFaceAPI(provider: APIProvider, prompt: string, imageFile?: File): Promise<string> {
    const currentApiKey = this.getCurrentApiKey(provider);
    
    const response = await fetch(`${provider.baseUrl}/models/${provider.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} - ${await response.text()}`);
    }

    const blob = await response.blob();
    return this.blobToBase64(blob);
  }

  private async callReplicateAPI(provider: APIProvider, prompt: string, imageFile?: File): Promise<string> {
    const currentApiKey = this.getCurrentApiKey(provider);
    
    // Create prediction
    const response = await fetch(`${provider.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${currentApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: provider.model,
        input: {
          prompt: prompt,
          image: imageFile ? await this.fileToBase64(imageFile) : undefined
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status} - ${await response.text()}`);
    }

    const prediction = await response.json();
    
    // Poll for result
    return this.pollReplicateResult(provider, prediction.id);
  }

  private async pollReplicateResult(provider: APIProvider, predictionId: string): Promise<string> {
    const currentApiKey = this.getCurrentApiKey(provider);
    const maxPolls = 60; // 5 minutes max
    let polls = 0;

    while (polls < maxPolls) {
      const response = await fetch(`${provider.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${currentApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Replicate polling error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'succeeded') {
        return result.output?.[0] || result.output || '';
      }
      
      if (result.status === 'failed') {
        throw new Error(`Replicate prediction failed: ${result.error}`);
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      polls++;
    }

    throw new Error('Replicate prediction timeout');
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Public methods for monitoring
  getProviderStatus(): Array<{name: string, isActive: boolean, usedToday: number, dailyLimit?: number, totalKeys: number, currentKeyIndex: number}> {
    return this.providers.map(p => ({
      name: p.name,
      isActive: p.isActive && this.isProviderAvailable(p),
      usedToday: p.usedToday || 0,
      dailyLimit: p.dailyLimit,
      totalKeys: p.apiKeys.length,
      currentKeyIndex: p.currentKeyIndex
    }));
  }

  resetProvider(providerName: string) {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      provider.isActive = true;
      provider.usedToday = 0;
      provider.lastResetDate = new Date().toDateString();
      provider.currentKeyIndex = 0;
      
      // Reset key usage
      if (provider.keyUsage) {
        Object.keys(provider.keyUsage).forEach(key => {
          provider.keyUsage![key] = 0;
        });
      }
    }
  }
}

export const apiManager = new APIManager();
