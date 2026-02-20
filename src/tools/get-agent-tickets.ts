import { z } from "zod";
import { FreshdeskClient } from "../freshdesk-client.js";
import { TicketSummary } from "../types.js";

export const getAgentTicketsSchema = {
  agent_name: z
    .string()
    .describe(
      "Name of the agent to find tickets for. Supports partial matching (e.g., 'John' will match 'John Doe')."
    ),
  status: z
    .enum(["open", "pending", "resolved", "closed"])
    .optional()
    .describe("Filter by ticket status (optional)"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of results to return (default: 30, max: 100)"),
};

const STATUS_MAP: Record<string, number> = {
  open: 2,
  pending: 3,
  resolved: 4,
  closed: 5,
};

export interface GetAgentTicketsParams {
  agent_name: string;
  status?: string;
  limit?: number;
}

export async function getAgentTickets(
  client: FreshdeskClient,
  params: GetAgentTicketsParams
): Promise<{
  agent: { id: number; name: string; email: string } | null;
  tickets: TicketSummary[];
  formatted: string;
}> {
  // Find the agent by name
  const agent = await client.findAgentByName(params.agent_name);

  if (!agent) {
    return {
      agent: null,
      tickets: [],
      formatted: `No agent found matching "${params.agent_name}". Please check the agent name and try again.`,
    };
  }

  const status = params.status ? STATUS_MAP[params.status] : undefined;
  const limit = params.limit || 30;

  // Get tickets assigned to this agent
  const rawTickets = await client.getAgentTickets(agent.id, {
    status,
    perPage: Math.min(limit, 100),
  });

  // Format as summaries
  const tickets: TicketSummary[] = await Promise.all(
    rawTickets.slice(0, limit).map((t) => client.formatTicketSummary(t))
  );

  const agentInfo = {
    id: agent.id,
    name: agent.contact.name,
    email: agent.contact.email,
  };

  const formatted = formatAgentTickets(agentInfo, tickets, params.status);

  return { agent: agentInfo, tickets, formatted };
}

function formatAgentTickets(
  agent: { id: number; name: string; email: string },
  tickets: TicketSummary[],
  statusFilter?: string
): string {
  const lines: string[] = [];

  lines.push(`# Tickets for ${agent.name}`);
  lines.push(`**Email:** ${agent.email}`);
  lines.push(`**Agent ID:** ${agent.id}`);
  lines.push("");

  if (statusFilter) {
    lines.push(`*Filtered by status: ${statusFilter}*`);
    lines.push("");
  }

  lines.push(`Found ${tickets.length} ticket(s)`);

  if (tickets.length === 0) {
    lines.push("");
    lines.push("No tickets assigned to this agent.");
    return lines.join("\n");
  }

  lines.push("");

  for (const ticket of tickets) {
    lines.push(`## Ticket #${ticket.id}`);
    lines.push(`**Subject:** ${ticket.subject}`);
    lines.push(`**Status:** ${ticket.status} | **Priority:** ${ticket.priority}`);
    lines.push(`**Requester:** ${ticket.requester_email}`);
    lines.push(`**Created:** ${ticket.created_at} | **Updated:** ${ticket.updated_at}`);
    lines.push("");
  }

  return lines.join("\n");
}
