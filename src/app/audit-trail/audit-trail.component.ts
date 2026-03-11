import { Component, OnInit } from '@angular/core';
import { AuditService } from '../services/audit.service';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent implements OnInit {

  auditLogs: any[] = [];

  globalFilterFields: string[] = [
    'object_name',
    'object_id',
    'property_name',
    'old_value',
    'new_value',
    'modified_by',
    'action_type'
  ];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {

    this.auditService.getAuditLogs().subscribe({
      next: (res: any) => {

        if (res.success) {
          this.auditLogs = res.data;
        }

      },
      error: (err: any) => {
        console.error('Failed to load audit logs', err);
      }
    });

  }

  // Global Search Handler
  onGlobalSearch(event: Event, table: any): void {

    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');

  }

}