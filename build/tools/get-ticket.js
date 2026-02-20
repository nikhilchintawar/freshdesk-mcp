import { z } from "zod";
export const getTicketSchema = {
    ticket: z
        .string()
        .describe("Freshdesk ticket URL or ticket ID. Examples: 'https://company.freshdesk.com/a/tickets/12345' or '12345'"),
};
export async function getTicket(client, params) {
    const context = await client.getTicketContext(params.ticket);
    // Format as readable text for LLM context
    const formatted = formatTicketContext(context);
    return { context, formatted };
}
function formatTicketContext(ctx) {
    const lines = [];
    lines.push("# Ticket Details");
    lines.push("");
    lines.push(`**Ticket ID:** ${ctx.ticket.id}`);
    lines.push(`**Subject:** ${ctx.ticket.subject}`);
    lines.push(`**Status:** ${ctx.ticket.status}`);
    lines.push(`**Priority:** ${ctx.ticket.priority}`);
    lines.push(`**Source:** ${ctx.ticket.source}`);
    if (ctx.ticket.type) {
        lines.push(`**Type:** ${ctx.ticket.type}`);
    }
    lines.push(`**Created:** ${ctx.ticket.created_at}`);
    lines.push(`**Updated:** ${ctx.ticket.updated_at}`);
    lines.push(`**Due By:** ${ctx.ticket.due_by}`);
    if (ctx.ticket.is_escalated) {
        lines.push(`**Escalated:** Yes`);
    }
    if (ctx.ticket.tags.length > 0) {
        lines.push(`**Tags:** ${ctx.ticket.tags.join(", ")}`);
    }
    lines.push("");
    lines.push("## Requester");
    if (ctx.requester) {
        lines.push(`- **Name:** ${ctx.requester.name}`);
        lines.push(`- **Email:** ${ctx.requester.email}`);
    }
    else {
        lines.push("- No requester information available");
    }
    lines.push("");
    lines.push("## Assignee");
    if (ctx.assignee) {
        lines.push(`- **Name:** ${ctx.assignee.name}`);
        lines.push(`- **Email:** ${ctx.assignee.email}`);
    }
    else {
        lines.push("- Unassigned");
    }
    lines.push("");
    lines.push("## Description");
    lines.push(ctx.ticket.description || "(No description)");
    if (ctx.conversations.length > 0) {
        lines.push("");
        lines.push("## Conversations");
        for (const conv of ctx.conversations) {
            lines.push("");
            lines.push(`### ${conv.is_incoming ? "Customer" : "Agent"} - ${conv.created_at}`);
            lines.push(`From: ${conv.from_email}`);
            if (conv.is_private) {
                lines.push("*(Private note)*");
            }
            lines.push("");
            lines.push(conv.body);
        }
    }
    if (ctx.attachments.length > 0) {
        lines.push("");
        lines.push("## Attachments");
        for (const att of ctx.attachments) {
            lines.push(`- ${att.name} (${formatBytes(att.size)})`);
        }
    }
    if (ctx.time_entries.length > 0) {
        lines.push("");
        lines.push("## Time Entries");
        for (const entry of ctx.time_entries) {
            lines.push(`- ${entry.time_spent} - ${entry.note || "(No note)"} (${entry.created_at})`);
        }
    }
    if (ctx.satisfaction_rating) {
        lines.push("");
        lines.push("## Satisfaction Rating");
        if (ctx.satisfaction_rating.feedback) {
            lines.push(`**Feedback:** ${ctx.satisfaction_rating.feedback}`);
        }
        const ratings = Object.entries(ctx.satisfaction_rating.ratings);
        if (ratings.length > 0) {
            for (const [key, value] of ratings) {
                lines.push(`- ${key}: ${value}`);
            }
        }
    }
    if (Object.keys(ctx.ticket.custom_fields).length > 0) {
        lines.push("");
        lines.push("## Custom Fields");
        for (const [key, value] of Object.entries(ctx.ticket.custom_fields)) {
            if (value !== null && value !== undefined && value !== "") {
                lines.push(`- **${key}:** ${value}`);
            }
        }
    }
    return lines.join("\n");
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
//# sourceMappingURL=get-ticket.js.map