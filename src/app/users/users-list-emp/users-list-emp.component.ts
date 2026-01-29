// users-list-emp.component.ts
import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-list-emp',
  templateUrl: './users-list-emp.component.html',
  styleUrls: ['./users-list-emp.component.css'],
})
export class UsersListEmpComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(
    private regService: RegistrationService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.regService.getUsers().subscribe({
      next: (res: any) => {
        if (res.success) this.users = res.data;
        else this.toastr.error('Failed to fetch users');
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Error fetching users');
        this.loading = false;
      },
    });
  }

  addUser() {
    this.router.navigate(['users/register']);
  }
}
