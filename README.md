# Image Generation MCP Server

This MCP server provides image generation capabilities using the Replicate Flux model.

## Setup

1. Add the server configuration to your MCP settings file (located at `c:\Users\Administrator\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "image-gen": {
      "command": "node",
      "args": ["C:/Users/Administrator/Documents/Cline/MCP/image-gen-server/build/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token",
        "MODEL": "alternative-model-name"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

2. Get your Replicate API token:
   - Sign up/login at https://replicate.com
   - Go to https://replicate.com/account/api-tokens
   - Create a new API token
   - Copy the token and replace `your-replicate-api-token` in the MCP settings

### Environment Variables

- `REPLICATE_API_TOKEN` (required): Your Replicate API token for authentication
- `MODEL` (optional): The Replicate model to use for image generation. Defaults to "black-forest-labs/flux-schnell"

### Configuration Parameters

- `disabled`: Controls whether the server is enabled (`false`) or disabled (`true`)
- `autoApprove`: Array of tool names that can be executed without user confirmation. Empty array means all tool calls require confirmation.

## Available Tools

### generate_image

Generates images using the Flux model based on text prompts.

#### Parameters

- `prompt` (required): Text description of the image to generate
- `seed` (optional): Random seed for reproducible generation
- `aspect_ratio` (optional): Image aspect ratio (default: "1:1")
- `output_format` (optional): Output format - "webp", "jpg", or "png" (default: "webp")
- `num_outputs` (optional): Number of images to generate (1-4, default: 1)

#### Example Usage

```typescript
const result = await use_mcp_tool({
  server_name: "image-gen",
  tool_name: "generate_image",
  arguments: {
    prompt: "A beautiful sunset over mountains",
    aspect_ratio: "16:9",
    output_format: "png",
    num_outputs: 1
  }
});
```

The tool returns an array of URLs to the generated images.
