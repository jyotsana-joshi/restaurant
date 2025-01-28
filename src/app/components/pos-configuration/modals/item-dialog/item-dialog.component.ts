import { Component, Inject, InjectionToken, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { POSConfigurationService } from '../../pos-configuration.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-dialog',
  templateUrl: './item-dialog.component.html',
  styleUrls: ['./item-dialog.component.scss']
})
export class ItemDialogComponent {
  loading = false;
  addItemForm: FormGroup = new FormGroup({});
  itemDetails: any
  isEdit: boolean = false;
  buttonText = 'Add';
  categoryList: any = []
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<ItemDialogComponent>,
    private posConfiService: POSConfigurationService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data.itemDetails) {
      this.itemDetails = this.data.itemDetails;
      console.log(this.itemDetails, "item details");
      this.setupForm()
    }
    this.isEdit = this.data.isEdit;
    if (this.isEdit)
      this.buttonText = 'Edit'
  }
  ngOnInit(): void {
    this.getAllCategories();
  }

  createForm() {
    this.addItemForm = this.fb.group({
      name: [''],
      price: [],
      offer: [],
      categoryId: [],
      isActive: [false],
    });
  }
  setupForm() {
    this.addItemForm.patchValue({
      name: this.itemDetails.name || '', 
      price: this.itemDetails.price || '', 
      offer: this.itemDetails.offer || '', 
      categoryId: this.itemDetails.outletMenu.id || '', 
      isActive: this.itemDetails.isActive || false, 
    });
  }
  // Handle form submission
  onSave() {
    console.log('this.isEdit: ', this.isEdit);
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      console.log('updatedData: ', updatedData);
      this.posConfiService.editItem(updatedData, this.itemDetails.id).subscribe(
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
          this.toastrService.error('Error in editing item', 'item');
        })
    } else {
      if (this.addItemForm.valid) {
        // Get form values
        this.loading = true;
        this.posConfiService.addItem(this.addItemForm.value).subscribe(
          (response: any) => {
            if (response.data) {
              this.loading = false;
              this.toastrService.success(response.message, 'item');
              this.dialogRef.close({ success: true });
            }
          },
          (error: any) => {
            this.loading = false;
            console.log(error, "error")
            this.toastrService.error('Error in adding item', 'item');

          }
        )
      }
    }

  }

  getUpdatedData(): any {
    const updatedData: any = {};
    const currentValues = this.addItemForm.value;

    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.data.itemDetails[key]) {
        updatedData[key] = currentValues[key];
      }
    });

    return updatedData;
  }

  getAllCategories() {
    this.posConfiService.getCategories().subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.outletMenu.length > 0) {
          this.categoryList = response.data.outletMenu;
        }

      })
  }
}

