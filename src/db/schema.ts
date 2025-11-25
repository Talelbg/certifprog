/**
 * Database Schema for Hedera Community Platform (HCP)
 * 
 * This file defines the database schema and collections structure
 * based on the Technical Specifications document.
 * 
 * Collections:
 * 1. developers - The core asset, developer certification records
 * 2. invoices - Transaction records for billing
 * 3. events - Community activities and events
 * 4. agreements - Community partner agreements
 * 5. campaigns - Outreach campaigns
 * 6. admins - Admin users with role-based access
 * 7. registry - Master community registry
 */

import {
    DeveloperRecord,
    DatasetVersion,
    Invoice,
    CommunityAgreement,
    CommunityEvent,
    OutreachCampaign,
    AdminUser,
    CommunityMasterRecord,
} from '../types';

// ============================================================================
// COLLECTION SCHEMAS
// ============================================================================

/**
 * Schema for the 'developers' collection
 * Primary asset - Developer certification records
 */
export interface DeveloperSchema {
    /** Unique identifier */
    id: string;
    /** Security Key - Defines which Partner owns this record */
    partnerCode: string;
    /** Primary user identifier */
    email: string;
    /** First name of developer */
    firstName: string;
    /** Last name of developer */
    lastName: string;
    /** Phone number */
    phone: string;
    /** Country/Region */
    country: string;
    /** Whether developer accepted membership */
    acceptedMembership: boolean;
    /** Whether developer accepts marketing */
    acceptedMarketing: boolean;
    /** Hedera wallet address - checked globally for Sybil attacks */
    walletAddress: string;
    /** Course progress percentage */
    percentageCompleted: number;
    /** Registration date (ISO timestamp) */
    createdAt: string;
    /** Completion date (ISO timestamp) - null if not completed */
    completedAt: string | null;
    /** Final assessment score */
    finalScore: number;
    /** Final grade - Pass triggers billing event */
    finalGrade: 'Pass' | 'Fail' | 'Pending';
    /** Certification Authority status */
    caStatus: string;
    /** Computed: duration in hours */
    durationHours?: number;
    /** Flag for suspicious activity */
    isSuspicious?: boolean;
    /** Reason for suspicion */
    suspicionReason?: string;
    /** Flag for data errors */
    dataError?: boolean;
}

/**
 * Schema for the 'invoices' collection
 * Transaction records between HQ and Partners
 */
export interface InvoiceSchema {
    /** Unique identifier */
    id: string;
    /** Invoice number (e.g., INV-2024-001) */
    invoiceNumber: string;
    /** Partner code for multi-tenant filtering */
    partnerCode: string;
    /** Billing period (e.g., "2024-10") */
    billingPeriod: string;
    /** Issue date (ISO date string) */
    issueDate: string;
    /** Due date (ISO date string) */
    dueDate: string;
    /** Currency for the invoice */
    currency: 'HBAR' | 'USDC' | 'USD' | 'EUR';
    /** Line items */
    items: InvoiceLineItemSchema[];
    /** Subtotal before tax */
    subtotal: number;
    /** Tax rate percentage */
    taxRate: number;
    /** Tax amount */
    taxAmount: number;
    /** Total amount due */
    totalAmount: number;
    /** Invoice status - Draft, Sent, Paid, Overdue, Void */
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';
    /** Private notes */
    notes: string;
    /** Public memo visible to client */
    publicMemo: string;
    /** Payment timestamp */
    paidAt?: string;
    /** Transaction reference (hash or bank ref) */
    transactionReference?: string;
}

