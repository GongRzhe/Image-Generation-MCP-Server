#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN environment variable is required');
}

interface FluxInput {
  prompt: string;
  seed?: number;
  go_fast?: boolean;
  megapixels?: '1' | '0.25';
  num_outputs?: number;
  aspect_ratio?: '1:1' | '16:9' | '21:9' | '3:2' | '2:3' | '4:5' | '5:4' | '3:4' | '4:3' | '9:16' | '9:21';
  output_format?: 'webp' | 'jpg' | 'png';
  output_quality?: number;
  num_inference_steps?: number;
  disable_safety_checker?: boolean;
}

class ImageGenerationServer {
  private server: Server;
  private axiosInstance;
  private readonly MODEL = process.env.MODEL || 'black-forest-labs/flux-schnell';

  constructor() {
    this.server = new Server(
      {
        name: 'image-generation-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.replicate.com/v1',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_image',
          description: 'Generate an image using the Flux model',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Prompt for generated image',
              },
              seed: {
                type: 'integer',
                description: 'Random seed for reproducible generation',
              },
              aspect_ratio: {
                type: 'string',
                enum: ['1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21'],
                description: 'Aspect ratio for the generated image',
                default: '1:1',
              },
              output_format: {
                type: 'string',
                enum: ['webp', 'jpg', 'png'],
                description: 'Format of the output images',
                default: 'webp',
              },
              num_outputs: {
                type: 'integer',
                description: 'Number of outputs to generate (1-4)',
                default: 1,
                minimum: 1,
                maximum: 4,
              },
            },
            required: ['prompt'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'generate_image') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      // Validate input arguments
      if (!request.params.arguments || typeof request.params.arguments !== 'object') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Arguments must be an object'
        );
      }

      if (!('prompt' in request.params.arguments) || typeof request.params.arguments.prompt !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Prompt is required and must be a string'
        );
      }

      const input: FluxInput = {
        prompt: request.params.arguments.prompt,
      };

      // Add optional parameters if they exist and are valid
      if ('seed' in request.params.arguments && typeof request.params.arguments.seed === 'number') {
        input.seed = request.params.arguments.seed;
      }
      if ('aspect_ratio' in request.params.arguments && typeof request.params.arguments.aspect_ratio === 'string') {
        input.aspect_ratio = request.params.arguments.aspect_ratio as FluxInput['aspect_ratio'];
      }
      if ('output_format' in request.params.arguments && typeof request.params.arguments.output_format === 'string') {
        input.output_format = request.params.arguments.output_format as FluxInput['output_format'];
      }
      if ('num_outputs' in request.params.arguments && typeof request.params.arguments.num_outputs === 'number') {
        input.num_outputs = Math.min(Math.max(1, request.params.arguments.num_outputs), 4);
      }

      try {
        // Create prediction
        const createResponse = await this.axiosInstance.post('/predictions', {
          version: this.MODEL,
          input,
        });

        const predictionId = createResponse.data.id;

        // Poll for completion
        while (true) {
          const getResponse = await this.axiosInstance.get(`/predictions/${predictionId}`);
          const prediction = getResponse.data;

          if (prediction.status === 'succeeded') {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(prediction.output),
                },
              ],
            };
          } else if (prediction.status === 'failed') {
            throw new McpError(
              ErrorCode.InternalError,
              `Image generation failed: ${prediction.error || 'Unknown error'}`
            );
          }

          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `Replicate API error: ${error.response?.data?.detail || error.message}`
          );
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Image Generation MCP server running on stdio');
  }
}

const server = new ImageGenerationServer();
server.run().catch(console.error);
