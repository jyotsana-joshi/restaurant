import { Component, Inject, InjectionToken } from '@angular/core';
import { FormGroup, FormBuilder, Validators, UntypedFormControl, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { POSConfigurationService } from '../../pos-configuration.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {
  checked = false
  closemessage = 'closed using directive'
  branchList: any = [];
  userDetails: any
  isEdit = false;
  buttonText = 'Add'
  designation: any = [];
  loading = false;
  addUserForm: FormGroup = new FormGroup({});
  designationControl: any = new UntypedFormControl()
  branchControl: any = new UntypedFormControl()
  constructor(private fb: FormBuilder,
    private posConfiService: POSConfigurationService,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data.userDetails) {
      this.userDetails = this.data.userDetails;
      this.setupForm()
    }
    this.isEdit = this.data.isEdit;
    if (this.isEdit)
      this.buttonText = 'Edit'
  }
  ngOnInit(): void {
    this.getDesignations();
    this.getBranches();
    this.designationControl.valueChanges.subscribe((val: any) => {
      if (val == 1 || val == 2) {
        this.addUserForm.controls['branchId'].disable();
        this.addUserForm.controls['password'].enable();
      } else if (val === 3) {
        this.addUserForm.controls['password'].disable();
        this.addUserForm.controls['branchId'].disable();
      }
    });
    this.branchControl.valueChanges.subscribe((val: any) => {
      if (val) {
        this.addUserForm.controls['designationId'].disable();
      } else {
        this.addUserForm.controls['designationId'].enable();
      }
    });
  }

  getDesignations() {
    this.posConfiService.getDesignations().subscribe(
      (response: any) => {
        this.designation = response.data;
      },
      (error: any) => {
        console.log(error, "error")
      })
  }
  getBranches() {
    this.posConfiService.getBranches().subscribe(
      (response: any) => {
        if (response.data.branches.length > 0) {
          this.branchList = response.data.branches;
        }
      },
      (error: any) => {
        console.log(error, "error")
      })
  }
  createForm() {
    this.addUserForm = this.fb.group({
      username: [''],
      firstName: [''],
      lastName: [''],
      password: [{ value: '', disable: false }],
      designationId: [''],
      branchId: [''],
    });

    this.designationControl = this.addUserForm.controls['designationId'];
    this.branchControl = this.addUserForm.controls['branchId'];

  }
  setupForm() {
    this.addUserForm.patchValue({
      username: this.userDetails.username, // Fallback to empty string if value is undefined
      firstName: this.userDetails.firstName,
      lastName: this.userDetails.lastName,
      password: null,
      designationId: this.userDetails?.designation?.id || null,
      branchId: this.userDetails?.branch?.id || null,
    });
    // Disable controls based on the conditions
    if (this.userDetails?.designation?.id) {
      this.addUserForm.controls['branchId'].disable();
      this.addUserForm.controls['designationId'].enable();
    } else if (this.userDetails?.branch?.id) {
      this.addUserForm.controls['designationId'].disable();
      this.addUserForm.controls['branchId'].enable();
    }
  }
  // Handle form submission
  onSave() {
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      this.posConfiService.editUser(updatedData, this.userDetails.id).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.message) {
            this.toastrService.success(response.message);
            this.dialogRef.close({ success: true })
          }

        }, (error: any) => {
          this.loading = false;
          this.toastrService.error(error?.error?.message, 'User');
        })
    } else {
      if (this.addUserForm.valid) {
        // Get form values
        this.loading = true;
        this.posConfiService.addUser(this.addUserForm.value).subscribe(
          (response: any) => {
            if (response) {
              this.loading = false;
              this.toastrService.success(response.message, 'User');
              this.dialogRef.close({ success: true });
            }
          },
          (error: any) => {
            this.loading = false;
            this.toastrService.error(error?.error?.message, 'User');
          }
        )
      }
    }

  }

  getUpdatedData(): any {
    const updatedData: any = {};
    const currentValues = this.addUserForm.getRawValue();

    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.data.userDetails[key]) {
        updatedData[key] = currentValues[key];
      }
    });

    return updatedData;
  }

  clearSelection(formControl: any) {
    this.addUserForm.controls[formControl].setValue(null)
    this.addUserForm.controls['designationId'].enable();
    this.addUserForm.controls['branchId'].enable();
    this.addUserForm.controls['password'].enable();
  }
}

