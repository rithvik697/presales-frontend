import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDesktop: boolean = window.innerWidth > 768;
  selectedItem: string = '';

  username: string | null = null;
  fullName: string | null = null;
  role: string | null = null;
  showLogout: boolean = false;
  isLoginPage: boolean = false;
  isChangePasswordPage: boolean = false;
  isForgotPasswordPage: boolean = false;
  isResetPasswordPage: boolean = false;

  notifications: any[] = [];
  unreadCount: number = 0;
  showNotificationDropdown: boolean = false;

  menuItems: any[] = [];
  breadcrumbs: MenuItem[] = [];
  profileMenuItems: MenuItem[] = [];

  home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

  private routerSub!: Subscription;

  private allMenuItems: any[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: [] },
    { label: 'Leads Management', icon: 'list', route: '/leads', roles: [] },
    { label: 'Users', icon: 'people', route: '/users', roles: ['ADMIN'] },
    { label: 'Project', icon: 'assignment', route: '/projects', roles: [] },
    { label: 'Call Logs', icon: 'call', route: '/call-logs', roles: [] },
    { label: 'Audit Trail', icon: 'history', route: '/audit-trail', roles: ['ADMIN', 'SALES_MGR'] },

    {
      label: 'Configure',
      icon: 'settings',
      roles: ['ADMIN'],
      children: [
        { label: 'Add Activity', route: '/configure/add-activity' },
        { label: 'Add Source', route: '/configure/add-source' },
        { label: 'Bulk Lead Upload', route: '/configure/bulk-lead-upload' },
        { label: 'Lead Transfer', route: '/configure/lead-transfer' },
        { label: 'Lead Assigning', route: '/configure/lead-assigning' }
      ]
    },

    { label: 'Reports', icon: 'bar_chart', route: '/reports', roles: ['ADMIN', 'SALES_MGR'] }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.menuItems = this.allMenuItems;

    this.profileMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => {}
      },
      { separator: true },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {

        this.username = localStorage.getItem('username');
        this.fullName = localStorage.getItem('fullName');
        this.role = localStorage.getItem('role');

        this.menuItems = this.allMenuItems.filter(item => {
          // Empty roles array = visible to all
          if (!item.roles || item.roles.length === 0) return true;
          return item.roles.includes(this.role);
        });

        const url: string = e.urlAfterRedirects || e.url;

        this.isLoginPage = url.startsWith('/login');
        this.isChangePasswordPage = url.startsWith('/change-password');
        this.isForgotPasswordPage = url.startsWith('/forgot-password');
        this.isResetPasswordPage = url.startsWith('/reset-password');

        /* FIXED LINE */
        const found = this.allMenuItems.find((m) =>
          (m.route && url.startsWith(m.route)) ||
          (m.children && m.children.some((child: any) => child.route && url.startsWith(child.route)))
        );

        this.selectedItem = found ? found.label : '';

        this.updateBreadcrumbs(url);
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  updateBreadcrumbs(url: string): void {

    if (
      this.isLoginPage ||
      this.isChangePasswordPage ||
      this.isForgotPasswordPage ||
      this.isResetPasswordPage
    ) {
      this.breadcrumbs = [];
      return;
    }

    if (url.startsWith('/users/register')) {

      const isEdit = url.includes('id=');

      this.breadcrumbs = [
        { label: 'Users', routerLink: '/users' },
        { label: isEdit ? 'Edit User' : 'Register User' },
      ];
    }

    else if (url.startsWith('/users')) {
      this.breadcrumbs = [
        { label: 'Users', routerLink: '/users' },
      ];
    }

    else if (url.startsWith('/dashboard')) {
      this.breadcrumbs = [
        { label: 'Dashboard' },
      ];
    }

    else if (url.startsWith('/configure/add-activity')) {
      this.breadcrumbs = [
        { label: 'Configure', routerLink: '/configure' },
        { label: 'Add Activity' }
      ];
    }

    else if (url.startsWith('/configure/add-source')) {
      this.breadcrumbs = [
        { label: 'Configure', routerLink: '/configure' },
        { label: 'Add Source' }
      ];
    }

    else if (url.startsWith('/configure/bulk-lead-upload')) {
      this.breadcrumbs = [
        { label: 'Configure', routerLink: '/configure' },
        { label: 'Bulk Lead Upload' }
      ];
    }

    else if (url.startsWith('/configure/lead-assigning')) {
      this.breadcrumbs = [
        { label: 'Configure', routerLink: '/configure' },
        { label: 'Lead Assigning' }
      ];
    }

    else if (url.startsWith('/configure/lead-transfer')) {
      this.breadcrumbs = [
        { label: 'Configure', routerLink: '/configure' },
        { label: 'Lead Transfer' }
      ];
    }

    else if (url.startsWith('/configure')) {
      this.breadcrumbs = [
        { label: 'Configure' }
      ];
    }

    else {
      this.breadcrumbs = [];
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth > 768;
  }

  loadNotifications(): void {

    this.notificationService.getNotifications().subscribe(
      (data: any[]) => {

        this.notifications = data;

        this.unreadCount =
          data.filter(n => !n.is_read).length;

      },
      (error) => {
        console.error('Failed to load notifications', error);
      }
    );
  }

  toggleNotifications(): void {

    this.showNotificationDropdown =
      !this.showNotificationDropdown;

    if (this.showNotificationDropdown) {
      this.loadNotifications();
    }
  }

  markAsRead(notificationId: number): void {

    this.notificationService.markAsRead(notificationId)
      .subscribe(() => {

        const note = this.notifications.find(
          n => n.notification_id === notificationId
        );

        if (note) {
          note.is_read = 1;
        }

        this.unreadCount =
          this.notifications.filter(n => !n.is_read).length;

      }, (error) => {
        console.error('Failed to mark notification as read', error);
      });
  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    localStorage.removeItem('email');

    this.username = null;
    this.fullName = null;
    this.role = null;

    this.router.navigate(['/login']);
  }

  toggleSidebar(sidenav: MatSidenav): void {
    sidenav.toggle();
  }

  selectItem(label: string): void {
    this.selectedItem = label;
  }

}
