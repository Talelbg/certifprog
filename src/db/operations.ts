/**
 * Database Operations for Hedera Community Platform (HCP)
 * 
 * This file provides database CRUD operations with multi-tenant access control
 * and audit logging as per the Technical Specifications.
 */

import {
    COLLECTION_KEYS,
    AuditLogSchema,
    DeveloperRecord,
    DatasetVersion,
    Invoice,
    CommunityAgreement,
    CommunityEvent,
    OutreachCampaign,
    AdminUser,
    CommunityMasterRecord,
} from './schema';
import { MOCK_ADMIN_TEAM } from '../constants';

// ============================================================================
// GENERIC STORAGE OPERATIONS
// ============================================================================

/**
 * Generic save operation to local storage
 */
function saveToStorage<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Database: Error saving to ${key}`, e);
        throw new Error(`Storage quota exceeded or unavailable for ${key}`);
    }
}

/**
 * Generic load operation from local storage
 */
function loadFromStorage<T>(key: string, fallback: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Database: Error loading from ${key}`, e);
        return fallback;
    }
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Create an audit log entry
 */
function createAuditLog(log: Omit<AuditLogSchema, 'id' | 'timestamp'>): void {
    const logs = loadFromStorage<AuditLogSchema[]>(COLLECTION_KEYS.AUDIT_LOGS, []);
    
    const newLog: AuditLogSchema = {
        ...log,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
    };
    
    // Keep last 1000 logs to prevent storage overflow
    const updatedLogs = [newLog, ...logs].slice(0, 1000);
    saveToStorage(COLLECTION_KEYS.AUDIT_LOGS, updatedLogs);
}

/**
 * Get audit logs with optional filtering
 */
export function getAuditLogs(filters?: {
    userId?: string;
    entityType?: AuditLogSchema['entityType'];
    action?: AuditLogSchema['action'];
    partnerCode?: string;
    startDate?: Date;
    endDate?: Date;
}): AuditLogSchema[] {
    let logs = loadFromStorage<AuditLogSchema[]>(COLLECTION_KEYS.AUDIT_LOGS, []);
    
    if (filters) {
        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.entityType) {
            logs = logs.filter(l => l.entityType === filters.entityType);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action === filters.action);
        }
        if (filters.partnerCode) {
            logs = logs.filter(l => l.partnerCode === filters.partnerCode);
        }
        if (filters.startDate) {
            logs = logs.filter(l => new Date(l.timestamp) >= filters.startDate!);
        }
        if (filters.endDate) {
            logs = logs.filter(l => new Date(l.timestamp) <= filters.endDate!);
        }
    }
    
    return logs;
}

// ============================================================================
// DATASET VERSION OPERATIONS
// ============================================================================

export const DatasetVersions = {
    /**
     * Save a new dataset version
     */
    save(version: DatasetVersion, userId: string = 'system'): void {
        const current = this.getAll();
        const updated = [version, ...current];
        
        // Limit to last 5 versions to prevent storage overflow
        if (updated.length > 5) {
            updated.pop();
        }
        
        saveToStorage(COLLECTION_KEYS.VERSIONS, updated);
        
        createAuditLog({
            userId,
            userEmail: 'system',
            action: 'UPLOAD',
            entityType: 'developer',
            entityId: version.id,
            details: `Uploaded dataset: ${version.fileName} with ${version.recordCount} records`,
        });
    },
    
    /**
     * Get all dataset versions
     */
    getAll(): DatasetVersion[] {
        return loadFromStorage<DatasetVersion[]>(COLLECTION_KEYS.VERSIONS, []);
    },
    
    /**
     * Get a specific dataset version by ID
     */
    getById(id: string): DatasetVersion | undefined {
        return this.getAll().find(v => v.id === id);
    },
    
    /**
     * Delete a dataset version
     */
    delete(id: string, userId: string = 'system'): void {
        const current = this.getAll();
        const version = current.find(v => v.id === id);
        const updated = current.filter(v => v.id !== id);
        saveToStorage(COLLECTION_KEYS.VERSIONS, updated);
        
        if (version) {
            createAuditLog({
                userId,
                userEmail: 'system',
                action: 'DELETE',
                entityType: 'developer',
                entityId: id,
                details: `Deleted dataset: ${version.fileName}`,
            });
        }
    },
};

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

export const Invoices = {
    /**
     * Save/update invoices
     */
    save(invoices: Invoice[]): void {
        saveToStorage(COLLECTION_KEYS.INVOICES, invoices);
    },
    
    /**
     * Get all invoices, optionally filtered by partner code
     */
    getAll(partnerCode?: string): Invoice[] {
        const invoices = loadFromStorage<Invoice[]>(COLLECTION_KEYS.INVOICES, []);
        if (partnerCode) {
            return invoices.filter(i => i.partnerCode === partnerCode);
        }
        return invoices;
    },
    
    /**
     * Get a specific invoice by ID
     */
    getById(id: string): Invoice | undefined {
        return this.getAll().find(i => i.id === id);
    },
    
    /**
     * Create a new invoice
     */
    create(invoice: Invoice, userId: string = 'system'): void {
        const invoices = this.getAll();
        invoices.unshift(invoice);
        this.save(invoices);
        
        createAuditLog({
            userId,
            userEmail: 'system',
            action: 'INVOICE_CREATED',
            entityType: 'invoice',
            entityId: invoice.id,
            details: `Created invoice ${invoice.invoiceNumber} for ${invoice.partnerCode}`,
            partnerCode: invoice.partnerCode,
        });
    },
    
    /**
     * Update an invoice
     */
    update(id: string, updates: Partial<Invoice>, userId: string = 'system'): void {
        const invoices = this.getAll();
        const index = invoices.findIndex(i => i.id === id);
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...updates };
            this.save(invoices);
            
            createAuditLog({
                userId,
                userEmail: 'system',
                action: 'UPDATE',
                entityType: 'invoice',
                entityId: id,
                details: `Updated invoice ${invoices[index].invoiceNumber}`,
                partnerCode: invoices[index].partnerCode,
            });
        }
    },
};

