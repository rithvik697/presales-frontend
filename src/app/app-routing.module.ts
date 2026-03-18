import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

import { UsersComponent } from './users/users.component';
import { UsersListEmpComponent } from './users/users-list-emp/users-list-emp.component';
import { UserRegistrationComponent } from './users/users-registration/user-registration.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';

import { DatabackupsComponent } from './databackups/databackups.component';

import { ConfigureComponent } from './configure/configure.component';
import { AddActivityComponent } from './configure/add-activity/add-activity.component';
import { AddSourceComponent } from './configure/add-source/add-source.component';
import { ProjectAssignmentComponent } from './configure/project-assignment/project-assignment.component';
import { LeadTransferComponent } from './configure/lead-transfer/lead-transfer.component';

import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { LeadCreateComponent } from './leads/lead-create/lead-create.component';
import { LeadDetailsComponent } from './leads/lead-details/lead-details.component';

import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectRegistrationComponent } from './projects/project-registration/project-registration.component';
import { ProjectDetailsComponent } from './projects/project-details/project-details.component';

import { CallLogsComponent } from './call-logs/call-logs.component';

import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { ReportsComponent } from './reports/reports.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [

  // ================= PUBLIC ROUTES =================
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ================= PROTECTED ROUTES =================
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [

      // DASHBOARD
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },

      // USERS MODULE (ADMIN only)
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['ADMIN'] },
        children: [
          { path: '', component: UsersListEmpComponent },
          { path: 'register', component: UserRegistrationComponent },
          { path: ':id', component: UserDetailsComponent }
        ]
      },

      // DATA BACKUPS
      { path: 'databackups', component: DatabackupsComponent },

      // CONFIGURE MODULE (ADMIN only)
      {
        path: 'configure',
        component: ConfigureComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['ADMIN'] },
        children: [
          { path: 'add-activity', component: AddActivityComponent },
          { path: 'add-source', component: AddSourceComponent },
          { path: 'lead-transfer', component: LeadTransferComponent },
          { path: 'lead-assigning', component: ProjectAssignmentComponent },
          { path: '', redirectTo: 'add-activity', pathMatch: 'full' }
        ]
      },

      // LEADS
      { path: 'leads', component: LeadsListComponent },
      { path: 'leads/create', component: LeadCreateComponent },
      { path: 'leads/edit/:id', component: LeadCreateComponent },
      { path: 'leads/details/:id', component: LeadDetailsComponent },

      // PROJECTS
      { path: 'projects', component: ProjectListComponent },
      { path: 'projects/register', component: ProjectRegistrationComponent },
      { path: 'projects/edit/:id', component: ProjectRegistrationComponent },
      { path: 'projects/:id', component: ProjectDetailsComponent },

      // CALL LOGS
      { path: 'call-logs', component: CallLogsComponent },

      // AUDIT TRAIL (ADMIN, SALES_MGR)
      {
        path: 'audit-trail',
        component: AuditTrailComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['ADMIN', 'SALES_MGR'] }
      },

      // REPORTS (ADMIN, SALES_MGR)
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: ['ADMIN', 'SALES_MGR'] }
      }

    ]
  },

  // ================= FALLBACK =================
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
