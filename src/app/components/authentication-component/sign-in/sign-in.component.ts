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
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe(
        (response: any) => {
          this.loading = false;
          console.log(response, "response");
          if (response.data) {
            this.userDetails = response;
            localStorage.setItem(this.TOKEN_KEY, this.userDetails.data.access_token);
            localStorage.setItem(this.USER_KEY, this.userDetails.data.user_id.id)
            this.toastrService.success("Login successfully", "Login",);
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          this.loading = false;
          this.toastrService.error(error.error.message, "Error while login",);
          console.log(error, "error");
        }
      )
    } else {
      this.loading = false;
    }
  }
}
