import { z } from "zod";
import { FreshdeskClient } from "../freshdesk-client.js";
import { TicketSummary } from "../types.js";
export declare const searchTicketsSchema: {
    query: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        open: "open";
        pending: "pending";
        resolved: "resolved";
        closed: "closed";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        urgent: "urgent";
    }>>;
    limit: z.ZodOptional<z.ZodNumber>;
};
export interface SearchTicketsParams {
    query: string;
    status?: string;
    priority?: string;
    limit?: number;
}
export declare function searchTickets(client: FreshdeskClient, params: SearchTicketsParams): Promise<{
    tickets: TicketSummary[];
    formatted: string;
}>;
