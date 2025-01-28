import { Component, InjectionToken } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {
  checked = false
  closemessage = 'closed using directive'
  outlets = [
    { value: '1', label: 'Bhavana Restaurant' },
    { value: '2', label: 'Kathiyawadi' },
  ];
  designation = [
    { value: '1', label:'Cashier'},
    { value: '2', label:'Manager'},
    { value: '3', label:'Owner'},
  ];
  addUserForm: FormGroup  = new FormGroup({});
  constructor(private fb: FormBuilder,
  ) {
    this.setupForm();
  }
  ngOnInit(): void {
  }

  setupForm(){
    this.addUserForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      password: [''],
      confirmPassword: [''],
      departments: [''],
      branchId: [''],
      phone:['']
    });
  }

}

