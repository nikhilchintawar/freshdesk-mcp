import { z } from "zod";
import { FreshdeskClient } from "../freshdesk-client.js";
import { TicketContext } from "../types.js";
export declare const getTicketSchema: {
    ticket: z.ZodString;
};
export declare function getTicket(client: FreshdeskClient, params: {
    ticket: string;
}): Promise<{
    context: TicketContext;
    formatted: string;
}>;
