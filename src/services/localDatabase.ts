
import { 
    DeveloperRecord, 
    DatasetVersion, 
    Invoice, 
    CommunityAgreement, 
    CommunityEvent, 
    OutreachCampaign, 
    AdminUser, 
    CommunityMasterRecord 
} from '../types';
import { MOCK_ADMIN_TEAM } from '../constants';

// KEYS FOR LOCAL STORAGE
const KEYS = {
    VERSIONS: 'hcp_versions',
    CURRENT_VERSION: 'hcp_active_version_id',
    INVOICES: 'hcp_invoices',
    AGREEMENTS: 'hcp_agreements',
    EVENTS: 'hcp_events',
    CAMPAIGNS: 'hcp_campaigns',
    ADMINS: 'hcp_admins',
    REGISTRY: 'hcp_registry'
};

class LocalDatabaseService {
    
    // --- DATASET VERSIONING ---
    saveDatasetVersion(version: DatasetVersion): void {
        try {
            const current = this.getDatasetVersions();
            const updated = [version, ...current];
            // Limit to last 5 versions to prevent LocalStorage quota exceeded
            if (updated.length > 5) updated.pop(); 
            
            localStorage.setItem(KEYS.VERSIONS, JSON.stringify(updated));
        } catch (e) {
            console.error("LocalDB: Failed to save dataset version", e);
            alert("Storage Quota Exceeded. Older versions were removed.");
        }
    }

    getDatasetVersions(): DatasetVersion[] {
        try {
            const data = localStorage.getItem(KEYS.VERSIONS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    deleteDatasetVersion(id: string): void {
        const current = this.getDatasetVersions();
        const updated = current.filter(v => v.id !== id);
        localStorage.setItem(KEYS.VERSIONS, JSON.stringify(updated));
    }

    // --- APP STATE PERSISTENCE ---
    
    // GENERIC SAVER
    private saveItem<T>(key: string, data: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`LocalDB: Error saving ${key}`, e);
        }
    }

    // GENERIC LOADER
    private loadItem<T>(key: string, fallback: T): T {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    // --- SPECIFIC ENTITY METHODS ---

    // ADMINS
    getAdmins(): AdminUser[] {
        return this.loadItem<AdminUser[]>(KEYS.ADMINS, MOCK_ADMIN_TEAM);
    }
    saveAdmins(admins: AdminUser[]) {
        this.saveItem(KEYS.ADMINS, admins);
    }

    // INVOICES
    getInvoices(): Invoice[] {
        return this.loadItem<Invoice[]>(KEYS.INVOICES, []);
    }
    saveInvoices(invoices: Invoice[]) {
        this.saveItem(KEYS.INVOICES, invoices);
    }

    // AGREEMENTS
    getAgreements(): CommunityAgreement[] {
        return this.loadItem<CommunityAgreement[]>(KEYS.AGREEMENTS, []);
    }
    saveAgreements(agreements: CommunityAgreement[]) {
        this.saveItem(KEYS.AGREEMENTS, agreements);
    }

    // EVENTS
    getEvents(): CommunityEvent[] {
        return this.loadItem<CommunityEvent[]>(KEYS.EVENTS, []);
    }
    saveEvents(events: CommunityEvent[]) {
        this.saveItem(KEYS.EVENTS, events);
    }

    // CAMPAIGNS
    getCampaigns(): OutreachCampaign[] {
        return this.loadItem<OutreachCampaign[]>(KEYS.CAMPAIGNS, []);
    }
    saveCampaigns(campaigns: OutreachCampaign[]) {
        this.saveItem(KEYS.CAMPAIGNS, campaigns);
    }

    // MASTER REGISTRY
    getMasterRegistry(): CommunityMasterRecord[] {
        return this.loadItem<CommunityMasterRecord[]>(KEYS.REGISTRY, []);
    }
    saveMasterRegistry(registry: CommunityMasterRecord[]) {
        this.saveItem(KEYS.REGISTRY, registry);
    }
}

export const LocalDB = new LocalDatabaseService();
