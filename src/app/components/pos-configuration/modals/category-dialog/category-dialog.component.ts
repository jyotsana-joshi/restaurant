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
  branchList: any = [];
  printerList: any = [{
    name:'K1',
    id: 'K1'
  }]
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
  }

  createForm() {
    this.addcategoryForm = this.fb.group({
      name: [''],
      printer: [],
      isActive: [false],
    });
  }
  setupForm() {
    this.addcategoryForm.patchValue({
      name: this.categoryDetails.name || '', 
      printer: this.categoryDetails?.printer,
      isActive: this.categoryDetails.isActive || false, 
    });
  }
  // Handle form submission
  onSave() {
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      this.posConfiService.editCategories(updatedData, this.categoryDetails.id).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.message) {
            this.toastrService.success("Category Added successfully", 'Category');
            this.dialogRef.close({ success: true })
          }

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
              this.toastrService.success('Category Added successfully', 'Category');
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
}

