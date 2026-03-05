export interface LeadStatusHistory {
    history_id: number;
    lead_id: string;
    old_status_id: string | null;
    new_status_id: string;
    old_status_name?: string;
    new_status_name?: string;
    remarks?: string;
    changed_by: string;
    changed_by_name?: string;
    changed_at: string;
}

export interface StatusOption {
    status_id: string;
    status_name: string;
    status_category?: string;
}