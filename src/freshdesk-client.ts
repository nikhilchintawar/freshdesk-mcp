import {
  FreshdeskTicket,
  FreshdeskConversation,
  FreshdeskAgent,
  FreshdeskTimeEntry,
  FreshdeskSatisfactionRating,
  FreshdeskRequester,
  TicketContext,
  TicketSummary,
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_SOURCE,
} from "./types.js";

export class FreshdeskClient {
  private baseUrl: string;
  private authHeader: string;
  private agentCache: Map<number, FreshdeskAgent> = new Map();
  private agentListCache: FreshdeskAgent[] | null = null;
  private agentCacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(domain: string, apiKey: string) {
    this.baseUrl = `https://${domain}.freshdesk.com/api/v2`;
    this.authHeader = `Basic ${Buffer.from(`${apiKey}:X`).toString("base64")}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freshdesk API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Extract ticket ID from a Freshdesk URL or return the ID if already numeric
   */
  parseTicketId(ticketInput: string): number {
    // If it's already a number, return it
    const numericId = parseInt(ticketInput, 10);
    if (!isNaN(numericId) && numericId.toString() === ticketInput.trim()) {
      return numericId;
    }

    // Try to extract from URL patterns:
    // https://domain.freshdesk.com/a/tickets/12345
    // https://domain.freshdesk.com/helpdesk/tickets/12345
    const urlPatterns = [
      /\/a\/tickets\/(\d+)/,
      /\/helpdesk\/tickets\/(\d+)/,
      /\/tickets\/(\d+)/,
    ];

    for (const pattern of urlPatterns) {
      const match = ticketInput.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    throw new Error(
      `Invalid ticket input: "${ticketInput}". Provide a ticket ID or Freshdesk URL.`
    );
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: number): Promise<FreshdeskTicket> {
    return this.request<FreshdeskTicket>(`/tickets/${ticketId}?include=stats`);
  }

  /**
   * Get all conversations for a ticket
   */
  async getConversations(ticketId: number): Promise<FreshdeskConversation[]> {
    return this.request<FreshdeskConversation[]>(`/tickets/${ticketId}/conversations`);
  }

  /**
   * Get time entries for a ticket
   */
  async getTimeEntries(ticketId: number): Promise<FreshdeskTimeEntry[]> {
    try {
      return await this.request<FreshdeskTimeEntry[]>(`/tickets/${ticketId}/time_entries`);
    } catch {
      // Time entries might not be available on all plans
      return [];
    }
  }

  /**
   * Get satisfaction rating for a ticket
   */
  async getSatisfactionRating(ticketId: number): Promise<FreshdeskSatisfactionRating | null> {
    try {
      const ratings = await this.request<FreshdeskSatisfactionRating[]>(
        `/tickets/${ticketId}/satisfaction_ratings`
      );
      return ratings.length > 0 ? ratings[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get requester details
   */
  async getRequester(requesterId: number): Promise<FreshdeskRequester | null> {
    try {
      return await this.request<FreshdeskRequester>(`/contacts/${requesterId}`);
    } catch {
      return null;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: number): Promise<FreshdeskAgent | null> {
    // Check cache first
    if (this.agentCache.has(agentId)) {
      return this.agentCache.get(agentId)!;
    }

    try {
      const agent = await this.request<FreshdeskAgent>(`/agents/${agentId}`);
      this.agentCache.set(agentId, agent);
      return agent;
    } catch {
      return null;
    }
  }

  /**
   * Get all agents (with caching)
   */
  async getAllAgents(): Promise<FreshdeskAgent[]> {
    const now = Date.now();
    if (this.agentListCache && now < this.agentCacheExpiry) {
      return this.agentListCache;
    }

    const agents = await this.request<FreshdeskAgent[]>("/agents");
    this.agentListCache = agents;
    this.agentCacheExpiry = now + this.CACHE_TTL;

    // Update individual cache too
    for (const agent of agents) {
      this.agentCache.set(agent.id, agent);
    }

    return agents;
  }

  /**
   * Find agent by name (case-insensitive partial match)
   */
  async findAgentByName(name: string): Promise<FreshdeskAgent | null> {
    const agents = await this.getAllAgents();
    const searchName = name.toLowerCase();

    // Exact match first
    let agent = agents.find(
      (a) => a.contact.name.toLowerCase() === searchName
    );

    // Partial match if no exact match
    if (!agent) {
      agent = agents.find((a) =>
        a.contact.name.toLowerCase().includes(searchName)
      );
    }

    return agent || null;
  }

  /**
   * Search tickets with query
   */
  async searchTickets(
    query: string,
    options: { status?: number; priority?: number; page?: number } = {}
  ): Promise<FreshdeskTicket[]> {
    let searchQuery = `"${query}"`;

    // Build filter conditions
    const conditions: string[] = [];
    if (options.status) {
      conditions.push(`status:${options.status}`);
    }
    if (options.priority) {
      conditions.push(`priority:${options.priority}`);
    }

    if (conditions.length > 0) {
      searchQuery = `(${searchQuery}) AND ${conditions.join(" AND ")}`;
    }

    const page = options.page || 1;
    const encodedQuery = encodeURIComponent(searchQuery);

    const response = await this.request<{ results: FreshdeskTicket[]; total: number }>(
      `/search/tickets?query=${encodedQuery}&page=${page}`
    );

    return response.results;
  }

  /**
   * Get tickets assigned to a specific agent
   */
  async getAgentTickets(
    agentId: number,
    options: { status?: number; page?: number; perPage?: number } = {}
  ): Promise<FreshdeskTicket[]> {
    const params = new URLSearchParams();
    params.set("order_by", "updated_at");
    params.set("order_type", "desc");

    if (options.page) {
      params.set("page", options.page.toString());
    }
    if (options.perPage) {
      params.set("per_page", Math.min(options.perPage, 100).toString());
    }

    // Freshdesk doesn't support direct responder_id filter, so we fetch and filter
    let tickets = await this.request<FreshdeskTicket[]>(`/tickets?${params.toString()}`);

    // Filter by responder_id (agent)
    tickets = tickets.filter((t) => t.responder_id === agentId);

    // Filter by status if specified
    if (options.status) {
      tickets = tickets.filter((t) => t.status === options.status);
    }

    return tickets;
  }

  /**
   * Get full ticket context including all related data
   */
  async getTicketContext(ticketInput: string): Promise<TicketContext> {
    const ticketId = this.parseTicketId(ticketInput);

    // Fetch ticket and related data in parallel
    const [ticket, conversations, timeEntries, satisfactionRating] = await Promise.all([
      this.getTicket(ticketId),
      this.getConversations(ticketId),
      this.getTimeEntries(ticketId),
      this.getSatisfactionRating(ticketId),
    ]);

    // Fetch requester and assignee details
    const [requester, assignee] = await Promise.all([
      this.getRequester(ticket.requester_id),
      ticket.responder_id ? this.getAgent(ticket.responder_id) : null,
    ]);

    return {
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description_text || ticket.description,
        status: TICKET_STATUS[ticket.status] || `Unknown (${ticket.status})`,
        priority: TICKET_PRIORITY[ticket.priority] || `Unknown (${ticket.priority})`,
        source: TICKET_SOURCE[ticket.source] || `Unknown (${ticket.source})`,
        type: ticket.type,
        tags: ticket.tags,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        due_by: ticket.due_by,
        is_escalated: ticket.is_escalated,
        custom_fields: ticket.custom_fields,
      },
      requester: requester
        ? {
            id: requester.id,
            name: requester.name,
            email: requester.email,
          }
        : null,
      assignee: assignee
        ? {
            id: assignee.id,
            name: assignee.contact.name,
            email: assignee.contact.email,
          }
        : null,
      conversations: conversations.map((c) => ({
        id: c.id,
        body: c.body_text || c.body,
        from_email: c.from_email,
        is_private: c.private,
        is_incoming: c.incoming,
        created_at: c.created_at,
      })),
      attachments: ticket.attachments.map((a) => ({
        name: a.name,
        size: a.size,
        url: a.attachment_url,
      })),
      time_entries: timeEntries.map((t) => ({
        note: t.note,
        time_spent: t.time_spent,
        agent_id: t.agent_id,
        created_at: t.created_at,
      })),
      satisfaction_rating: satisfactionRating
        ? {
            feedback: satisfactionRating.feedback,
            ratings: satisfactionRating.ratings,
          }
        : null,
    };
  }

  /**
   * Format ticket as summary
   */
  async formatTicketSummary(ticket: FreshdeskTicket): Promise<TicketSummary> {
    let assigneeName: string | null = null;
    if (ticket.responder_id) {
      const agent = await this.getAgent(ticket.responder_id);
      assigneeName = agent?.contact.name || null;
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      status: TICKET_STATUS[ticket.status] || `Unknown (${ticket.status})`,
      priority: TICKET_PRIORITY[ticket.priority] || `Unknown (${ticket.priority})`,
      requester_email: ticket.email,
      assignee_name: assigneeName,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
    };
  }
}

// Create singleton instance from environment
export function createFreshdeskClient(): FreshdeskClient {
  const apiKey = process.env.FRESHDESK_API_KEY;
  const domain = process.env.FRESHDESK_DOMAIN;

  if (!apiKey) {
    throw new Error(
      "FRESHDESK_API_KEY environment variable is required. " +
        "Set it in your MCP server configuration."
    );
  }

  if (!domain) {
    throw new Error(
      "FRESHDESK_DOMAIN environment variable is required. " +
        "Set it to your Freshdesk subdomain (e.g., 'mycompany' for mycompany.freshdesk.com)."
    );
  }

  return new FreshdeskClient(domain, apiKey);
}
