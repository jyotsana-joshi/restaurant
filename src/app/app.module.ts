import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModule } from './angular-material-module';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { MainComponent } from './layouts/main/main.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthenticationModule } from './components/authentication-component/authentication.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './utils/guard/auth.guard';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { POSConfigurationModule } from './components/pos-configuration/pos-configuration.module';
import { AuthInterceptor } from './utils/interceptors/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    AngularMaterialModule,
    FeatherModule.pick(allIcons),
    DashboardModule,
    AuthenticationModule,
    HttpClientModule,
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 5000,  // Toast disappears after 5 seconds
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,  // Show progress bar
      tapToDismiss: false,
    }),
    POSConfigurationModule

  ],
  providers: [AuthGuard,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true, // Important to allow multiple interceptors
  },
],
  bootstrap: [AppComponent]
})
export class AppModule { }
