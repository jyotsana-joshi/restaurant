import { Component, Inject, InjectionToken, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
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
  printerList: any = [{
    name:'K1',
    id: 'K1'
  }]
  transactionTypes: any;
  transactionTypeErrors: boolean[] = [];
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
    this.getTransactionType();
  }

  createForm() {
    this.addItemForm = this.fb.group({
      name: [''],
      offer: [],
      categoryId: [],
      isActive: [true],
      printer: [],
      price: this.fb.array([], this.duplicateTransactionValidator())
    });
    this.addTransactionRow();
  }

  get price(): FormArray {
    return this.addItemForm.get('price') as FormArray;
  }
  addTransactionRow() {
    const transactionGroup = this.fb.group({
      platFormId: [null, Validators.required],
      platForm: [null],
      price: [null, [Validators.required, Validators.min(0)]]
    });

    this.price.push(transactionGroup);
  }

  removeTransactionRow(index: number) {
    this.price.removeAt(index);
    this.addItemForm.get('price')?.updateValueAndValidity();
  }

  // Custom Validator to Check Duplicate Transaction Types
  duplicateTransactionValidator(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const transactionTypes = (formArray as FormArray).controls.map(control => control.get('platFormId')?.value);
      const duplicates = transactionTypes.filter((type, index, self) => type && self.indexOf(type) !== index);
      return duplicates.length > 0 ? { duplicateTransaction: true } : null;
    };
  }

  onTransactionTypeSelect(index: number, event: any) : void{
    console.log('event: ', event);
   
    const numericValue = event ? parseInt(event, 10) : null;
    // Find the full transaction object based on the selected ID
    const selectedTransaction = this.transactionTypes.find((type: any) => type.id === numericValue);

    if (selectedTransaction) {
      const transactionControl = this.price.at(index);
      transactionControl.patchValue({
        platFormId: selectedTransaction.id,
        platForm: selectedTransaction.name,
        price: selectedTransaction.price  // Automatically populate the price
      });
    }
  }

  setupForm() {
    this.addItemForm.patchValue({
      name: this.itemDetails?.name || '',
      price: this.itemDetails?.price || '',
      offer: this.itemDetails?.offer || null,
      printer: this.itemDetails?.printer || '',
      categoryId: this.itemDetails?.outletMenu?.id || '',
      isActive: this.itemDetails?.isActive || false,
    });
    // Clear existing price controls before adding new ones
    this.price.clear();

    // Patch price FormArray if itemDetails has price data
    if (this.itemDetails?.price?.length) {
      this.itemDetails.price.forEach((priceItem: any) => {
        const transactionGroup = this.fb.group({
          platFormId: [priceItem.platFormId, Validators.required],
          platForm: [priceItem.platForm],
          price: [priceItem.price, [Validators.required, Validators.min(0)]]
        });

        this.price.push(transactionGroup);
      });
    }
  }
  // Handle form submission
  onSave() {
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      this.posConfiService.editItem(updatedData, this.itemDetails.id).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.message) {
            this.toastrService.success(response.message);
            this.dialogRef.close({ success: true })
          }
        }, (error: any) => {
          this.loading = false;
          this.toastrService.error(error?.error?.message, 'Item');
        })
    } else {
      if (this.addItemForm.valid) {
        this.loading = true;
        this.posConfiService.addItem(this.addItemForm.value).subscribe(
          (response: any) => {
            console.log('response: ', response);
            if (response.data) {
              this.loading = false;
              this.dialogRef.close({ success: true });
              this.toastrService.success(response.message, 'Item');
            }
          },
          (error: any) => {
            this.loading = false;
            this.toastrService.error(error?.error?.message, 'Item');
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

  getTransactionType() {
    this.posConfiService.getTransctionType().subscribe(
      (response: any) => {
        if (response?.data?.tidTypes?.length) {
          console.log('response: ', response);
          this.transactionTypes = response.data.tidTypes
        }
      }
    )
  }
  onClose() {
    this.dialogRef.close({ success: false });
  }
}

