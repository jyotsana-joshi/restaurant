import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { POSConfigurationService } from '../../pos-configuration.service';
import { ToastrService } from 'ngx-toastr';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.scss']
})
export class CustomerDialogComponent {
  loading = false;
  addCustomerForm: FormGroup = new FormGroup({});
  customerDetails: any
  isEdit: boolean = false;
  buttonText = 'Add';
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerDialogComponent>,
    private posConfiService: POSConfigurationService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data.customerDetails) {
      this.customerDetails = this.data.customerDetails;
      this.setupForm()
    }
    this.isEdit = this.data.isEdit;
    if (this.isEdit)
      this.buttonText = 'Edit'
  }
  ngOnInit(): void {
  }

  createForm() {
    this.addCustomerForm = this.fb.group({
      name: [''],
      email: [],
      phone: [],
      address: [],
      birthDate: [],
      anniversaryDate: [],
      isActive: [true],
    });
  }

  setupForm() {
    this.addCustomerForm.patchValue({
      name: this.customerDetails?.name || '',
      email: this.customerDetails?.email || '',
      phone: this.customerDetails?.phone || null,
      printer: this.customerDetails?.printer || '',
      address: this.customerDetails?.address || '',
      birthDate: this.customerDetails?.birthDate || '',
      anniversaryDate: this.customerDetails?.anniversaryDate || '',
      isActive: this.customerDetails?.isActive || false,
    });
  }
  // Handle form submission
  onSave() {
    if (this.isEdit) {
      this.loading = true;
      const updatedData = this.getUpdatedData()
      this.posConfiService.editCustomer(updatedData, this.customerDetails.id).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.message) {
            this.toastrService.success(response.message);
            this.dialogRef.close({ success: true })
          }
        }, (error: any) => {
          this.loading = false;
          this.toastrService.error(error?.error?.message, 'Customer');
        })
    } else {
      if (this.addCustomerForm.valid) {
        this.loading = true;
        this.posConfiService.addCustomer(this.addCustomerForm.value).subscribe(
          (response: any) => {
            console.log('response: ', response);
            if (response.data) {
              this.loading = false;
              this.dialogRef.close({ success: true });
              this.toastrService.success(response.message, 'Customer');
            }
          },
          (error: any) => {
            this.loading = false;
            this.toastrService.error(error?.error?.message, 'Customer');
          }
        )
      }
    }

  }

  getUpdatedData(): any {
    const updatedData: any = {};
    const currentValues = this.addCustomerForm.value;

    Object.keys(currentValues).forEach(key => {
      let currentVal = currentValues[key];
      let originalVal = this.data.customerDetails[key];
      if (key === 'birthDate' || key === 'anniversaryDate') {
        const formattedCurrent = moment(currentVal).format('YYYY-MM-DD');
        const formattedOriginal = moment(originalVal).format('YYYY-MM-DD');

        if (formattedCurrent !== formattedOriginal) {
          updatedData[key] = moment(currentVal).format('YYYY-MM-DD');
        }
      } else {
        if (currentVal !== originalVal) {
          updatedData[key] = currentVal;
        }
      }
    });

    return updatedData;
  }

  onClose() {
    this.dialogRef.close({ success: false });
  }

  onDateChange(event: MatDatepickerInputEvent<Date>, controlName: any) {
    const selectedDate = event.value;
    this.addCustomerForm.get(controlName)?.setValue(selectedDate);
  }

}

