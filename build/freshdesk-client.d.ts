import { FreshdeskTicket, FreshdeskConversation, FreshdeskAgent, FreshdeskTimeEntry, FreshdeskSatisfactionRating, FreshdeskRequester, TicketContext, TicketSummary } from "./types.js";
export declare class FreshdeskClient {
    private baseUrl;
    private authHeader;
    private agentCache;
    private agentListCache;
    private agentCacheExpiry;
    private readonly CACHE_TTL;
    constructor(domain: string, apiKey: string);
    private request;
    /**
     * Extract ticket ID from a Freshdesk URL or return the ID if already numeric
     */
    parseTicketId(ticketInput: string): number;
    /**
     * Get ticket by ID
     */
    getTicket(ticketId: number): Promise<FreshdeskTicket>;
    /**
     * Get all conversations for a ticket
     */
    getConversations(ticketId: number): Promise<FreshdeskConversation[]>;
    /**
     * Get time entries for a ticket
     */
    getTimeEntries(ticketId: number): Promise<FreshdeskTimeEntry[]>;
    /**
     * Get satisfaction rating for a ticket
     */
    getSatisfactionRating(ticketId: number): Promise<FreshdeskSatisfactionRating | null>;
    /**
     * Get requester details
     */
    getRequester(requesterId: number): Promise<FreshdeskRequester | null>;
    /**
     * Get agent by ID
     */
    getAgent(agentId: number): Promise<FreshdeskAgent | null>;
    /**
     * Get all agents (with caching)
     */
    getAllAgents(): Promise<FreshdeskAgent[]>;
    /**
     * Find agent by name (case-insensitive partial match)
     */
    findAgentByName(name: string): Promise<FreshdeskAgent | null>;
    /**
     * Search tickets with query
     */
    searchTickets(query: string, options?: {
        status?: number;
        priority?: number;
        page?: number;
    }): Promise<FreshdeskTicket[]>;
    /**
     * Get tickets assigned to a specific agent
     */
    getAgentTickets(agentId: number, options?: {
        status?: number;
        page?: number;
        perPage?: number;
    }): Promise<FreshdeskTicket[]>;
    /**
     * Get full ticket context including all related data
     */
    getTicketContext(ticketInput: string): Promise<TicketContext>;
    /**
     * Format ticket as summary
     */
    formatTicketSummary(ticket: FreshdeskTicket): Promise<TicketSummary>;
}
export declare function createFreshdeskClient(): FreshdeskClient;
