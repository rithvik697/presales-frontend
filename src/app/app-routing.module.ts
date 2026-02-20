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
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent,
    canActivate: [AuthGuard]
   },
  {
    path: 'users',
    component: UsersComponent,
    children: [
      { path: '', component: UsersListEmpComponent },          // default
      { path: 'register', component: UserRegistrationComponent }
    ],canActivate: [AuthGuard]
  },
  { path: 'datbackups', component: DatabackupsComponent,
    canActivate: [AuthGuard]
   },
  { path: 'configure', component: ConfigureComponent
    ,canActivate: [AuthGuard]
   },
  { path: 'leads', component: LeadsListComponent,
    canActivate: [AuthGuard]
   },
  { path: 'leads/create', component: LeadCreateComponent
    ,canActivate: [AuthGuard]
   },
  {path: 'projects', component: ProjectListComponent
    ,canActivate: [AuthGuard]
  },
  { path: 'projects/register', component: ProjectRegistrationComponent,
    canActivate: [AuthGuard]
   },
  { path: 'call-logs', component: CallLogsComponent,canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