// ============================================================================
// AGREEMENT OPERATIONS
// ============================================================================

export const Agreements = {
    /**
     * Save/update agreements
     */
    save(agreements: CommunityAgreement[]): void {
        saveToStorage(COLLECTION_KEYS.AGREEMENTS, agreements);
    },
    
    /**
     * Get all agreements, optionally filtered by partner code
     */
    getAll(partnerCode?: string): CommunityAgreement[] {
        const agreements = loadFromStorage<CommunityAgreement[]>(COLLECTION_KEYS.AGREEMENTS, []);
        if (partnerCode) {
            return agreements.filter(a => a.partnerCode === partnerCode);
        }
        return agreements;
    },
    
    /**
     * Get active agreement for a partner
     */
    getActive(partnerCode: string): CommunityAgreement | undefined {
        return this.getAll(partnerCode).find(a => a.isActive);
    },
};

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

export const Events = {
    /**
     * Save/update events
     */
    save(events: CommunityEvent[]): void {
        saveToStorage(COLLECTION_KEYS.EVENTS, events);
    },
    
    /**
     * Get all events, optionally filtered by partner code
     */
    getAll(partnerCode?: string): CommunityEvent[] {
        const events = loadFromStorage<CommunityEvent[]>(COLLECTION_KEYS.EVENTS, []);
        if (partnerCode) {
            return events.filter(e => e.partnerCode === partnerCode);
        }
        return events;
    },
    
    /**
     * Create a new event
     */
    create(event: CommunityEvent, userId: string = 'system'): void {
        const events = this.getAll();
        events.push(event);
        this.save(events);
        
        createAuditLog({
            userId,
            userEmail: 'system',
            action: 'CREATE',
            entityType: 'event',
            entityId: event.id,
            details: `Created event: ${event.title}`,
            partnerCode: event.partnerCode,
        });
    },
};

// ============================================================================
// CAMPAIGN OPERATIONS
// ============================================================================

export const Campaigns = {
    /**
     * Save/update campaigns
     */
    save(campaigns: OutreachCampaign[]): void {
        saveToStorage(COLLECTION_KEYS.CAMPAIGNS, campaigns);
    },
    
    /**
     * Get all campaigns
     */
    getAll(): OutreachCampaign[] {
        return loadFromStorage<OutreachCampaign[]>(COLLECTION_KEYS.CAMPAIGNS, []);
    },
    
    /**
     * Log an email campaign
     */
    logCampaign(campaign: OutreachCampaign, userId: string = 'system'): void {
        const campaigns = this.getAll();
        campaigns.unshift(campaign);
        this.save(campaigns);
        
        createAuditLog({
            userId,
            userEmail: 'system',
            action: 'EMAIL_SENT',
            entityType: 'campaign',
            entityId: campaign.id,
            details: `Sent campaign "${campaign.name}" to ${campaign.sentCount} recipients`,
        });
    },
};

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export const Admins = {
    /**
     * Save/update admins
     */
    save(admins: AdminUser[]): void {
        saveToStorage(COLLECTION_KEYS.ADMINS, admins);
    },
    
    /**
     * Get all admins
     */
    getAll(): AdminUser[] {
        return loadFromStorage<AdminUser[]>(COLLECTION_KEYS.ADMINS, MOCK_ADMIN_TEAM);
    },
    
    /**
     * Get admin by ID
     */
    getById(id: string): AdminUser | undefined {
        return this.getAll().find(a => a.id === id);
    },
    
    /**
     * Check if user has access to a partner code
     */
    hasAccess(userId: string, partnerCode: string): boolean {
        const admin = this.getById(userId);
        if (!admin) return false;
        
        // Super admins have access to all
        if (admin.role === 'Super Admin (HQ)') return true;
        
        // Check if partner code is in assigned codes
        return admin.assignedCodes.includes(partnerCode);
    },
};

// ============================================================================
// REGISTRY OPERATIONS
// ============================================================================

export const Registry = {
    /**
     * Save/update registry
     */
    save(registry: CommunityMasterRecord[]): void {
        saveToStorage(COLLECTION_KEYS.REGISTRY, registry);
    },
    
    /**
     * Get all registry entries
     */
    getAll(): CommunityMasterRecord[] {
        return loadFromStorage<CommunityMasterRecord[]>(COLLECTION_KEYS.REGISTRY, []);
    },
    
    /**
     * Check if a code is in the official registry
     */
    isValidCode(code: string): boolean {
        return this.getAll().some(r => r.code === code);
    },
    
    /**
     * Get registry entry by code
     */
    getByCode(code: string): CommunityMasterRecord | undefined {
        return this.getAll().find(r => r.code === code);
    },
};

// ============================================================================
// DATABASE FACADE
// ============================================================================

/**
 * Main database interface providing access to all collections
 */
export const Database = {
    versions: DatasetVersions,
    invoices: Invoices,
    agreements: Agreements,
    events: Events,
    campaigns: Campaigns,
    admins: Admins,
    registry: Registry,
    auditLogs: { get: getAuditLogs },
};

export default Database;
