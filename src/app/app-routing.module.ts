import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UsersComponent } from './users/users.component';
import { UsersListEmpComponent } from './users/users-list-emp/users-list-emp.component';
import { UserRegistrationComponent } from './users/users-registration/user-registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { DatabackupsComponent } from './databackups/databackups.component';
import { ConfigureComponent } from './configure/configure.component';
import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { LeadCreateComponent } from './leads/lead-create/lead-create.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectRegistrationComponent } from './projects/project-registration/project-registration.component';
import { CallLogsComponent } from './call-logs/call-logs.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'users',
    component: UsersComponent,
    children: [
      { path: '', component: UsersListEmpComponent },          // default
      { path: 'register', component: UserRegistrationComponent }
    ]
  },
  { path: 'datbackups', component: DatabackupsComponent },
  { path: 'configure', component: ConfigureComponent },
  { path: 'leads', component: LeadsListComponent },
  { path: 'leads/create', component: LeadCreateComponent },
  { path: 'leads/edit/:id', component: LeadCreateComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'projects/register', component: ProjectRegistrationComponent },
  { path: 'call-logs', component: CallLogsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
