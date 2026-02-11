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
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /* ================= LOAD USERS ================= */
  loadUsers() {
    this.regService.getUsers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users = res.data;
        } else {
          this.toastr.error('Failed to fetch users');
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Error fetching users');
        this.loading = false;
      },
    });
  }

  /* ================= NAVIGATION ================= */
  addUser() {
    this.router.navigate(['users/register']);
  }

  editUser(empId: string) {
    this.router.navigate(['users/register'], {
      queryParams: { id: empId }
    });
  }

  /* ================= STATUS TOGGLE ================= */
  toggleUserStatus(user: any) {

    const oldStatus = user.emp_status;
    const newStatus = oldStatus === 'Active' ? 'Inactive' : 'Active';

    user.emp_status = newStatus; // Optimistic UI

    this.regService.updateUserStatus(user.emp_id, newStatus).subscribe({
      next: (res: any) => {

        console.log("Status API Response:", res);

        // Accept any positive response
        if (res && (res.success === true || res.message)) {
          this.toastr.success(`User marked as ${newStatus}`);
        } else {
          user.emp_status = oldStatus;
          this.toastr.error('Failed to update status');
        }
      },
      error: (err: any) => {
        console.error(err);
        user.emp_status = oldStatus;
        this.toastr.error('Error updating status');
      }
    });
  }

}
