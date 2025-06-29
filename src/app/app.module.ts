import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { BillingScreenModule } from './billing-screen/billing-screen.module';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReportsModule } from './components/reports/reports.module';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
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
      timeOut: 3000,  // Toast disappears after 5 seconds
      positionClass: 'toast-center-center',
      preventDuplicates: true,
      progressBar: true,  // Show progress bar
    }),
    BsDatepickerModule.forRoot(),
    POSConfigurationModule,
    BillingScreenModule,
    ReactiveFormsModule,
    ReportsModule

  ],
  providers: [AuthGuard,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true, // Important to allow multiple interceptors
  },
  {
    provide: BsDatepickerConfig,
    useValue: {
      dateInputFormat: 'YYYY/MM/DD', // Set the date format
      isAnimated: true, // Enable animation
      // adaptivePosition: true, // Position the datepicker adaptively
      // containerClass: 'theme-dark-blue', // Set the theme class
      // showWeekNumbers: false, // Hide week numbers
    }
  }
],

  bootstrap: [AppComponent]
})
export class AppModule { }
