import { 
    DeveloperRecord, 
    Invoice, 
    CommunityAgreement, 
    CommunityEvent, 
    OutreachCampaign, 
    AdminUser, 
    CommunityMasterRecord 
} from '../types';

const API_BASE = '/.netlify/functions/api';

class ApiService {
    
    // --- PRIVATE REQUEST HELPER ---
    private async request<T>(method: string, type: string, body?: unknown): Promise<T> {
        const token = localStorage.getItem('token');
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options: RequestInit = {
            method,
            headers,
        };
        
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE}?type=${type}`, options);
        
        if (response.status === 401) {
            window.location.href = '/';
            throw new Error('Unauthorized');
        }
        
        return response.json() as Promise<T>;
    }

    // --- DEVELOPERS ---
    async getDevelopers(): Promise<DeveloperRecord[]> {
        try {
            return await this.request<DeveloperRecord[]>('GET', 'developers');
        } catch (e) {
            console.error("ApiService: Failed to get developers", e);
            return [];
        }
    }

    async saveDevelopers(data: DeveloperRecord[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'developers', { type: 'developers', data });
        } catch (e) {
            console.error("ApiService: Failed to save developers", e);
        }
    }

    // --- ADMINS ---
    async getAdmins(): Promise<AdminUser[]> {
        try {
            return await this.request<AdminUser[]>('GET', 'admins');
        } catch (e) {
            console.error("ApiService: Failed to get admins", e);
            return [];
        }
    }

    async saveAdmins(admins: AdminUser[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'admins', { type: 'admins', data: admins });
        } catch (e) {
            console.error("ApiService: Failed to save admins", e);
        }
    }

    // --- INVOICES ---
    async getInvoices(): Promise<Invoice[]> {
        try {
            return await this.request<Invoice[]>('GET', 'invoices');
        } catch (e) {
            console.error("ApiService: Failed to get invoices", e);
            return [];
        }
    }

    async saveInvoices(invoices: Invoice[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'invoices', { type: 'invoices', data: invoices });
        } catch (e) {
            console.error("ApiService: Failed to save invoices", e);
        }
    }

    // --- AGREEMENTS ---
    async getAgreements(): Promise<CommunityAgreement[]> {
        try {
            return await this.request<CommunityAgreement[]>('GET', 'agreements');
        } catch (e) {
            console.error("ApiService: Failed to get agreements", e);
            return [];
        }
    }

    async saveAgreements(agreements: CommunityAgreement[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'agreements', { type: 'agreements', data: agreements });
        } catch (e) {
            console.error("ApiService: Failed to save agreements", e);
        }
    }

    // --- EVENTS ---
    async getEvents(): Promise<CommunityEvent[]> {
        try {
            return await this.request<CommunityEvent[]>('GET', 'events');
        } catch (e) {
            console.error("ApiService: Failed to get events", e);
            return [];
        }
    }

    async saveEvents(events: CommunityEvent[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'events', { type: 'events', data: events });
        } catch (e) {
            console.error("ApiService: Failed to save events", e);
        }
    }

    // --- CAMPAIGNS ---
    async getCampaigns(): Promise<OutreachCampaign[]> {
        try {
            return await this.request<OutreachCampaign[]>('GET', 'campaigns');
        } catch (e) {
            console.error("ApiService: Failed to get campaigns", e);
            return [];
        }
    }

    async saveCampaigns(campaigns: OutreachCampaign[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'campaigns', { type: 'campaigns', data: campaigns });
        } catch (e) {
            console.error("ApiService: Failed to save campaigns", e);
        }
    }

    // --- MASTER REGISTRY ---
    async getMasterRegistry(): Promise<CommunityMasterRecord[]> {
        try {
            return await this.request<CommunityMasterRecord[]>('GET', 'registry');
        } catch (e) {
            console.error("ApiService: Failed to get registry", e);
            return [];
        }
    }

    async saveMasterRegistry(registry: CommunityMasterRecord[]): Promise<void> {
        try {
            await this.request<unknown>('POST', 'registry', { type: 'registry', data: registry });
        } catch (e) {
            console.error("ApiService: Failed to save registry", e);
        }
    }
}

export const LocalDB = new ApiService();
