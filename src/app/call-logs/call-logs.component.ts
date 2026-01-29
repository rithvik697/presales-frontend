import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CallLogsService } from '../services/call-logs.service';

export interface CallLog {
  userName: string;
  leadName: string;
  phoneNumber: string;
  callType: string;
  callStatus: string;
  callDuration: string;
  callTime: string;
  remarks: string;
}

@Component({
  selector: 'app-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.css']
})
export class CallLogsComponent implements OnInit {

  displayedColumns = [
    'userName',
    'leadName',
    'phoneNumber',
    'callType',
    'callStatus',
    'callDuration',
    'callTime',
    'remarks'
  ];

  dataSource = new MatTableDataSource<CallLog>([]);

  constructor(private callLogsService: CallLogsService) {}

  ngOnInit(): void {
    this.callLogsService.getCallLogs().subscribe({
      next: (data: CallLog[]) => {
        this.dataSource.data = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
