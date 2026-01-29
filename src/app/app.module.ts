import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';


import { FormsModule } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';

import { NgChartsModule } from 'ng2-charts';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { ToastrModule } from 'ngx-toastr';

import { CarouselModule } from 'primeng/carousel';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TimelineModule } from 'primeng/timeline';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';

import { PanelModule } from 'primeng/panel';
import { LOCALE_ID } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { TabViewModule } from 'primeng/tabview';
import { UsersListEmpComponent } from './users/users-list-emp/users-list-emp.component';
import { UserRegistrationComponent } from './users/users-registration/user-registration.component';
import { UsersComponent } from './users/users.component';

import { DashboardComponent } from './dashboard/dashboard.component';

import { ConfigureComponent } from './configure/configure.component';
import { DatabackupsComponent } from './databackups/databackups.component';
import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { LeadCreateComponent } from './leads/lead-create/lead-create.component';
import { FilterByPipe } from './pipes/filter-by.pipe';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectRegistrationComponent } from './projects/project-registration/project-registration.component';
import { CallLogsComponent } from './call-logs/call-logs.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    UsersListEmpComponent,
    UserRegistrationComponent,
    DashboardComponent,

    ConfigureComponent,
    DatabackupsComponent,
    LeadsListComponent,
    LeadCreateComponent,
    FilterByPipe,
    CallLogsComponent,
    ProjectListComponent,
    ProjectRegistrationComponent 
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatButtonModule, 
    MatIconModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    NgChartsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    ButtonModule,
    FileUploadModule,
    TabViewModule,
    CardModule,
    InputTextareaModule,
    CarouselModule,

    TimelineModule,
    DialogModule,
    InputNumberModule,
    PanelModule,

    ToastrModule.forRoot({
      positionClass: 'toast-top-center', // Change position here
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
