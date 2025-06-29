import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BillingScreenComponent } from './billing-screen/billing-screen.component';

@NgModule({
  declarations: [BillingScreenComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    BillingScreenComponent
  ]
})
export class BillingScreenModule { }
