import { ModelManager, ModelRequest } from '../ModelManager';

export interface NFTMetadata {
  name: string;
  description: string;
  attributes: Array<{ trait_type: string; value: string }>;
  external_url?: string;
  image: string;
}

export interface ContentGenerationOptions {
  style?: 'professional' | 'creative' | 'technical' | 'casual' | 'mysterious';
  tone?: 'enthusiastic' | 'formal' | 'friendly' | 'mysterious';
  length?: 'short' | 'medium' | 'long';
  includeKeywords?: string[];
}

export class ContentGenerationAgent {
  private modelManager: ModelManager;

  constructor(modelManager: ModelManager) {
    this.modelManager = modelManager;
  }

  /**
   * Generate compelling NFT metadata using AI
   */
  async generateNFTMetadata(
    imageUrl: string,
    baseAttributes: Array<{ trait_type: string; value: string }>,
    options: ContentGenerationOptions = {}
  ): Promise<NFTMetadata> {
    const systemPrompt = `You are a creative NFT metadata specialist. Create compelling, engaging metadata that increases rental appeal.

Guidelines:
- Generate unique, memorable names
- Write descriptions that highlight utility and appeal
- Suggest relevant attributes that enhance value
- Maintain consistency with the visual style
- Focus on rental market appeal

Return JSON in this exact structure:
{
  "name": "string",
  "description": "string", 
  "attributes": [{ "trait_type": "string", "value": "string" }],
  "external_url": "string",
  "image": "string"
}`;

    const userPrompt = `
Generate metadata for an NFT with these base attributes:
${JSON.stringify(baseAttributes, null, 2)}

Style: ${options.style || 'creative'}
Tone: ${options.tone || 'enthusiastic'}
Length: ${options.length || 'medium'}
${options.includeKeywords ? `Keywords to include: ${options.includeKeywords.join(', ')}` : ''}

Create engaging metadata that will attract renters:`;

    const request: ModelRequest = {
      systemPrompt,
      userPrompt,
      temperature: 0.8, // Higher temperature for creativity
      maxTokens: 1500,
      jsonMode: true,
      imageUrl: imageUrl // Include image for multimodal analysis
    };

    const response = await this.modelManager.executeWithFallback(
      request,
      'content-generation',
      'medium'
    );

    const metadata = JSON.parse(response.content) as NFTMetadata;
    
    console.log(`🎨 Metadata Generation Complete:`, {
      model: response.model,
      name: metadata.name,
      cost: response.cost,
      latency: response.latency
    });

    return metadata;
  }

  /**
   * Generate multiple metadata options for A/B testing
   */
  async generateMetadataVariations(
    imageUrl: string,
    baseAttributes: Array<{ trait_type: string; value: string }>,
    numVariations: number = 3
  ): Promise<NFTMetadata[]> {
    const variations: NFTMetadata[] = [];

    const styles: Array<ContentGenerationOptions['style']> = ['creative', 'professional', 'mysterious'];
    const tones: Array<ContentGenerationOptions['tone']> = ['enthusiastic', 'formal', 'friendly'];

    for (let i = 0; i < numVariations; i++) {
      const options: ContentGenerationOptions = {
        style: styles[i % styles.length],
        tone: tones[i % tones.length],
        length: 'medium'
      };

      const metadata = await this.generateNFTMetadata(imageUrl, baseAttributes, options);
      variations.push(metadata);
    }

    return variations;
  }

  /**
   * Generate rental listing description
   */
  async generateRentalDescription(
    nftMetadata: NFTMetadata,
    rentalTerms: any
  ): Promise<string> {
    const systemPrompt = `You are a marketing expert for NFT rentals. Create compelling rental descriptions that highlight benefits and drive conversions.

Focus on:
- Clear value proposition
- Rental benefits and utility
- Competitive advantages
- Call-to-action for renters`;

    const userPrompt = `
Create a rental description for this NFT:

NFT: ${nftMetadata.name}
Description: ${nftMetadata.description}
Attributes: ${JSON.stringify(nftMetadata.attributes)}

Rental Terms:
- Price: ${rentalTerms.price} STT/hour
- Minimum Duration: ${rentalTerms.minDuration} hours
- Collateral: ${rentalTerms.collateral} STT

Write an engaging rental description:`;

    const request: ModelRequest = {
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 1000
    };

    const response = await this.modelManager.executeWithFallback(
      request,
      'content-generation',
      'low' // Use cost-effective model for descriptions
    );

    return response.content;
  }
}

