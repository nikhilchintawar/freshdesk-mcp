import { z } from "zod";
import { FreshdeskClient } from "../freshdesk-client.js";
import { TicketSummary } from "../types.js";
export declare const getAgentTicketsSchema: {
    agent_name: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        open: "open";
        pending: "pending";
        resolved: "resolved";
        closed: "closed";
    }>>;
    limit: z.ZodOptional<z.ZodNumber>;
};
export interface GetAgentTicketsParams {
    agent_name: string;
    status?: string;
    limit?: number;
}
export declare function getAgentTickets(client: FreshdeskClient, params: GetAgentTicketsParams): Promise<{
    agent: {
        id: number;
        name: string;
        email: string;
    } | null;
    tickets: TicketSummary[];
    formatted: string;
}>;
