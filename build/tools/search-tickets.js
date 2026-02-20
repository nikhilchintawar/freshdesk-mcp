import { z } from "zod";
export const searchTicketsSchema = {
    query: z.string().describe("Search text to find in ticket subject or description"),
    status: z
        .enum(["open", "pending", "resolved", "closed"])
        .optional()
        .describe("Filter by ticket status (optional)"),
    priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional()
        .describe("Filter by ticket priority (optional)"),
    limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of results to return (default: 30, max: 100)"),
};
const STATUS_MAP = {
    open: 2,
    pending: 3,
    resolved: 4,
    closed: 5,
};
const PRIORITY_MAP = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
};
export async function searchTickets(client, params) {
    const status = params.status ? STATUS_MAP[params.status] : undefined;
    const priority = params.priority ? PRIORITY_MAP[params.priority] : undefined;
    const limit = params.limit || 30;
    const rawTickets = await client.searchTickets(params.query, { status, priority });
    // Limit results
    const limitedTickets = rawTickets.slice(0, limit);
    // Format as summaries
    const tickets = await Promise.all(limitedTickets.map((t) => client.formatTicketSummary(t)));
    const formatted = formatSearchResults(params.query, tickets);
    return { tickets, formatted };
}
function formatSearchResults(query, tickets) {
    const lines = [];
    lines.push(`# Search Results for "${query}"`);
    lines.push("");
    lines.push(`Found ${tickets.length} ticket(s)`);
    if (tickets.length === 0) {
        lines.push("");
        lines.push("No tickets match your search criteria.");
        return lines.join("\n");
    }
    lines.push("");
    for (const ticket of tickets) {
        lines.push(`## Ticket #${ticket.id}`);
        lines.push(`**Subject:** ${ticket.subject}`);
        lines.push(`**Status:** ${ticket.status} | **Priority:** ${ticket.priority}`);
        lines.push(`**Requester:** ${ticket.requester_email}`);
        if (ticket.assignee_name) {
            lines.push(`**Assignee:** ${ticket.assignee_name}`);
        }
        lines.push(`**Created:** ${ticket.created_at} | **Updated:** ${ticket.updated_at}`);
        lines.push("");
    }
    return lines.join("\n");
}
//# sourceMappingURL=search-tickets.js.map