export interface InvoiceLineItemSchema {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

/**
 * Schema for the 'events' collection
 * Community activities and meetups
 */
export interface EventSchema {
    /** Unique identifier */
    id: string;
    /** Event title */
    title: string;
    /** Event objective */
    objective: string;
    /** Event date */
    date: string;
    /** Start time */
    startTime?: string;
    /** End time */
    endTime?: string;
    /** Format: Online or In-Person */
    format: 'Online' | 'In-Person';
    /** Meeting link for online events */
    meetingLink?: string;
    /** Physical location or "Online" */
    location: string;
    /** Partner code for multi-tenant filtering */
    partnerCode: string;
    /** Event facilitators */
    facilitators: string[];
    /** Number invited */
    invitedCount: number;
    /** Number RSVPed */
    rsvpedCount: number;
    /** Number checked in */
    checkedInCount: number;
}

/**
 * Schema for the 'agreements' collection
 * Community partner agreements/contracts
 */
export interface AgreementSchema {
    /** Unique identifier */
    id: string;
    /** Partner code */
    partnerCode: string;
    /** Display name */
    partnerName: string;
    /** Contact person name */
    contactName: string;
    /** Contact email */
    contactEmail: string;
    /** Assigned admin user ID */
    assignedAdminId?: string;
    /** Billing address or wallet */
    billingAddress: string;
    /** VAT or tax ID */
    taxId?: string;
    /** Contract start date */
    startDate: string;
    /** Contract end date */
    endDate: string;
    /** Whether agreement is active */
    isActive: boolean;
    /** Payment model type */
    paymentModel: 'Per_Certification' | 'Fixed_Recurring';
    /** Unit price or fixed amount */
    unitPrice: number;
    /** Currency */
    currency: 'HBAR' | 'USDC' | 'USD' | 'EUR';
    /** Billing cycle */
    billingCycle: 'Monthly' | 'Bimonthly' | 'Quarterly';
    /** Preferred payment method */
    preferredMethod: 'Crypto_Wallet' | 'Bank_Transfer';
    /** Payment terms */
    paymentTerms: 'Due on Receipt' | 'Net 15' | 'Net 30';
    /** Crypto wallet address */
    walletAddress?: string;
    /** Bank details */
    bankDetails?: string;
    /** Agreement description */
    description: string;
    /** Attached documents */
    documents: string[];
    /** Last update timestamp */
    lastUpdated: string;
}

/**
 * Schema for the 'campaigns' collection
 * Email outreach campaigns
 */
export interface CampaignSchema {
    /** Unique identifier */
    id: string;
    /** Campaign name */
    name: string;
    /** Target audience size */
    audienceSize: number;
    /** Number of emails sent */
    sentCount: number;
    /** Campaign status */
    status: 'Draft' | 'Sending' | 'Completed';
    /** Sent timestamp */
    sentAt: string;
    /** Template ID used */
    templateId: string;
}

/**
 * Schema for the 'admins' collection
 * Admin users with role-based access
 */
export interface AdminSchema {
    /** Unique identifier */
    id: string;
    /** Admin name */
    name: string;
    /** Admin email */
    email: string;
    /** Role: Super Admin, Regional Admin, or Community Admin */
    role: 'Super Admin (HQ)' | 'Regional Admin (Cluster)' | 'Community Admin (Local)';
    /** Assigned partner codes for Regional/Community admins */
    assignedCodes: string[];
    /** Last login timestamp */
    lastLogin: string;
    /** Account status */
    status: 'Active' | 'Invited' | 'Disabled';
}

/**
 * Schema for the 'registry' collection
 * Master list of official communities
 */
export interface RegistrySchema {
    /** Primary key - partner code */
    code: string;
    /** Community name */
    name: string;
    /** Region (e.g., EMEA, APAC) */
    region: string;
    /** Manager email */
    managerEmail?: string;
}

// ============================================================================
// COLLECTION KEYS
// ============================================================================

/**
 * Storage keys for each collection in local storage
 */
export const COLLECTION_KEYS = {
    /** Dataset versions containing developer data */
    VERSIONS: 'hcp_versions',
    /** Active version ID */
    CURRENT_VERSION: 'hcp_active_version_id',
    /** Invoice records */
    INVOICES: 'hcp_invoices',
    /** Partner agreements */
    AGREEMENTS: 'hcp_agreements',
    /** Community events */
    EVENTS: 'hcp_events',
    /** Outreach campaigns */
    CAMPAIGNS: 'hcp_campaigns',
    /** Admin users */
    ADMINS: 'hcp_admins',
    /** Community registry */
    REGISTRY: 'hcp_registry',
    /** Audit logs */
    AUDIT_LOGS: 'hcp_audit_logs',
} as const;

// ============================================================================
// AUDIT LOG SCHEMA
// ============================================================================

/**
 * Schema for audit logs
 * Every action should be logged for compliance
 */
export interface AuditLogSchema {
    /** Unique identifier */
    id: string;
    /** User ID who performed the action */
    userId: string;
    /** User email */
    userEmail: string;
    /** Timestamp */
    timestamp: string;
    /** Action type */
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'UPLOAD' | 'EMAIL_SENT' | 'INVOICE_CREATED' | 'LOGIN';
    /** Entity type affected */
    entityType: 'developer' | 'invoice' | 'event' | 'agreement' | 'campaign' | 'admin' | 'registry';
    /** Entity ID affected */
    entityId?: string;
    /** Additional action details */
    details: string;
    /** Partner code scope */
    partnerCode?: string;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
    DeveloperRecord,
    DatasetVersion,
    Invoice,
    CommunityAgreement,
    CommunityEvent,
    OutreachCampaign,
    AdminUser,
    CommunityMasterRecord,
};
