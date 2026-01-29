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
  private pollingInterval: any;
  private routerSub!: Subscription; // ✅ FIX: Declare the Subscription property

  private allMenuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Leads Management', icon: 'list', route: '/leads' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Project', icon: 'assignment', route: '/projects' },
    { label: 'Call Logs', icon: 'call', route: '/call-logs' },
  ];

  constructor(private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.menuItems = this.allMenuItems;

    // ✅ FIX: Subscribe to router events and store subscription
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects || e.url;
        this.isLoginPage = url.startsWith('/login');
        this.isChangePasswordPage = url.startsWith('/change-password');

        const found = this.allMenuItems.find((m) => url.startsWith(m.route));
        this.selectedItem = found ? found.label : '';
      });
  }

  ngOnDestroy(): void {
    // ✅ FIX: Properly clean up subscription
    if (this.routerSub) {
      this.routerSub.unsubscribe();
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
    console.log('Logout clicked');
    this.username = null;
    // TODO: clear tokens & redirect to login
    this.router.navigate(['/login']);
  }

  toggleSidebar(sidenav: MatSidenav): void {
    sidenav.toggle();
  }

  selectItem(label: string): void {
    this.selectedItem = label;
  }
}
