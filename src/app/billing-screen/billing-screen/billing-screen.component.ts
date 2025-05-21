import { Component, ElementRef, ViewChild } from '@angular/core';
// Removed incorrect import as 'bootstrap' module does not export 'bootstrap'
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { debounceTime, distinctUntilChanged, Subscription, switchMap } from 'rxjs';
import { POSConfigurationService } from 'src/app/components/pos-configuration/pos-configuration.service';

@Component({
  selector: 'app-billing-screen',
  templateUrl: './billing-screen.component.html',
  styleUrls: ['./billing-screen.component.scss']
})
export class BillingScreenComponent {
  sidebarMenu: string[] = ['Beverage', 'Chat Corner', 'Chinese Cuisine', 'Chinese Soup', 'Dal', 'Desert', 'Extra', 'Farsan List', 'Farsan PKT'];
  categoryTabs: string[] = ['Beverage', 'Chat Corner', 'Chinese Soup', 'Desert'];
  items: string[] = ['Avocado Juice', 'Butter Milk', 'Carrot Juice', 'Cold Coffee', 'Dip Tea', 'Fresh Lime Soda', 'Ice Gola', 'Pineapple Juice'];
  paymentOptions: string[] = ['Cash', 'Credit Card', 'Cash & Card', 'Advance', 'Uber Eats', 'Talabat', 'Zomato'];
  currentDate: string = new Date().toLocaleDateString();
  selectedCategory: string | null = null;
  selectedTab: string = ''
  blankRows: any[] = [];
  allCategories: any[] = [];
  isAtTop = true;
  isAtBottom = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('itemScroll') itemScroll!: ElementRef;
  scrollAmount = 50; // px per click
  categoryItems: any[] = [];
  allTransactionTypes: any[] = [];
  disableScrollUp = true;
  disableScrollDown = false;
  orders: any[] = [];
  selectedRowIndex: number | null = null;
  newlyAddedRowIndex: number | null = null;
  selectedPlatform = 1;
  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];
  inputQty: string = '';
  allDeliveryBoys: any[] = [];
  customerForm: any
  paymentForm: any
  searchSub!: Subscription;
  todayDate: UntypedFormControl = new UntypedFormControl('');
  subtotalAmount = 0;
  isLoading = false;
  selectedOrderType: UntypedFormControl = new UntypedFormControl('Table');
  otherChargesForm: any
  missingDetailsMessage: string = '';
  branchId: any
  userDetails: any;
  selectedSection: string = 'billing';
  payments: any[] = []; // Array to store payment records
  blankRowsPayment: number = 5;
  addCashPaymentForm: any
  transactionTypeForPayment: any[] = [];
  selectedPaymentRowIndex: number | null = null; // To track the selected row
  newlyAddedPaymentRowIndex: number | null = null; // To track the newly added row
  discountPercent: UntypedFormControl = new UntypedFormControl();
  allBillsIds: any[] = [];
  selectedBillId = ''
  constructor(private posConfiService: POSConfigurationService, private fb: FormBuilder) {
    const value = localStorage.getItem('userDetails');
    this.posConfiService.getUser(value).subscribe(
      (response: any) => {
        console.log(response, "responsee");
        this.userDetails = response.data.user;
        this.branchId = this.userDetails.branch.id;
      }
    )
    this.getCategories();
    this.getTransactionTypes();
    this.otherChargesForm = this.fb.group({
      amount: [0] // Default value for other charges
    });
  }
  ngOnInit() {
    const now = new Date();
    const formattedDate = this.formatDate(now); // DD/MM/YYYY
    console.log('formattedDate: ', formattedDate);
    this.todayDate.setValue(formattedDate);
    this.customerForm = this.fb.group({
      customerId: [''],
      mobile: [''],
      name: [''],
      address: [''],
      remark: [''],
      deliveryBoy: ['']
    });
    this.getDeliveryBoys();
    this.getAllBills()

    this.paymentForm = this.fb.group({
      bill: null,
      paid: null,
      balance: null,
    });

    this.paymentForm.get('paid')?.valueChanges.subscribe(() => {
      this.updateBalance();
    });

    this.todayDate.valueChanges.subscribe((date: Date) => {
      this.allBillsIds = [];
      this.getAllBills();
    });

    this.searchSub = this.customerForm.get('mobile')?.valueChanges
      .pipe(
        debounceTime(300), // wait 300ms after typing stops
        distinctUntilChanged(),
        switchMap(value => {
          if (!value || value === '') {
            this.customerForm.reset()
            return [];
          }
          return this.posConfiService.getCustomers({ offset: 1, limit: 10 }, value);
        })
      ).subscribe((data: any) => {
        console.log('data: ', data);
        if (data.data.customers.length > 0) {
          const customer = data.data.customers[0];
          this.customerForm.patchValue({
            name: customer.name,
            address: customer.address,
            customerId: customer.id,
          });
        } else {
          this.customerForm.patchValue({
            name: '',
            address: ''
          });
        }
      });
    this.addCashPaymentForm = this.fb.group({
      paymentDate: [this.todayDate.value, Validators.required],
      vendorName: ['', Validators.required],
      paymentMode: [{ value: 'Cash', disabled: true }],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      remarks: ['']
    });

    this.discountPercent.valueChanges.pipe(debounceTime(300)).subscribe((value: number) => {
      console.log('Discount value changed:', value);
      if (value < 0 || value > 100) {
        console.error('Invalid discount value. It should be between 0 and 100.');
        return;
      }
      // Calculate the discount amount and update the subtotal
      const discountAmount = (this.subtotalAmount * value) / 100;
      this.paymentForm.get('bill')?.setValue(this.subtotalAmount - discountAmount);
      this.paymentForm.get('balance')?.setValue(this.subtotalAmount - discountAmount);
      this.updateBalance();
    })
  }

  updateBalance() {
    const bill = this.paymentForm.get('bill')?.value;
    const paid = this.paymentForm.get('paid')?.value;
    const balance = bill - paid;
    this.paymentForm.get('balance')?.setValue(balance);
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // format for input[type=date]
  }

  ngAfterViewInit() {
    this.checkScrollPosition();
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }
  scrollUp() {
    const el = this.scrollContainer.nativeElement;
    el.scrollBy({ top: -this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPosition(), 300); // allow smooth scroll to finish
  }

  scrollDown() {
    const el = this.scrollContainer.nativeElement;
    el.scrollBy({ top: this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPosition(), 300);
  }

  checkScrollPosition() {
    const el = this.scrollContainer.nativeElement;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    this.isAtTop = scrollTop === 0;
    this.isAtBottom = scrollTop + clientHeight >= scrollHeight;
  }

  itemScrollUp() {
    const el = this.itemScroll.nativeElement;
    el.scrollBy({ top: -50, behavior: 'smooth' });
  }
  itemScrollDown() {
    const el = this.itemScroll.nativeElement;
    el.scrollBy({ top: 50, behavior: 'smooth' });
  }
  getTransactionTypes() {
    this.posConfiService.getTransactionTypes().subscribe(
      (response: any) => {
        if (response.data.tidTypes.length > 0) {
          this.allTransactionTypes = response.data.tidTypes;
          this.transactionTypeForPayment = this.allTransactionTypes.filter((item: any) => item.name === 'Cash');
        }
      },
      (error) => {
        console.error('Error fetching transaction types:', error);
      }
    );
  }
  getCategories() {
    this.isLoading = true;
    this.posConfiService.getCategories().subscribe(
      (response: any) => {
        if (response.data.outletMenu.length > 0) {
          this.allCategories = response.data.outletMenu;
          this.isLoading = false;
          this.getItemByCategoryId(this.allCategories[0]);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching items:', error);
      })
  }
  getItemByCategoryId(category: any) {
    console.log('category: ', category);
    this.selectedCategory = category.name;
    this.posConfiService.getItemByCategoryId(category.id).subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.length > 0) {
          this.categoryItems = response.data
        } else {
          this.categoryItems = [];
        }
        console.log('this.categoryItems: ', this.categoryItems);
      },
      (error) => {
        console.error('Error fetching items:', error);
      }
    );
  }

  addItemToOrder(item: any) {
    const platformPriceObj = item.price.find((p: any) => p.platFormId == this.selectedPlatform);
    const price = platformPriceObj ? platformPriceObj.price : 0;
    const existingOrder = this.orders.find(order => order.id === item.id);

    if (existingOrder) {
      existingOrder.qty++;
      this.updateOrderTotal(existingOrder);
    } else {
      const newOrder = {
        id: item.id,
        name: item.name,
        rate: price,
        qty: 1,
        total: price,
        price: item.price,
      };
      this.orders.push(newOrder);
      this.newlyAddedRowIndex = this.orders.length - 1;

      setTimeout(() => (this.newlyAddedRowIndex = null), 1000);
    }
    this.calculateTotalAmount();
  }

  // Always show at least 10 rows
  get displayedOrders(): any[] {
    const result = [...this.orders];
    while (result.length < 10) {
      result.push(null);
    }
    return result;
  }

  plusItemQty() {
    if (this.selectedRowIndex !== null && this.orders[this.selectedRowIndex]) {
      this.orders[this.selectedRowIndex].qty++;
      this.updateOrderTotal(this.orders[this.selectedRowIndex]);
    }
    this.calculateTotalAmount();
  }

  minusItemQty() {
    if (this.selectedRowIndex !== null && this.orders[this.selectedRowIndex]) {
      if (this.orders[this.selectedRowIndex].qty > 1) {
        this.orders[this.selectedRowIndex].qty--;
        this.updateOrderTotal(this.orders[this.selectedRowIndex]);
      }
    }
    this.calculateTotalAmount();
  }

  deleteItem() {
    if (this.selectedRowIndex !== null && this.orders[this.selectedRowIndex]) {
      this.orders.splice(this.selectedRowIndex, 1);

      // Handle selection after deletion
      if (this.orders.length === 0) {
        this.selectedRowIndex = null;
      } else if (this.selectedRowIndex >= this.orders.length) {
        this.selectedRowIndex = this.orders.length - 1;
      }
      this.newlyAddedRowIndex = this.selectedRowIndex;

      // Clear highlight after short delay
      setTimeout(() => this.newlyAddedRowIndex = null, 1000);
    }
    this.calculateTotalAmount();
  }

  updateOrderTotal(order: any) {
    order.total = order.rate * order.qty;
  }
  calculateTotalAmount() {
    this.subtotalAmount = this.displayedOrders
      .filter(order => order && order.total != null)
      .reduce((sum, order) => sum + order.total, 0);
    this.paymentForm.get('bill')?.setValue(this.subtotalAmount);

    // Update balance also
    this.updateBalance();
  }


  onNumpadClick(key: string) {
    console.log('key: ', key, this.inputQty);
    if (this.selectedRowIndex === null) return;

    // Append the key to input string
    this.inputQty += key;

    // Parse the quantity
    const parsedQty = parseFloat(this.inputQty);
    if (!isNaN(parsedQty)) {
      const order = this.displayedOrders[this.selectedRowIndex];
      order.qty = parsedQty;
      order.total = order.qty * order.rate;
    }
  }
  onRowSelect(index: number) {
    this.selectedRowIndex = index;
    this.inputQty = ''; // Reset numpad input
  }
  removeOrder(index: number) {
    this.orders.splice(index, 1);
  }

  ontransactionTypeSelect(event: any) {
    console.log('Selected transaction type:', event.target.value);
    this.selectedPlatform = event.target.value;
    this.orders.forEach(order => {
      const platformPriceObj = order.price.find((p: any) => p.id === this.selectedPlatform);
      const price = platformPriceObj ? platformPriceObj.price : 0;
      order.rate = price;
      this.updateOrderTotal(order);
    });
  }

  saveBill() {
    this.missingDetailsMessage = '';
    // Prepare the payload
    if (this.orders.length === 0) {
      this.missingDetailsMessage = 'Please add at least one item before saving the bill.';
      const modal = new bootstrap.Modal(document.getElementById('missingDetailsModal')!);
      modal.show();
      return;
    }
    const customerName = this.customerForm.get('name')?.value;
    const customerMobile = this.customerForm.get('mobile')?.value;
    const customerId = this.customerForm.get('customerId')?.value;
    if (this.selectedOrderType.value === 'Take Away') {

      let message = 'Missing details: ';
      if (!customerName) {
        message += 'Customer name. ';
      }
      if (!customerMobile) {
        message += 'Customer mobile number. ';
      }
      this.missingDetailsMessage = message.split('. ').join('.\n');
      if (!customerName || !customerMobile) {
        const modal = new bootstrap.Modal(document.getElementById('missingDetailsModal')!);
        modal.show();
        return;
      }
    }

    if (this.selectedOrderType.value === 'Home Delivery') {
      const deliveryBoy = this.customerForm.get('deliveryBoy')?.value;
      let message = 'Missing details: ';
      if (!customerName) {
        message += 'Customer name. ';
      }
      if (!customerMobile) {
        message += 'Customer mobile number. ';
      }
      if (!deliveryBoy) {
        message += 'Delivery boy. ';
      }
      this.missingDetailsMessage = message.split('. ').join('.\n');

      if (!customerName || !customerMobile || !deliveryBoy) {
        const modal = new bootstrap.Modal(document.getElementById('missingDetailsModal')!);
        modal.show();
        return;
      }
    }

    console.log('customerName: ', customerName, customerId);
    // if((customerName || customerMobile) && !customerId){
    //   const customerPayload = {
    //     name: customerName,
    //     mobile: customerMobile,
    //     address: this.customerForm.get('address')?.value,
    //     remark: this.customerForm.get('remark')?.value,
    //   };
    //   this.posConfiService.addCustomer(customerPayload).subscribe(
    //     (response:any) => {
    //       console.log('Customer added successfully:', response);
    //       this.customerForm.patchValue({
    //         customerId: response.data.id
    //       });
    //     },
    //     (error:any) => {
    //       console.error('Error adding customer:', error);
    //       alert('Failed to add customer. Please try again.');
    //     }
    //   );
    // }
    const payload = {
      billingCalc: {
        items: this.orders.map(order => ({
          id: order.id,
          name: order.name,
          price: order.rate,
          quantity: order.qty
        })),
        vat: this.subtotalAmount * 0.05, // Calculate 5% VAT
        amountWithOutVat: this.subtotalAmount - (this.subtotalAmount * 0.05),
      },
      isTakeAway: this.selectedOrderType.value === 'Take Away',
      isHomeDelivery: this.selectedOrderType.value === 'Home Delivery',
      subTotal: this.subtotalAmount,

      discount: this.paymentForm.get('discount')?.value || 0,
      deliveryBoyId: this.customerForm.get('deliveryBoy')?.value || null,
      branchId: this.branchId, // Replace with actual branch ID if dynamic
      paymentMethodId: this.selectedPlatform, // Assuming selectedPlatform holds the payment method ID
      table: this.selectedOrderType.value === 'Table',
      customerId: customerId,
      paid: this.paymentForm.get('paid')?.value || 0,
      isPendingPayment: this.subtotalAmount === this.paymentForm.get('paid')?.value ? false : true,
      remarks: this.customerForm.get('remark')?.value || '',
    };

    console.log('Saving bill with payload:', payload);

    // Call the service to save the bill
    this.posConfiService.saveBill(payload).subscribe(
      (response: any) => {
        this.posConfiService.getBillByIdPdf(response.data.id).subscribe(
          (pdfResponse: Blob) => {
            const pdfUrl = URL.createObjectURL(pdfResponse);
            window.open(pdfUrl, '_blank');
            // const pdfUrl = URL.createObjectURL(pdfResponse);
            // const iframe = document.createElement('iframe');
            // iframe.style.display = 'none';
            // iframe.src = pdfUrl;
            // document.body.appendChild(iframe);
            // iframe.onload = () => {
            //   iframe.contentWindow?.print(); // Trigger print for the billing printer
            //   document.body.removeChild(iframe); // Clean up the iframe after printing
            // };
          },
          (error: any) => {
            console.error('Error fetching PDF:', error);
            alert('Failed to fetch the bill PDF. Please try again.');
          }
        );
        console.log('Bill saved successfully:', response);
        this.getAllBills();
        alert('Bill saved successfully!');
        this.newBill(); // Reset the form for a new bill
      },
      (error: any) => {
        console.error('Error saving bill:', error);
        alert('Failed to save the bill. Please try again.');
      }
    );
  }

  savePayment() {
    if (this.addCashPaymentForm.valid) {
      const paymentData = this.addCashPaymentForm.getRawValue();
      paymentData.paymentDate = new Date(paymentData.paymentDate).toISOString();
      console.log('paymentData: ', paymentData);

      // Comment out the API call
      // this.http.post('/api/payments', paymentData).subscribe(
      //   (response: any) => {
      //     console.log('Payment saved successfully:', response);
      //   },
      //   (error: any) => {
      //     console.error('Error saving payment:', error);
      //     alert('Failed to save payment. Please try again.');
      //   }
      // );

      // Add the payment to the table directly
      this.payments.push(paymentData);
      this.newlyAddedPaymentRowIndex = this.payments.length - 1;
      setTimeout(() => (this.newlyAddedPaymentRowIndex = null), 1000);

      // Reset the form
      this.addCashPaymentForm.get('amount')?.setValue('');
      this.addCashPaymentForm.get('vendorName')?.setValue('');
      this.addCashPaymentForm.get('remarks')?.setValue('');
    } else {
      alert('Please fill in all required fields.');
    }
  }

  onPaymentRowSelect(index: number) {
    this.selectedPaymentRowIndex = index; // Highlight the selected row
  }

  newBill() {
    this.orders = [];
    this.selectedRowIndex = null;
    this.inputQty = '';
    this.customerForm.reset();
    this.paymentForm.reset();
    this.todayDate.setValue(this.formatDate(new Date()));
    this.subtotalAmount = 0;
    this.selectedPlatform = 1;
  }
  onItemSelect(item: any) {
    console.log('Selected item:', item);
    this.addItemToOrder(item);
  }

  getDeliveryBoys() {
    this.posConfiService.getDeliveryBoys().subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.length > 0) {
          this.allDeliveryBoys = response.data;
        }
      },
      (error: any) => {
        console.error('Error fetching delivery', error);
      })
  }


  saveOtherCharges() {
    const otherChargesAmount = this.otherChargesForm.get('amount')?.value;

    if (otherChargesAmount > 0) {
      const otherChargesItem = {
        id: 'other-charges', // Unique ID for other charges
        name: 'Other Charges',
        rate: otherChargesAmount,
        qty: 1,
        total: otherChargesAmount
      };

      // Add the other charges to the orders table
      this.orders.push(otherChargesItem);
      this.calculateTotalAmount(); // Recalculate the total amount
    }
  }
  
  getAllBills() {
    console.log(this.formatDate(new Date()), "this.formatDate(new Date())")
    this.posConfiService.getAllBills(this.todayDate.value).subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.length > 0) {
          this.allBillsIds = response.data
          this.allBillsIds = response.data
          .map((bill: any) => ({ id: bill.id, billingId: bill.billingId }))
          .sort((a: any, b: any) => a.billingId - b.billingId); // Sort by billingId
      
        }
        console.log(this.allBillsIds,this.allBillsIds)
      },
      (error: any) => {
        console.error('Error fetching delivery', error);
      })
  }
  showBill(event: any) {
    console.log('event: ', event.target.value);
    this.selectedBillId = event.target.value;
    this.posConfiService.getBillById(this.selectedBillId).subscribe(
      (response: any) => {
        this.orders = response.billingCalc.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          rate: item.price,
          qty: item.quantity,
          total: item.price * item.quantity
        }));

        // Update other fields on the billing screen
        this.subtotalAmount = parseFloat(response.subTotal);
        this.paymentForm.patchValue({
          bill: this.subtotalAmount,
          paid: this.subtotalAmount, // Assuming full payment for now
          balance: 0 // Assuming no balance for now
        });

        // this.customerForm.patchValue({
        //   name: response.branch.name || '',
        //   address: response.branch.address || '',
        //   remark: '' // Assuming no remarks in the response
        // });

        this.selectedOrderType.setValue(
          response.isTakeAway
            ? 'Take Away'
            : response.isHomeDelivery
              ? 'Home Delivery'
              : 'Table'
        );

      })
  }
}
