import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  TOKEN_KEY = 'accessToken'
  USER_KEY = 'userDetails'
  ApiUrl = 'https://restro-back-end-production.up.railway.app/v1/';
  constructor(private httpClient: HttpClient) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the access token (e.g., from localStorage or a service)
    const token = localStorage.getItem(this.TOKEN_KEY);

    // Clone the request and add the authorization header if the token exists
    const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next.handle(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Handle unauthorized errors (e.g., redirect to login)
      }
      return throwError(err);
    })
  );
}
  login(data: any) {
    console.log('data: ', data);
    return this.httpClient.post(`${this.ApiUrl}auth/login`, data);
  }
  register(data: any) {
    return this.httpClient.post(`${this.ApiUrl}/auth/register`, data)
  }

  //check for user login or not
  isLoggedIn() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token === null || token === 'undefined' || token === '') {
      return false;
    } else {
      return true;
    }
  }

  //for logout
  logout() {
     localStorage.removeItem(this.TOKEN_KEY) 
      localStorage.removeItem(this.USER_KEY);
  }
}
