import { Component, OnInit, ViewChild } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users-list-emp',
  templateUrl: './users-list-emp.component.html',
  styleUrls: ['./users-list-emp.component.css'],
})
export class UsersListEmpComponent implements OnInit {

  @ViewChild('dt') table: any;

  users: any[] = [];
  loading = true;

  constructor(
    private regService: RegistrationService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
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

          this.route.queryParams.subscribe(params => {
            const empId = params['empId'];
            const status = params['status'];
            const role = params['role'];

            if (this.table) {
              setTimeout(() => {
                this.table.clear();

                if (empId) {
                  this.table.filter(empId, 'emp_id', 'equals');
                }

                if (status) {
                  this.table.filter(status, 'emp_status', 'equals');
                }

                if (role) {
                  this.table.filter(role, 'role_id', 'equals');
                }
              });
            }
          });
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
  onStatusToggle(user: any) {

    const oldStatus = user.emp_status;
    const newStatus = oldStatus === 'Active' ? 'Inactive' : 'Active';

    // Optimistic UI update
    user.emp_status = newStatus;

    this.regService.updateStatus(user.emp_id, newStatus).subscribe({
      next: () => {
        this.toastr.success('Status updated successfully');
      },
      error: (err) => {
        console.error(err);

        // Revert UI on error
        user.emp_status = oldStatus;

        this.toastr.error('Failed to update status');
      }
    });
  }

/* ================= FULL NAME================= */
  getFullName(user: any): string {
    return [
      user.emp_first_name,
      user.emp_middle_name,
      user.emp_last_name
    ]
    .filter(name => name && name.trim() !== '')
    .join(' ');
  }

}
