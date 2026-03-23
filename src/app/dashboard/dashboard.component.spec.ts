import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { LeadsService } from '../services/leads.service';
import { RegistrationService } from '../services/registration.service';
import { ReportsService } from '../services/reports.service';
import { CallLogsService } from '../services/call-logs.service';
import { Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [FormsModule],
      providers: [
        { provide: LeadsService, useValue: { getAll: () => of([]), getStatuses: () => of([]) } },
        { provide: RegistrationService, useValue: { getUsers: () => of({ data: [] }) } },
        { provide: ReportsService, useValue: { getSummary: () => of({ success: true, data: {} }) } },
        { provide: CallLogsService, useValue: { getRawCallLogs: () => of([]) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
