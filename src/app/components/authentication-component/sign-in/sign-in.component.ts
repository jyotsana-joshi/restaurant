import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthInterceptor } from 'src/app/utils/interceptors/auth.service';
import { POSConfigurationService } from '../../pos-configuration/pos-configuration.service';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']

})
export class SignInComponent {
  checked = true;
  loginForm: FormGroup;
  userDetails: any
  TOKEN_KEY = 'accessToken'
  USER_KEY = 'userDetails'

  loading = false;
  constructor(private fb: FormBuilder, private authService: AuthInterceptor, private router: Router, private toastrService: ToastrService, private posConfiguration: POSConfigurationService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loading = false;
      return
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.userDetails = response.data;
        localStorage.setItem(this.TOKEN_KEY, this.userDetails.access_token);
        localStorage.setItem(this.USER_KEY, this.userDetails.user_id.id)
        let userRole = '';

        if (this.userDetails?.user_id?.branch) {
          userRole = 'cashier';
        } else if (this.userDetails?.user_id?.designation?.name?.toLowerCase() === 'owner') {
          userRole = 'admin';
        } else if (this.userDetails?.user_id?.designation?.name?.toLowerCase() === 'manager') {
          userRole = 'manager';
        }
        if (userRole) {
          localStorage.setItem('userRole', userRole);
        } else {
          console.log('User role could not be determined.');
        }
        this.router.navigate(['/billing-screen']);
      }, error: (err) => {
        this.toastrService.error(err.error.message, 'Error');
        console.log('err', err.error.message)
      }
    });
  }
}
