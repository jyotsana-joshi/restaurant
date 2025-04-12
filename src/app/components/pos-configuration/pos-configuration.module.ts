import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OutletUserComponent } from './outlet-user/outlet-user.component';
import { AngularMaterialModule } from 'src/app/angular-material-module';
import { AddUserDialogComponent } from './modals/add-user-dialog/add-user-dialog.component';

import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { BranchComponent } from './branch/branch.component';
import { BranchDialogComponent } from './modals/branch-dialog/branch-dialog.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryDialogComponent } from './modals/category-dialog/category-dialog.component';
import { ItemsComponent } from './items/items.component';
import { ItemDialogComponent } from './modals/item-dialog/item-dialog.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDialogComponent } from './modals/customer-dialog/customer-dialog.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [
    OutletUserComponent,
    AddUserDialogComponent,
    BranchComponent,
    BranchDialogComponent,
    CategoriesComponent,
    CategoryDialogComponent,
    ItemsComponent,
    ItemDialogComponent,
    CustomersComponent,
    CustomerDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FeatherModule,
  ],
  exports: [
    OutletUserComponent,
    BranchComponent,
    BranchDialogComponent,
    CategoriesComponent,
    CategoryDialogComponent,
    ItemsComponent,
    ItemDialogComponent,
    CustomersComponent,
    CustomerDialogComponent
  ]
})
export class POSConfigurationModule { }
