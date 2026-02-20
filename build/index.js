#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createFreshdeskClient } from "./freshdesk-client.js";
import { getTicket, getTicketSchema } from "./tools/get-ticket.js";
import { searchTickets, searchTicketsSchema } from "./tools/search-tickets.js";
import { getAgentTickets, getAgentTicketsSchema } from "./tools/get-agent-tickets.js";
// Create MCP server
const server = new McpServer({
    name: "freshdesk-mcp",
    version: "1.0.0",
});
let freshdeskClient;
// Register get_ticket tool
server.tool("get_ticket", "Fetch complete ticket details from Freshdesk including conversations, attachments, time entries, and satisfaction ratings. Accepts a ticket URL or ID.", getTicketSchema, async (params) => {
    try {
        const result = await getTicket(freshdeskClient, params);
        return {
            content: [
                {
                    type: "text",
                    text: result.formatted,
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching ticket: ${message}`,
                },
            ],
            isError: true,
        };
    }
});
// Register search_tickets tool
server.tool("search_tickets", "Search Freshdesk tickets by text query. Can filter by status and priority.", searchTicketsSchema, async (params) => {
    try {
        const result = await searchTickets(freshdeskClient, params);
        return {
            content: [
                {
                    type: "text",
                    text: result.formatted,
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            content: [
                {
                    type: "text",
                    text: `Error searching tickets: ${message}`,
                },
            ],
            isError: true,
        };
    }
});
// Register get_agent_tickets tool
server.tool("get_agent_tickets", "Get tickets assigned to a specific Freshdesk agent by name. Supports partial name matching.", getAgentTicketsSchema, async (params) => {
    try {
        const result = await getAgentTickets(freshdeskClient, params);
        return {
            content: [
                {
                    type: "text",
                    text: result.formatted,
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching agent tickets: ${message}`,
                },
            ],
            isError: true,
        };
    }
});
// Main entry point
async function main() {
    // Initialize Freshdesk client (validates env vars)
    try {
        freshdeskClient = createFreshdeskClient();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Failed to initialize Freshdesk client: ${message}`);
        process.exit(1);
    }
    // Create stdio transport
    const transport = new StdioServerTransport();
    // Connect server to transport
    await server.connect(transport);
    console.error("Freshdesk MCP Server started successfully");
    console.error(`Domain: ${process.env.FRESHDESK_DOMAIN}.freshdesk.com`);
}
// Handle errors
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map