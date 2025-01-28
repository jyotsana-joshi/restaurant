import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthInterceptor } from '../interceptors/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private router:Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Redirect to the home page if already logged in
      this.router.navigate(['/home']);
      return false;
    }
    return true; // Allow access if no token is present
  }
  
}
