import { Component, OnInit } from '@angular/core';
import { AuditService } from '../services/audit.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent implements OnInit {

  auditLogs: any[] = [];
  loading = true;

  globalFilterFields: string[] = [
    'object_name',
    'object_id',
    'property_name',
    'old_value',
    'new_value',
    'modified_by',
    'action_type'
  ];

  constructor(
    private auditService: AuditService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading = true;

    this.auditService.getAuditLogs().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.auditLogs = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load audit logs');
        this.loading = false;
      }
    });

  }

  // Global Search Handler
  onGlobalSearch(event: Event, table: any): void {

    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');

  }

}