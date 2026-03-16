import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* ------------------ Angular Material ------------------ */
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/* ------------------ PrimeNG ------------------ */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CarouselModule } from 'primeng/carousel';
import { TimelineModule } from 'primeng/timeline';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { PanelModule } from 'primeng/panel';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

/* ------------------ Third Party ------------------ */
import { NgChartsModule } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';

/* ------------------ Components ------------------ */
import { UsersComponent } from './users/users.component';
import { UsersListEmpComponent } from './users/users-list-emp/users-list-emp.component';
import { UserRegistrationComponent } from './users/users-registration/user-registration.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';

import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ConfigureComponent } from './configure/configure.component';
import { DatabackupsComponent } from './databackups/databackups.component';

import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { LeadCreateComponent } from './leads/lead-create/lead-create.component';
import { LeadDetailsComponent } from './leads/lead-details/lead-details.component';

import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectRegistrationComponent } from './projects/project-registration/project-registration.component';
import { ProjectDetailsComponent } from './projects/project-details/project-details.component';

import { CallLogsComponent } from './call-logs/call-logs.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportsComponent } from './reports/reports.component';

import { AuditTrailComponent } from './audit-trail/audit-trail.component';

/* ------------------ Pipes ------------------ */
import { FilterByPipe } from './pipes/filter-by.pipe';

/* ------------------ Interceptors ------------------ */
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AddActivityComponent } from './configure/add-activity/add-activity.component';
import { AddSourceComponent } from './configure/add-source/add-source.component';
import { ProjectAssignmentComponent } from './configure/project-assignment/project-assignment.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,

    UsersComponent,
    UsersListEmpComponent,
    UserRegistrationComponent,
    UserDetailsComponent,

    DashboardComponent,
    ConfigureComponent,
    AddActivityComponent,
    AddSourceComponent,
    ProjectAssignmentComponent,
    DatabackupsComponent,

    LeadsListComponent,
    LeadDetailsComponent,
    LeadCreateComponent,

    ProjectListComponent,
    ProjectRegistrationComponent,
    ProjectDetailsComponent,

    CallLogsComponent,
    ProfileComponent,
    ReportsComponent,
    AuditTrailComponent,

    ForgotPasswordComponent,
    ResetPasswordComponent,

    FilterByPipe
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    /* Angular Material */
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,

    /* PrimeNG */
    TableModule,
    ButtonModule,
    PasswordModule,
    TagModule,
    ToolbarModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    FileUploadModule,
    TabViewModule,
    CardModule,
    InputTextareaModule,
    CarouselModule,
    TimelineModule,
    DialogModule,
    InputNumberModule,
    PanelModule,
    BreadcrumbModule,
    MenuModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,

    /* Charts & Notifications */
    NgChartsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    })
  ],

  providers: [
    MessageService,
    ConfirmationService,

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
