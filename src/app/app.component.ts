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

  private allMenuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Leads Management', icon: 'list', route: '/leads' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Project', icon: 'assignment', route: '/projects' },
    { label: 'Call Logs', icon: 'call', route: '/call-logs' },
    { label: 'Audit Trail', icon: 'history', route: '/audit-trail' },
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.menuItems = this.allMenuItems;

    // Initialize profile menu items
    this.profileMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        // TODO: Implement settings page
        command: () => {}
      },
      {
        separator: true
      },
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

        // Restore Reports menu logic
        this.menuItems = [...this.allMenuItems];
        if (this.role === 'ADMIN' || this.role === 'Sales Manager') {
          this.menuItems.push({ label: 'Reports', icon: 'bar_chart', route: '/reports' });
        }

        const url: string = e.urlAfterRedirects || e.url;

        this.isLoginPage = url.startsWith('/login');
        this.isChangePasswordPage = url.startsWith('/change-password');
        this.isForgotPasswordPage = url.startsWith('/forgot-password');
        this.isResetPasswordPage = url.startsWith('/reset-password');

        const found = this.allMenuItems.find((m) =>
          url.startsWith(m.route)
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

    else {
      this.breadcrumbs = [];
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth > 768;
  }

  markAllAsRead(): void {
    this.unreadCount = 0;

    this.notifications = this.notifications.map((n) => ({
      ...n,
      is_read: true,
    }));
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(
      (data: any[]) => {
        this.notifications = data;

        this.unreadCount = data.filter(n => !n.is_read).length;
      },
      (error) => {
        console.error('Failed to load notifications', error);
      }
    );
  }

  toggleNotifications(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;

    if (this.showNotificationDropdown) {
      this.loadNotifications();
    }
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');

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