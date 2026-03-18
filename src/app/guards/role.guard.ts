import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  private checkRole(route: ActivatedRouteSnapshot): boolean {
    const role = localStorage.getItem('role');
    const allowedRoles = route.data['allowedRoles'] as string[];

    if (!role) {
      this.router.navigate(['/login']);
      return false;
    }

    if (allowedRoles && allowedRoles.includes(role)) {
      return true;
    }

    this.toastr.error('You do not have permission to access this page');
    this.router.navigate(['/dashboard']);
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkRole(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.checkRole(route);
  }
}
