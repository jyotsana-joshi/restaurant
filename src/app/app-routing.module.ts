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

const routes: Routes = [
  {
    path:"",
    component:MainComponent,
    children: [
      {path:"", redirectTo:"/home", pathMatch:"full"},
      {path:"home", component:DashboardComponent, canActivate: [AuthGuard]},
      {path:"user-list", component:OutletUserComponent, canActivate: [AuthGuard]},
      {path:"branches", component:BranchComponent, canActivate: [AuthGuard]},
      {path:"categories", component:CategoriesComponent, canActivate: [AuthGuard]},
      {path:"items", component:ItemsComponent, canActivate: [AuthGuard]},
    ]
  },
  {path:"sign-in", component:SignInComponent, canActivate: [NoAuthGuard]},
  {path:"", redirectTo:"/home", pathMatch:"full"},
  {path:"**", redirectTo:"/home", pathMatch:"full"},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
