import { Component, Inject, InjectionToken, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { POSConfigurationService } from '../../pos-configuration.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})
export class CategoryDialogComponent {
  loading = false;
  addcategoryForm: FormGroup = new FormGroup({});
  categoryDetails: any
  isEdit: boolean = false;
  buttonText = 'Add';
  branchList: any = []
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    private posConfiService: POSConfigurationService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data.categoryDetails) {
      this.categoryDetails = this.data.categoryDetails;
      console.log(this.categoryDetails, "category details");
      this.setupForm()
    }
    this.isEdit = this.data.isEdit;
    if (this.isEdit)
      this.buttonText = 'Edit'
  }
  ngOnInit(): void {
    this.getAllBranches();
  }

  createForm() {
    this.addcategoryForm = this.fb.group({
      name: [''],
      branchId: [],
      isActive: [false],
    });
  }
  setupForm() {
    this.addcategoryForm.patchValue({
      name: this.categoryDetails.name || '', // Fallback to empty string if value is undefined
      branchId: this.categoryDetails?.branch?.id || '', // Fallback to empty string if value is undefined
      isActive: this.categoryDetails.isActive || false, // Fallback to false if value is undefined
    });
  }
  // Handle form submission
  onSave() {
    console.log('this.isEdit: ', this.isEdit);
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      console.log('updatedData: ', updatedData);
      this.posConfiService.editCategories(updatedData, this.categoryDetails.id).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.message) {
            this.toastrService.success(response.message);
            this.dialogRef.close({ success: true })
          }

          console.log('response: ', response);

        }, (error: any) => {
          this.loading = false;
          console.log(error, "error")
          this.toastrService.error('Error in editing category', 'Category');
        })
    } else {
      if (this.addcategoryForm.valid) {
        // Get form values
        this.loading = true;
        this.posConfiService.addCategories(this.addcategoryForm.value).subscribe(
          (response: any) => {
            if (response.data) {
              this.loading = false;
              this.toastrService.success(response.message, 'Category');
              this.dialogRef.close({ success: true });
            }
          },
          (error: any) => {
            this.loading = false;
            console.log(error, "error")
            this.toastrService.error('Error in adding category', 'Category');

          }
        )
      }
    }

  }

  getUpdatedData(): any {
    const updatedData: any = {};
    const currentValues = this.addcategoryForm.value;

    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.data.categoryDetails[key]) {
        updatedData[key] = currentValues[key];
      }
    });

    return updatedData;
  }

  getAllBranches() {
    this.posConfiService.getBranches().subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.branches.length > 0) {
          this.branchList = response.data.branches;
        }

      })
  }
}

