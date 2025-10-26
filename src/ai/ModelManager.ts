import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'replicate' | 'google' | 'huggingface';
  model: string;
  costPer1kTokens: number;
  maxTokens: number;
  capabilities: ('text' | 'vision' | 'json' | 'reasoning')[];
  speed: 'fast' | 'medium' | 'slow';
  contextWindow: number;
}

export interface ModelResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latency: number;
}

export interface ModelRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  imageUrl?: string;
}

export class ModelManager {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private replicate: Replicate;
  private google: GoogleGenerativeAI;
  private models: Map<string, AIModel>;

  constructor() {
    // Get API keys with fallback
    const getEnvVar = (key: string) => {
      // @ts-ignore - import.meta.env is available at runtime
      return import.meta?.env?.[key] || process?.env?.[key] || '';
    };

    this.openai = new OpenAI({ 
      apiKey: getEnvVar('VITE_OPENAI_API_KEY')
    });
    
    this.anthropic = new Anthropic({ 
      apiKey: getEnvVar('VITE_ANTHROPIC_API_KEY')
    });
    
    this.replicate = new Replicate({
      auth: getEnvVar('VITE_REPLICATE_API_KEY'),
    });
    
    this.google = new GoogleGenerativeAI(getEnvVar('VITE_GOOGLE_API_KEY'));
    
    this.initializeModels();
  }

  private initializeModels(): void {
    this.models = new Map([
      // OpenAI Models
      ['gpt-4o', {
        id: 'gpt-4o',
        name: 'GPT-4 Omni',
        provider: 'openai',
        model: 'gpt-4o',
        costPer1kTokens: 5.00,
        maxTokens: 128000,
        capabilities: ['text', 'vision', 'json', 'reasoning'],
        speed: 'medium',
        contextWindow: 128000
      }],
      ['gpt-4o-mini', {
        id: 'gpt-4o-mini',
        name: 'GPT-4 Omni Mini',
        provider: 'openai',
        model: 'gpt-4o-mini',
        costPer1kTokens: 0.15,
        maxTokens: 128000,
        capabilities: ['text', 'vision', 'json'],
        speed: 'fast',
        contextWindow: 128000
      }],

      // Anthropic Models
      ['claude-3-5-sonnet', {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        costPer1kTokens: 3.00,
        maxTokens: 200000,
        capabilities: ['text', 'vision', 'json', 'reasoning'],
        speed: 'medium',
        contextWindow: 200000
      }],
      ['claude-3-haiku', {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        costPer1kTokens: 0.25,
        maxTokens: 200000,
        capabilities: ['text', 'vision'],
        speed: 'fast',
        contextWindow: 200000
      }],

      // Replicate Models (Open Source)
      ['llama-3.1-405b', {
        id: 'llama-3.1-405b',
        name: 'Llama 3.1 405B',
        provider: 'replicate',
        model: 'meta/meta-llama-3.1-405b-instruct',
        costPer1kTokens: 0.80,
        maxTokens: 32768,
        capabilities: ['text', 'json'],
        speed: 'slow',
        contextWindow: 131072
      }],
      ['mixtral-8x22b', {
        id: 'mixtral-8x22b',
        name: 'Mixtral 8x22B',
        provider: 'replicate',
        model: 'mistralai/mixtral-8x22b-instruct',
        costPer1kTokens: 1.20,
        maxTokens: 65536,
        capabilities: ['text', 'json'],
        speed: 'medium',
        contextWindow: 65536
      }],

      // Google Models
      ['gemini-1.5-flash', {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        model: 'gemini-1.5-flash',
        costPer1kTokens: 0.075,
        maxTokens: 8192,
        capabilities: ['text', 'vision', 'json'],
        speed: 'fast',
        contextWindow: 1000000
      }],
      ['gemini-1.5-pro', {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        model: 'gemini-1.5-pro',
        costPer1kTokens: 3.50,
        maxTokens: 8192,
        capabilities: ['text', 'vision', 'json', 'reasoning'],
        speed: 'medium',
        contextWindow: 1000000
      }]
    ]);
  }

  /**
   * Get optimized model for specific task type
   */
  getOptimizedModel(taskType: string, budget: 'low' | 'medium' | 'high' = 'medium'): AIModel {
    const modelConfigs: Record<string, string[]> = {
      // Planning & Reasoning Tasks
      'planning': ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro'],
      'reasoning': ['claude-3-5-sonnet', 'gpt-4o', 'llama-3.1-405b'],
      'verification': ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
      
      // Content Generation
      'content-generation': ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
      'metadata-generation': ['gpt-4o', 'claude-3-haiku', 'gemini-1.5-flash'],
      
      // Analysis & Processing
      'data-analysis': ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash'],
      'market-analysis': ['gpt-4o-mini', 'claude-3-haiku', 'mixtral-8x22b'],
      'risk-assessment': ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
      
      // Cost-Optimized
      'batch-processing': ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash'],
      'fallback': ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash']
    };

    const budgetMultipliers = {
      low: 0,
      medium: 1,
      high: 2
    };

    const models = modelConfigs[taskType] || modelConfigs.fallback;
    
    // Filter by budget
    const availableModels = models
      .map(modelId => this.models.get(modelId)!)
      .filter(model => {
        if (budget === 'low') return model.costPer1kTokens <= 0.5;
        if (budget === 'medium') return model.costPer1kTokens <= 5.0;
        return true; // high budget - all models available
      });

    return availableModels[0] || this.models.get('gpt-4o-mini')!;
  }

