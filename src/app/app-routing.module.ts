import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { UsersComponent } from './users/users.component';
import { UsersListEmpComponent } from './users/users-list-emp/users-list-emp.component';
import { UserRegistrationComponent } from './users/users-registration/user-registration.component';

import { DatabackupsComponent } from './databackups/databackups.component';
import { ConfigureComponent } from './configure/configure.component';

import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { LeadCreateComponent } from './leads/lead-create/lead-create.component';
import { LeadDetailsComponent } from './leads/lead-details/lead-details.component';

import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectRegistrationComponent } from './projects/project-registration/project-registration.component';
import { ProjectDetailsComponent } from './projects/project-details/project-details.component';

import { CallLogsComponent } from './call-logs/call-logs.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [

  // Public Route
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Protected Routes
  {
    path: '',
    canActivate: [AuthGuard],       // Protect everything below
    canActivateChild: [AuthGuard],  // Protect all children
    children: [

      { path: 'dashboard', component: DashboardComponent },

      // USERS
      {
        path: 'users',
        component: UsersComponent,
        children: [
          { path: '', component: UsersListEmpComponent },
          { path: 'register', component: UserRegistrationComponent }
        ]
      },

      // OTHER MODULES
      { path: 'datbackups', component: DatabackupsComponent },
      { path: 'configure', component: ConfigureComponent },

      // LEADS
      { path: 'leads', component: LeadsListComponent },
      { path: 'leads/create', component: LeadCreateComponent },
      { path: 'leads/edit/:id', component: LeadCreateComponent },
      { path: 'leads/details/:id', component: LeadDetailsComponent },

      // PROJECTS
      { path: 'projects', component: ProjectListComponent },
      { path: 'projects/register', component: ProjectRegistrationComponent },
      { path: 'projects/edit/:id', component: ProjectRegistrationComponent},
      { path: 'projects/:id', component: ProjectDetailsComponent },

      // CALL LOGS
      { path: 'call-logs', component: CallLogsComponent }

    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
