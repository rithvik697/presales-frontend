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
import { MenuItem } from 'primeng/api'; // ✅ ADD

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
  role: string | null = null;
  showLogout: boolean = false;
  isLoginPage: boolean = false;
  isChangePasswordPage: boolean = false;

  notifications: any[] = [];
  unreadCount: number = 0;
  showNotificationDropdown: boolean = false;

  menuItems: any[] = [];
  breadcrumbs: MenuItem[] = []; // ✅ ADD

  home = { icon: 'pi pi-home', routerLink: '/' }; // ✅ ADD 

  private routerSub!: Subscription;

  private allMenuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Leads Management', icon: 'list', route: '/leads' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Project', icon: 'assignment', route: '/projects' },
    { label: 'Call Logs', icon: 'call', route: '/call-logs' },
  ];

  constructor(private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {

        this.username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payloadUrl = token.split('.')[1];
            const decodedPayload = JSON.parse(window.atob(payloadUrl));
            this.role = decodedPayload.role_type || null;
          } catch (error) {
            console.error('Error decoding token:', error);
            this.role = null;
          }
        }

        // Conditionally build menu items based on role
        this.menuItems = [...this.allMenuItems];
        if (this.role === 'ADMIN' || this.role === 'Sales Manager') {
          this.menuItems.push({ label: 'Reports', icon: 'bar_chart', route: '/reports' });
        }

        const url: string = e.urlAfterRedirects || e.url;

        this.isLoginPage = url.startsWith('/login');
        this.isChangePasswordPage = url.startsWith('/change-password');

        const found = this.menuItems.find((m) => url.startsWith(m.route));
        this.selectedItem = found ? found.label : '';

        this.updateBreadcrumbs(url);
      });
  }


  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  // ✅ BREADCRUMB LOGIC
  updateBreadcrumbs(url: string): void {
    if (this.isLoginPage || this.isChangePasswordPage) {
      this.breadcrumbs = [];
      return;
    }

    if (url === '/users') {
      this.breadcrumbs = [
        { label: 'Users', routerLink: '/users' },
      ];
    }
    else if (url === '/users/register') {
      this.breadcrumbs = [
        { label: 'Users', routerLink: '/users' },
        { label: 'Register User' },
      ];
    }
    else if (url === '/dashboard') {
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
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.username = null;
    this.router.navigate(['/login']);
  }


  toggleSidebar(sidenav: MatSidenav): void {
    sidenav.toggle();
  }

  selectItem(label: string): void {
    this.selectedItem = label;
  }
}
