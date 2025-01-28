import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignInComponent } from './sign-in/sign-in.component';
import { AngularMaterialModule } from 'src/app/angular-material-module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SignInComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularMaterialModule,
    MatFormFieldModule, 
    MatInputModule,  
    ReactiveFormsModule, 
    MatCheckboxModule, 
    MatRadioModule,
    MatButtonModule
  ],
  exports: [
    SignInComponent
  ]
})
export class AuthenticationModule { }
