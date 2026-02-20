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
import { AuthService } from './services/auth.service';

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
  showProfileDialog: boolean = false;
  userDetails: any = { username: '', role: '', email: '' };

  notifications: any[] = [];
  unreadCount: number = 0;
  showNotificationDropdown: boolean = false;

  menuItems: any[] = [];
  breadcrumbs: MenuItem[] = []; // ✅ ADD

  home = { icon: 'pi pi-home', routerLink: '/' }; // ✅ ADD 

  private pollingInterval: any;
  private routerSub!: Subscription;


  private allMenuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Leads Management', icon: 'list', route: '/leads' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Project', icon: 'assignment', route: '/projects' },
    { label: 'Call Logs', icon: 'call', route: '/call-logs' },
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.menuItems = this.allMenuItems;
    this.loadUserData();

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects || e.url;

        this.isLoginPage = url.startsWith('/login');
        this.isChangePasswordPage = url.startsWith('/change-password');

        if (!this.isLoginPage && !this.isChangePasswordPage) {
          this.loadUserData();
        }

        // Sidebar selection
        const found = this.allMenuItems.find((m) => url.startsWith(m.route));
        this.selectedItem = found ? found.label : '';

        // ✅ Breadcrumb update
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

    const segments = url.split('/').filter(s => s);
    const crumbs: MenuItem[] = [];

    let currentUrl = '';
    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;

      // Map segments to readable labels
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === 'leads') label = 'Leads Management';
      if (segment === 'call-logs') label = 'Call Logs';
      if (segment === 'register') label = 'Registration';
      if (segment === 'edit') label = 'Edit';

      // Skip numeric IDs from being labels directly if they are the last segment
      if (index === segments.length - 1 && segment.match(/^[A-Z0-9-]+$/) && segment.length > 5) {
        label = 'Details';
      }

      crumbs.push({ label, routerLink: currentUrl });
    });

    this.breadcrumbs = crumbs;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth > 768;
  }

  markAllAsRead(): void {
    this.unreadCount = 0;
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  loadUserData(): void {
    // 1. Try primary keys from AuthService
    this.username = this.authService.getUsername();
    this.role = this.authService.getRole();
    let email = this.authService.getEmail();

    // 2. Fallback: Check for common alternative key names
    if (!this.username) {
      this.username = localStorage.getItem('user') || localStorage.getItem('user_name') || localStorage.getItem('userName');
    }
    if (!this.role) {
      this.role = localStorage.getItem('role_type') || localStorage.getItem('roleType') || localStorage.getItem('userRole');
    }

    // 3. Ultimate Fallback: Decode JWT token if present
    const token = this.authService.getToken();
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          if (decodedPayload) {
            if (!this.username) this.username = decodedPayload.username || decodedPayload.user;
            if (!this.role) this.role = decodedPayload.role_type || decodedPayload.role;
            if (!email) email = decodedPayload.email;
          }
        }
      } catch (e) {
        console.error('Error decoding JWT for profile:', e);
      }
    }

    console.log('Final resolved user data for profile:', { username: this.username, role: this.role, email });

    // 4. Update userDetails object for the template
    if (this.username || email) {
      this.userDetails.username = this.username || 'Logged In User';
      this.userDetails.role = this.role || 'User';
      this.userDetails.email = email || 'No email provided';

      // Sync back to component properties if they were null
      if (!this.username) this.username = this.userDetails.username;
      if (!this.role) this.role = this.userDetails.role;
    }
  }

  showProfile(): void {
    this.loadUserData();
    this.showProfileDialog = true;
  }

  logout(): void {
    console.log('Logout clicked');
    this.authService.logout();
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
