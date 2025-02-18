import { Component, Inject, InjectionToken, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { POSConfigurationService } from '../../pos-configuration.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-branch-dialog',
  templateUrl: './branch-dialog.component.html',
  styleUrls: ['./branch-dialog.component.scss']
})
export class BranchDialogComponent {
  loading = false;
  addBranchForm: FormGroup = new FormGroup({});
  branchDetails: any
  isEdit: boolean = false;
  buttonText = 'Add';
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<BranchDialogComponent>,
    private posConfiService: POSConfigurationService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data.branchDetails) {
      this.branchDetails = this.data.branchDetails;
      console.log(this.branchDetails, "branch details");
      this.setupForm()
    }
    this.isEdit = this.data.isEdit;
    if(this.isEdit)
      this.buttonText = 'Edit'
  }
  ngOnInit(): void {
  }

  createForm() {
    this.addBranchForm = this.fb.group({
      name: [''],
      code: [''],
      address:[''],
      pnrNum:[''],
      isActive: [],
    });
  }
  setupForm() {
    this.addBranchForm.patchValue({
      name: this.branchDetails.name || '', // Fallback to empty string if value is undefined
      code: this.branchDetails.code || '', // Fallback to empty string if value is undefined
      isActive: this.branchDetails.isActive || false, // Fallback to false if value is undefined
    });
  }
  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    return words.map(word => word.charAt(0)).join('').toUpperCase();
  }
  // Handle form submission
  onSave() {
    console.log('this.isEdit: ', this.isEdit);
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      console.log('updatedData: ', updatedData);
      this.posConfiService.editBranches(updatedData, this.branchDetails.id).subscribe(
        (response: any) => {
          this.loading = false;
          if(response.message){
            this.toastrService.success(response.message);
            this.dialogRef.close({success: true})
          }

          console.log('response: ', response);

        },(error:any) =>{
          this.loading = false;
            console.log(error, "error")
            this.toastrService.error('Error in editing branch', 'Branch');
        })
    } else {
      if (this.addBranchForm.valid) {
        // Get form values
        this.loading = true;
        this.posConfiService.addBranches(this.addBranchForm.value).subscribe(
          (response: any) => {
            if (response.data) {
              this.loading = false;
              this.toastrService.success(response.message, 'Branch');
              this.dialogRef.close({ success: true });
            }
          },
          (error: any) => {
            this.loading = false;
            console.log(error, "error")
            this.toastrService.error('Error in adding branch', 'Branch');

          }
        )
      }
    }

  }

  getUpdatedData(): any {
    const updatedData: any = {};
    const currentValues = this.addBranchForm.value;

    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.data.branchDetails[key]) {
        updatedData[key] = currentValues[key];
      }
    });

    return updatedData;
  }
}

