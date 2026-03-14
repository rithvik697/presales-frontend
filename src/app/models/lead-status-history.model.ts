export interface LeadStatusHistory {
    history_id: number;
    lead_id: string;
    event_type?: 'status_change' | 'assignment_change' | 'scheduled_activity' | 'comment';
    old_status_id: string | null;
    new_status_id: string | null;
    old_status_name?: string;
    new_status_name?: string;
    old_assigned_to?: string | null;
    new_assigned_to?: string | null;
    remarks?: string;
    changed_by: string;
    changed_by_name?: string;
    changed_at: string;
    scheduled_at?: string;
    schedule_status?: string;
    scheduled_status_id?: string;
    scheduled_status_name?: string;
}

export interface StatusOption {
    status_id: string;
    status_name: string;
    status_category?: string;
}
