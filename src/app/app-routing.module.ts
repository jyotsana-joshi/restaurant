import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './layouts/main/main.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignInComponent } from './components/authentication-component/sign-in/sign-in.component';
import { AuthGuard } from './utils/guard/auth.guard';
import { OutletUserComponent } from './components/pos-configuration/outlet-user/outlet-user.component';
import { BranchComponent } from './components/pos-configuration/branch/branch.component';
import { CategoriesComponent } from './components/pos-configuration/categories/categories.component';
import { NoAuthGuard } from './utils/guard/no-auth.guard';
import { ItemsComponent } from './components/pos-configuration/items/items.component';
import { CustomersComponent } from './components/pos-configuration/customers/customers.component';
import { BranchMenuComponent } from './components/pos-configuration/branch-menu/branch-menu.component';
import { BillingScreenComponent } from './billing-screen/billing-screen/billing-screen.component';
import { ReportsComponent } from './components/reports/reports/reports.component';

const routes: Routes = [
  {
    path:"",
    component:MainComponent,
    children: [
      {path:"", redirectTo:"/user-list", pathMatch:"full"},
      {path:"home", component:DashboardComponent, canActivate: [AuthGuard]},
      {path:"user-list", component:OutletUserComponent, canActivate: [AuthGuard]},
      {path:"branches", component:BranchComponent, canActivate: [AuthGuard]},
      {path:"categories", component:CategoriesComponent, canActivate: [AuthGuard]},
      {path:"items", component:ItemsComponent, canActivate: [AuthGuard]},
      {path:"branch-menu", component:BranchMenuComponent, canActivate: [AuthGuard]},
      {path:"customers", component:CustomersComponent, canActivate: [AuthGuard]},
      {path:"final-report", component:ReportsComponent, canActivate: [AuthGuard]},
      {path:"mode-wise-report", component:ReportsComponent, canActivate: [AuthGuard]},
      {path:"cashier-electronic-report", component:ReportsComponent, canActivate: [AuthGuard]},
    ]
  },
  {
    path: 'billing-screen', // Standalone route for the billing screen
    component: BillingScreenComponent,
    canActivate: [AuthGuard], // Apply the AuthGuard to this route as well
  },
  {path:"sign-in", component:SignInComponent, canActivate: [NoAuthGuard]},
  {path:"", redirectTo:"/user-list", pathMatch:"full"},
  {path:"**", redirectTo:"/user-list", pathMatch:"full"},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
