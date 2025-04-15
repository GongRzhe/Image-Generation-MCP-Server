# Image Generation MCP Server
![](https://badge.mcpx.dev?type=server 'MCP Server')

[![smithery badge](https://smithery.ai/badge/@GongRzhe/Image-Generation-MCP-Server)](https://smithery.ai/server/@GongRzhe/Image-Generation-MCP-Server)

This MCP server provides image generation capabilities using the Replicate Flux model.

## Installation

### Installing via Smithery

To install Image Generation MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@GongRzhe/Image-Generation-MCP-Server):

```bash
npx -y @smithery/cli install @GongRzhe/Image-Generation-MCP-Server --client claude
```

### Option 1: NPX Method (No Local Setup Required)
You can use the package directly from npm without installing it locally:

```bash
# No installation needed - npx will handle it
```

### Option 2: Local Installation
If you prefer a local installation:

```bash
# Global installation
npm install -g @gongrzhe/image-gen-server

# Or local installation
npm install @gongrzhe/image-gen-server
```

## Setup

### Configure Claude Desktop

Edit your Claude Desktop configuration file:

- On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

#### Option 1: NPX Configuration (Recommended)
This method runs the server directly from npm without needing local files:

```json
{
  "mcpServers": {
    "image-gen": {
      "command": "npx",
      "args": ["@gongrzhe/image-gen-server"],
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

#### Option 2: Local Installation Configuration
If you installed the package locally:

```json
{
  "mcpServers": {
    "image-gen": {
      "command": "node",
      "args": ["/path/to/image-gen-server/build/index.js"],
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

### Get Your Replicate API Token

1. Sign up/login at https://replicate.com
2. Go to https://replicate.com/account/api-tokens
3. Create a new API token
4. Copy the token and replace `your-replicate-api-token` in the MCP settings

![image](https://github.com/user-attachments/assets/583afa78-1a08-4eb5-9a37-decb95bd50c4)

### Environment Variables

- `REPLICATE_API_TOKEN` (required): Your Replicate API token for authentication
- `MODEL` (optional): The Replicate model to use for image generation. Defaults to "black-forest-labs/flux-schnell"

### Configuration Parameters

- `disabled`: Controls whether the server is enabled (`false`) or disabled (`true`)
- `autoApprove`: Array of tool names that can be executed without user confirmation. Empty array means all tool calls require confirmation.

## Available Tools

### generate_image

Generates images using the Flux model based on text prompts.

![image](https://github.com/user-attachments/assets/766921ce-ca8e-4d68-866d-8c7b55b2e09d)

![out-0 (1)](https://github.com/user-attachments/assets/83549b2e-525a-4ff9-825c-83ba74459575)

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

## 📜 License

This project is licensed under the MIT License.