  /**
   * Execute prompt with primary model and fallbacks
   */
  async executeWithFallback(
    request: ModelRequest,
    taskType: string,
    budget: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ModelResponse> {
    const primaryModel = this.getOptimizedModel(taskType, budget);
    const fallbackModels = this.getFallbackModels(primaryModel, taskType);

    const modelsToTry = [primaryModel, ...fallbackModels];
    
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${model.name}`);
        const response = await this.executeSingleModel(model, request);
        console.log(`✅ Success with model: ${model.name}`);
        return response;
      } catch (error: any) {
        console.warn(`❌ Model ${model.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  /**
   * Execute with specific model
   */
  private async executeSingleModel(
    model: AIModel,
    request: ModelRequest
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    let response: ModelResponse;
    
    switch (model.provider) {
      case 'openai':
        response = await this.executeOpenAI(model, request);
        break;
      case 'anthropic':
        response = await this.executeAnthropic(model, request);
        break;
      case 'replicate':
        response = await this.executeReplicate(model, request);
        break;
      case 'google':
        response = await this.executeGoogle(model, request);
        break;
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }

    response.latency = Date.now() - startTime;
    return response;
  }

  /**
   * OpenAI Implementation
   */
  private async executeOpenAI(
    model: AIModel,
    request: ModelRequest
  ): Promise<ModelResponse> {
    const messages: any[] = [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt }
    ];

    // Handle image input
    if (request.imageUrl) {
      messages[1].content = [
        { type: 'text', text: request.userPrompt },
        { type: 'image_url', image_url: { url: request.imageUrl } }
      ];
    }

    const completion = await this.openai.chat.completions.create({
      model: model.model,
      messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || model.maxTokens,
      response_format: request.jsonMode ? { type: 'json_object' } : undefined,
    });

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content,
      model: model.name,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      cost: this.calculateCost(model, usage.total_tokens),
      latency: 0
    };
  }

  /**
   * Anthropic Implementation
   */
  private async executeAnthropic(
    model: AIModel,
    request: ModelRequest
  ): Promise<ModelResponse> {
    const message = await this.anthropic.messages.create({
      model: model.model,
      max_tokens: request.maxTokens || model.maxTokens,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt,
      messages: [
        { role: 'user', content: request.userPrompt }
      ]
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const usage = message.usage;

    return {
      content,
      model: model.name,
      usage: {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens
      },
      cost: this.calculateCost(model, usage.input_tokens + usage.output_tokens),
      latency: 0
    };
  }

  /**
   * Replicate Implementation (Open Source Models)
   */
  private async executeReplicate(
    model: AIModel,
    request: ModelRequest
  ): Promise<ModelResponse> {
    const input = {
      prompt: `${request.systemPrompt}\n\n${request.userPrompt}`,
      temperature: request.temperature || 0.7,
      max_new_tokens: request.maxTokens || model.maxTokens,
      top_p: 0.9,
      repetition_penalty: 1.1
    };

    // @ts-ignore - Replicate types are complex
    const output = await this.replicate.run(model.model as any, { input }) as string[];

    // Estimate token usage (rough approximation)
    const estimatedTokens = Math.ceil(output.join('').length / 4);

    return {
      content: output.join(''),
      model: model.name,
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: estimatedTokens,
        totalTokens: estimatedTokens * 2
      },
      cost: this.calculateCost(model, estimatedTokens * 2),
      latency: 0
    };
  }

  /**
   * Google Implementation
   */
  private async executeGoogle(
    model: AIModel,
    request: ModelRequest
  ): Promise<ModelResponse> {
    const genAI = this.google;
    const googleModel = genAI.getGenerativeModel({ 
      model: model.model,
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || model.maxTokens,
      }
    });

    const prompt = `${request.systemPrompt}\n\n${request.userPrompt}`;
    const result = await googleModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Estimate token usage for Google
    const estimatedTokens = Math.ceil(text.length / 4);

    return {
      content: text,
      model: model.name,
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: estimatedTokens,
        totalTokens: estimatedTokens * 2
      },
      cost: this.calculateCost(model, estimatedTokens * 2),
      latency: 0
    };
  }

  /**
   * Calculate cost for API call
   */
  private calculateCost(model: AIModel, tokens: number): number {
    return (tokens / 1000) * model.costPer1kTokens;
  }

  /**
   * Get fallback models for redundancy
   */
  private getFallbackModels(primary: AIModel, taskType: string): AIModel[] {
    const fallbacks: AIModel[] = [];
    
    // Always include cost-effective fallbacks
    const costEffective = this.models.get('gpt-4o-mini')!;
    if (costEffective.id !== primary.id) {
      fallbacks.push(costEffective);
    }

    // Add another model from different provider
    const alternativeProvider = Array.from(this.models.values())
      .find(model => 
        model.provider !== primary.provider && 
        model.capabilities.includes('text') &&
        model.id !== primary.id
      );

    if (alternativeProvider) {
      fallbacks.push(alternativeProvider);
    }

    return fallbacks.slice(0, 2); // Max 2 fallbacks
  }

  /**
   * Get all available models
   */
  getAvailableModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Get model performance statistics
   */
  getModelStats(): any {
    // This would track real usage stats - placeholder
    return {
      totalRequests: 0,
      successRate: 1.0,
      averageLatency: 0,
      totalCost: 0
    };
  }
}

