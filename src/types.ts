// Freshdesk API Types

export interface FreshdeskTicket {
  id: number;
  subject: string;
  description: string;
  description_text: string;
  status: number;
  priority: number;
  source: number;
  type: string | null;
  requester_id: number;
  responder_id: number | null;
  group_id: number | null;
  product_id: number | null;
  company_id: number | null;
  email: string;
  cc_emails: string[];
  fwd_emails: string[];
  reply_cc_emails: string[];
  ticket_cc_emails: string[];
  to_emails: string[] | null;
  tags: string[];
  is_escalated: boolean;
  spam: boolean;
  due_by: string;
  fr_due_by: string;
  fr_escalated: boolean;
  created_at: string;
  updated_at: string;
  custom_fields: Record<string, unknown>;
  attachments: FreshdeskAttachment[];
  stats?: FreshdeskTicketStats;
}

export interface FreshdeskAttachment {
  id: number;
  name: string;
  content_type: string;
  size: number;
  attachment_url: string;
  created_at: string;
  updated_at: string;
}

export interface FreshdeskTicketStats {
  agent_responded_at: string | null;
  requester_responded_at: string | null;
  first_responded_at: string | null;
  status_updated_at: string | null;
  reopened_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  pending_since: string | null;
}

export interface FreshdeskConversation {
  id: number;
  body: string;
  body_text: string;
  incoming: boolean;
  private: boolean;
  user_id: number;
  support_email: string | null;
  source: number;
  ticket_id: number;
  to_emails: string[];
  from_email: string;
  cc_emails: string[];
  bcc_emails: string[];
  attachments: FreshdeskAttachment[];
  created_at: string;
  updated_at: string;
}

export interface FreshdeskAgent {
  id: number;
  available: boolean;
  occasional: boolean;
  signature: string | null;
  ticket_scope: number;
  group_ids: number[];
  role_ids: number[];
  created_at: string;
  updated_at: string;
  available_since: string | null;
  type: string;
  contact: FreshdeskContact;
}

export interface FreshdeskContact {
  active: boolean;
  email: string;
  name: string;
  phone: string | null;
  mobile: string | null;
  job_title: string | null;
  language: string;
  time_zone: string;
  last_login_at: string | null;
}

export interface FreshdeskRequester {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  language: string | null;
  time_zone: string | null;
}

export interface FreshdeskTimeEntry {
  id: number;
  billable: boolean;
  note: string;
  timer_running: boolean;
  agent_id: number;
  ticket_id: number;
  time_spent: string;
  executed_at: string;
  start_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface FreshdeskSatisfactionRating {
  id: number;
  survey_id: number;
  user_id: number;
  agent_id: number;
  feedback: string | null;
  group_id: number | null;
  ticket_id: number;
  created_at: string;
  updated_at: string;
  ratings: Record<string, number>;
}

// Status mappings
export const TICKET_STATUS: Record<number, string> = {
  2: "Open",
  3: "Pending",
  4: "Resolved",
  5: "Closed",
};

export const TICKET_PRIORITY: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};

export const TICKET_SOURCE: Record<number, string> = {
  1: "Email",
  2: "Portal",
  3: "Phone",
  7: "Chat",
  9: "Feedback Widget",
  10: "Outbound Email",
};

// Full ticket context for MCP response
export interface TicketContext {
  ticket: {
    id: number;
    subject: string;
    description: string;
    status: string;
    priority: string;
    source: string;
    type: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
    due_by: string;
    is_escalated: boolean;
    custom_fields: Record<string, unknown>;
  };
  requester: {
    id: number;
    name: string;
    email: string;
  } | null;
  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;
  conversations: Array<{
    id: number;
    body: string;
    from_email: string;
    is_private: boolean;
    is_incoming: boolean;
    created_at: string;
  }>;
  attachments: Array<{
    name: string;
    size: number;
    url: string;
  }>;
  time_entries: Array<{
    note: string;
    time_spent: string;
    agent_id: number;
    created_at: string;
  }>;
  satisfaction_rating: {
    feedback: string | null;
    ratings: Record<string, number>;
  } | null;
}

// Search result summary
export interface TicketSummary {
  id: number;
  subject: string;
  status: string;
  priority: string;
  requester_email: string;
  assignee_name: string | null;
  created_at: string;
  updated_at: string;
}
