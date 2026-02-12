import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
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

/* ------------------ Third Party ------------------ */
import { NgChartsModule } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';

/* ------------------ Components ------------------ */
import { UsersComponent } from './users/users.component';
import { UsersListEmpComponent } from './users/users-list-emp/users-list-emp.component';
import { UserRegistrationComponent } from './users/users-registration/user-registration.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConfigureComponent } from './configure/configure.component';
import { DatabackupsComponent } from './databackups/databackups.component';
import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { LeadCreateComponent } from './leads/lead-create/lead-create.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectRegistrationComponent } from './projects/project-registration/project-registration.component';
import { CallLogsComponent } from './call-logs/call-logs.component';

/* ------------------ Pipes ------------------ */
import { FilterByPipe } from './pipes/filter-by.pipe';

@NgModule({
  declarations: [
    LoginComponent,
    AppComponent,
    UsersComponent,
    UsersListEmpComponent,
    UserRegistrationComponent,
    DashboardComponent,
    ConfigureComponent,
    DatabackupsComponent,
    LeadsListComponent,
    LeadCreateComponent,
    ProjectListComponent,
    ProjectRegistrationComponent,
    CallLogsComponent,
    FilterByPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
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

    /* Charts & Notifications */
    NgChartsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
