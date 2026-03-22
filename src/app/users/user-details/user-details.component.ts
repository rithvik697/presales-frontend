import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  empId!: string;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    this.empId = this.route.snapshot.paramMap.get('id')!;

    this.http.get(`${environment.apiUrl}/users/${this.empId}`)
      .subscribe((res: any) => {
        this.user = res.data;
      });

  }

}