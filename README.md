# Freshdesk MCP Server

A Model Context Protocol (MCP) server that fetches Freshdesk ticket details and provides them as context for LLM interactions.

## Features

- **get_ticket** - Fetch complete ticket details from a Freshdesk URL or ticket ID
  - Ticket metadata (subject, status, priority, type, tags)
  - Requester and assignee information
  - All conversations (replies and private notes)
  - Attachments list
  - Time entries
  - Satisfaction ratings
  - Custom fields

- **search_tickets** - Search tickets by text query
  - Filter by status (open, pending, resolved, closed)
  - Filter by priority (low, medium, high, urgent)
  - Configurable result limit

- **get_agent_tickets** - Get tickets assigned to a specific agent
  - Search by agent name (supports partial matching)
  - Filter by status
  - Configurable result limit

## Installation

### Using npx (Recommended)

No installation required. Add directly to your config:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "freshdesk": {
      "command": "npx",
      "args": ["-y", "github:nikhilchintawar/freshdesk-mcp"],
      "env": {
        "FRESHDESK_API_KEY": "your-api-key",
        "FRESHDESK_DOMAIN": "yourcompany"
      }
    }
  }
}
```

**Claude Code** (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "freshdesk": {
      "command": "npx",
      "args": ["-y", "github:nikhilchintawar/freshdesk-mcp"],
      "env": {
        "FRESHDESK_API_KEY": "your-api-key",
        "FRESHDESK_DOMAIN": "yourcompany"
      }
    }
  }
}
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/nikhilchintawar/freshdesk-mcp.git
cd freshdesk-mcp

# Install dependencies
npm install
```

Then add to your config:

```json
{
  "mcpServers": {
    "freshdesk": {
      "command": "node",
      "args": ["/absolute/path/to/freshdesk-mcp/build/index.js"],
      "env": {
        "FRESHDESK_API_KEY": "your-api-key",
        "FRESHDESK_DOMAIN": "yourcompany"
      }
    }
  }
}
```

## Configuration

### Config File Locations

- **Claude Desktop (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows):** `%APPDATA%\Claude\claude_desktop_config.json`
- **Claude Code:** `~/.claude/settings.json`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FRESHDESK_API_KEY` | Your Freshdesk API key | Yes |
| `FRESHDESK_DOMAIN` | Your Freshdesk subdomain (e.g., `mycompany` for mycompany.freshdesk.com) | Yes |

## Usage Examples

Once configured, you can use natural language to interact with Freshdesk:

- "Get the details of ticket https://mycompany.freshdesk.com/a/tickets/12345"
- "Search for tickets about 'login issue'"
- "Show me all open tickets assigned to John"
- "Find high priority tickets related to billing"

## Getting Your Freshdesk API Key

1. Log in to your Freshdesk account
2. Click on your profile icon → Profile Settings
3. Your API key is displayed on the right side of the page

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Test with MCP Inspector
FRESHDESK_API_KEY=your-key FRESHDESK_DOMAIN=your-domain \
  npx @modelcontextprotocol/inspector node build/index.js
```

## License

MIT
