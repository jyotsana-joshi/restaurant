import { Component, ElementRef, ViewChild } from '@angular/core';
// Removed incorrect import as 'bootstrap' module does not export 'bootstrap'
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, forkJoin, Subscription, switchMap } from 'rxjs';
import { POSConfigurationService } from 'src/app/components/pos-configuration/pos-configuration.service';

@Component({
  selector: 'app-billing-screen',
  templateUrl: './billing-screen.component.html',
  styleUrls: ['./billing-screen.component.scss']
})
export class BillingScreenComponent {
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
  kotPaymentForm: any
  searchSub!: Subscription;
  todayDate: UntypedFormControl = new UntypedFormControl('');
  billDateToday: UntypedFormControl = new UntypedFormControl('');
  subtotalAmount = 0;
  isLoading = false;
  selectedOrderType: UntypedFormControl = new UntypedFormControl('Table');
  otherChargesForm: any
  missingDetailsMessage: string = '';
  branchId: any = null
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
  selectedBillId = '';
  pendingBills: any[] = []; // Store all pending bills
  pendingBillsIds: any[] = []; // Store all pending bills
  selectedPendingBill: any = null; // Store the selected pending bill
  selectedPendingBillItems: any[] = []; // Store items of the selected pending bill
  selectedPendingBillIndex: number | null = null; // To track the selected row
  reportForm!: FormGroup;
  selectedReport: string = '';
  apiName: string = '';
  isGeneratingReport: boolean = false;
  isLoadingPayments: boolean = false;
  selectedPayment: any = null; // To store the selected payment for editing
  isSavingPayment: boolean = false; // For the "Save" button
  isUpdatingPayment: boolean = false; // For the "Update" button
  isDeletingPayment: boolean = false;
  disOption: any = [
    { value: '%', id: '%' },
    { value: 'AED', id: 'AED' }]
  discountFormControl: UntypedFormControl = new UntypedFormControl('%');
  loader = false;
  transactionType: UntypedFormControl = new UntypedFormControl('1');
  userRole: any = '';
  lastBillGenerated: any = null; // To store the last bill generated
  allBranches: any[] = [];
  isBranchSelected: boolean = false;
  constructor(private posConfiService: POSConfigurationService, private fb: FormBuilder, private toastr: ToastrService) {
    const value = localStorage.getItem('userDetails');
    this.userRole = this.posConfiService.getUserRole();
    if (this.userRole === 'cashier') {
      this.todayDate.disable(); // 🔒 disables the control
      this.isBranchSelected = true;
      
    }else{
      this.posConfiService.getBranches().subscribe(
        (response: any) => {
          this.allBranches = response.data.branches;
        },
        (error: any) => {
          console.error('Error fetching branches:', error);
        }
      );
    }
    const now = new Date();
    const formattedDate = this.formatDate(now); // DD/MM/YYYY
    this.todayDate.setValue(formattedDate);
    this.billDateToday.setValue(formattedDate);
    this.posConfiService.getUser(value).subscribe(
      (response: any) => {
        console.log(response, "responsee");
        this.userDetails = response.data.user;
        const localBranch = localStorage.getItem('branchId');
        this.branchId = this.userDetails?.branch?.id || localBranch || null;
        if(this.branchId) {
          this.isBranchSelected = true;
          this.getDeliveryBoys();
          this.getAllBills();
        }
        if((this.userRole === 'admin' || this.userRole === 'manager') && !this.branchId) {
           const modal = new bootstrap.Modal(document.getElementById('missingBranch')!);
          modal.show();
        return;
        }
      }
    )
    this.getCategories();
    this.getTransactionTypes();
    this.otherChargesForm = this.fb.group({
      amount: [0] // Default value for other charges
    });
    this.reportForm = this.fb.group({
      from: [formattedDate],
      to: [formattedDate],
      isHalfDay: [false]
    });
  }

  selectBranch(event:any){
    console.log(event.target.value, "event.target.value")
    const selectedBranchId = event.target.value;
    this.branchId = selectedBranchId;
  }

  branchSelected() {
    localStorage.setItem('branchId', this.branchId);
    this.isBranchSelected = true;
    this.getDeliveryBoys();
    this.getAllBills();
  }
  ngOnInit() {
    this.customerForm = this.fb.group({
      customerId: [],
      mobile: [],
      name: [],
      address: [],
      remark: [],
      deliveryBoy: []
    });
    
    this.paymentForm = this.fb.group({
      bill: [null],
      paid: [null],
      balance: [null],
      card: [null],
      cash: [null]
    });

    this.kotPaymentForm = this.fb.group({
      isTakeAway: [false], // Add the missing control with af default value
      isHomeDelivery: [false], // Add other controls as needed
      paymentMode: ['Cash'], // Example control for payment mode
      subTotal: [0],
      cash: [0],
      card: [0],
      paid: [0],
      bal: [0],
      customerName: [''],
      discount: [0]
    })
    this.paymentForm.get('paid')?.valueChanges.subscribe(() => {
      this.updateBalance();
    });

    this.kotPaymentForm.get('paid')?.valueChanges.subscribe((paidValue: number) => {
      const subTotal = this.kotPaymentForm.get('subTotal')?.value || 0;
      const balance = subTotal - paidValue; // Calculate the balance
      this.kotPaymentForm.patchValue({ bal: balance === 0 ? balance : -balance }, { emitEvent: false }); // Update balance
    });

    this.todayDate.valueChanges.subscribe((date: Date) => {
      this.allBillsIds = [];
      this.getAllBills();
    });

    this.billDateToday.valueChanges.subscribe((date: Date) => {
      this.pendingBills = [];
      this.getAllPendingBills();
    });

    this.paymentForm.get('cash')?.valueChanges.subscribe((cashValue: number) => {
      if (cashValue) {
        const subtotal = this.paymentForm.get('bill')?.value || 0;
        const remaining = subtotal - cashValue;
        this.paymentForm.patchValue({ card: remaining >= 0 ? remaining : 0 }, { emitEvent: false });
      } else {
        this.paymentForm.patchValue({ card: null }, { emitEvent: false });
      }
    });

    this.paymentForm.get('card')?.valueChanges.subscribe((cardValue: number) => {
      if (cardValue) {
        const subtotal = this.paymentForm.get('bill')?.value || 0;
        const remaining = subtotal - cardValue;
        this.paymentForm.patchValue({ cash: remaining >= 0 ? remaining : 0 }, { emitEvent: false });
      } else {
        this.paymentForm.patchValue({ cash: null }, { emitEvent: false });

      }
    });

    // this.kotPaymentForm.get('cash')?.valueChanges.subscribe((cashValue: number) => {
    //   if(cashValue){
    //     const subtotal = this.kotPaymentForm.get('bill')?.value || 0;
    //     const remaining = subtotal - cashValue;
    //     this.kotPaymentForm.patchValue({ card: remaining >= 0 ? remaining : 0 }, { emitEvent: false });
    //   }else{
    //     this.kotPaymentForm.patchValue({ card: null }, { emitEvent: false });
    //   }
    // });

    // this.kotPaymentForm.get('card')?.valueChanges.subscribe((cardValue: number) => {
    //  if(cardValue){
    //    const subtotal = this.kotPaymentForm.get('bill')?.value || 0;
    //    const remaining = subtotal - cardValue;
    //    this.kotPaymentForm.patchValue({ cash: remaining >= 0 ? remaining : 0 }, { emitEvent: false });
    //   }else{
    //    this.kotPaymentForm.patchValue({ cash: null }, { emitEvent: false });

    //   }
    // });
    this.searchSub = this.customerForm.get('mobile')?.valueChanges
      .pipe(
        debounceTime(300), // wait 300ms after typing stops
        distinctUntilChanged(),
        switchMap(value => {
          if (!value || value === '') {
            this.customerForm.reset()
            return [];
          }
          return this.posConfiService.getCustomers({ offset: 0, limit: 10 }, value);
        })
      ).subscribe((data: any) => {
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
      paymentDate: [this.todayDate.getRawValue(), Validators.required],
      paymentTo: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      remarks: ['']
    });
    // this.addCashPaymentForm.get('paymentDate')?.valueChanges.subscribe((date: Date) => {
    //   // this.getAllPayments(date);
    // })
    this.discountFormControl.valueChanges.pipe(debounceTime(300)).subscribe((value: any) => {
      let amount
      const disValue = parseFloat(this.discountPercent?.value || 0)
      if (value === '%') {
        if (disValue < 0 || disValue > 100) {
          console.error('Invalid discount value. It should be between 0 and 100.');
          return;
        }
        amount = (this.subtotalAmount * disValue) / 100
      } else {
        amount = disValue
      }
      this.paymentForm.get('bill')?.setValue(this.subtotalAmount - amount);
      this.paymentForm.get('balance')?.setValue(this.subtotalAmount - amount);
      this.paymentForm.get('card')?.setValue(null, { emitEvent: false });
      this.paymentForm.get('cash')?.setValue(null, { emitEvent: false });
    })
    this.discountPercent.valueChanges.pipe(debounceTime(300)).subscribe((value: number) => {
      if (value < 0 || value > 100) {
        console.error('Invalid discount value. It should be between 0 and 100.');
        return;
      }
      let discountAmount = 0
      if (this.discountFormControl.value === 'AED') {
        discountAmount = value;
      } else {
        discountAmount = (this.subtotalAmount * value) / 100;
      }
      this.paymentForm.get('bill')?.setValue(this.subtotalAmount - discountAmount);
      this.paymentForm.get('balance')?.setValue(this.subtotalAmount - discountAmount);
      this.paymentForm.get('card')?.setValue((null), { emitEvent: false });
      this.paymentForm.get('cash')?.setValue((null), { emitEvent: false });
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
    // this.checkScrollPosition();
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
    this.selectedCategory = category.name;
    this.posConfiService.getItemByCategoryId(category.id).subscribe(
      (response: any) => {
        if (response.data.length > 0) {
          this.categoryItems = response.data
        } else {
          this.categoryItems = [];
        }
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
    const disValue = parseFloat(this.discountPercent?.value || 0)
    const value = this.discountFormControl.value;
    let amount = 0
    if (value === '%') {
      if (disValue < 0 || disValue > 100) {
        console.error('Invalid discount value. It should be between 0 and 100.');
        return;
      }
      amount = (this.subtotalAmount * disValue) / 100
    } else {
      amount = disValue
    }
    this.paymentForm.get('bill')?.setValue((this.subtotalAmount - amount).toFixed(2));
    this.paymentForm.get('balance')?.setValue((this.subtotalAmount - amount).toFixed(2));

    // Update balance also
    // this.updateBalance();
  }


  onNumpadClick(key: string) {
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
    // Update the subtotal
    this.calculateTotalAmount();
  }
  onRowSelect(index: number) {
    this.selectedRowIndex = index;
    this.inputQty = ''; // Reset numpad input
  }
  removeOrder(index: number) {
    this.orders.splice(index, 1);
  }

  ontransactionTypeSelect(event: any) {
    this.selectedPlatform = event.target.value;
    this.orders.forEach(order => {
      const platformPriceObj = order?.price?.find((p: any) => p?.platFormId == this.selectedPlatform);
      if (platformPriceObj) {
        const price = platformPriceObj ? platformPriceObj.price : 0;
        order.rate = price;
        this.updateOrderTotal(order);
      }
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

    const saveBillPayload = () => {
      console.log('this.selectedPlatform: ', this.selectedPlatform);
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
          card: this.selectedPlatform == 3 ? this.paymentForm.get('card')?.value : 0,
          cash: this.selectedPlatform == 3 ? this.paymentForm.get('cash')?.value : 0
        },
        isTakeAway: this.selectedOrderType.value === 'Take Away',
        isHomeDelivery: this.selectedOrderType.value === 'Home Delivery',
        subTotal: this.subtotalAmount,
        discount: this.discountPercent?.value || 0,
        deliveryBoyId: this.customerForm.get('deliveryBoy')?.value || null,
        branchId: this.branchId, // Replace with actual branch ID if dynamic
        paymentMethodId: this.selectedPlatform, // Assuming selectedPlatform holds the payment method ID
        table: this.selectedOrderType.value === 'Table',
        customerId: customerId ?? null,
        paid: this.paymentForm.get('paid')?.value ?? 0,
        bill: this.paymentForm.get('bill')?.value ?? null,
        isPendingPayment: this.subtotalAmount === this.paymentForm.get('paid')?.value ? false : true,
        remarks: this.customerForm.get('remark')?.value || '',

      };

      // Call the saveBill API
      this.posConfiService.saveBill(payload).subscribe(
        (response: any) => {
          this.printBill(response?.data?.id);
          this.getAllBills();
          this.toastr.success('Bill saved successfully')
          this.newBill(); // Reset the form for a new bill
        },
        (error: any) => {
          this.toastr.error(error.error.message, 'Error')
        }
      );
    };

    const customerPayload = {
      name: customerName,
      phone: customerMobile,
      address: this.customerForm.get('address')?.value,
      isActive: true
    };
    // If customerId is not found, create the customer first
    if (!customerId && (customerName || customerMobile)) {
      this.posConfiService.addCustomer(customerPayload).subscribe(
        (response: any) => {
          this.customerForm.patchValue({
            customerId: response.data.id
          });
          saveBillPayload(); // Call saveBill after customer creation
        },
        (error: any) => {
          this.toastr.error(error.error.message, 'Error')
        }
      );
    } else {
      saveBillPayload(); // Directly call saveBill if customerId exists
    }
  }

  printBill(bill: any) {
    const id = bill.id || bill; // Ensure id is defined
    this.posConfiService.getBillByIdPdf(id).subscribe(
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
        this.toastr.error(error.error.message, 'Error')
      }
    );
  }
  savePayment() {
    if (this.addCashPaymentForm.valid) {
      const paymentData = this.addCashPaymentForm.getRawValue();
      paymentData.branchId = this.branchId; // Add branch ID to the payment data
      paymentData.amount = parseFloat(paymentData?.amount);
      const paymentId = this.selectedPayment ? this.selectedPayment.id : null;
      // Comment out the API call
      if (paymentId) {
        this.isUpdatingPayment = true;
        this.posConfiService.updatePayments(paymentId, paymentData).subscribe(
          (response: any) => {
            this.isUpdatingPayment = false;
          },
          (error: any) => {
            this.isUpdatingPayment = false;
            this.toastr.error(error.error.message, 'Error')
          }
        );
      } else {
        this.isSavingPayment = true;
        this.posConfiService.createPayments(paymentData).subscribe(
          (response: any) => {
            this.isSavingPayment = false;
          },
          (error: any) => {
            this.isSavingPayment = false;
            this.toastr.error(error.error.message, 'Error')
          }
        );
      }

      setTimeout(() => (this.newlyAddedPaymentRowIndex = null), 1000);
      setTimeout(() => {
        this.getAllPayments();
      }, 1000);
      // Reset the form
      this.addCashPaymentForm.get('amount')?.setValue(0);
      this.addCashPaymentForm.get('paymentTo')?.setValue('');
      this.addCashPaymentForm.get('remarks')?.setValue('');
    } else {
      this.toastr.warning('Please fill the required details')
    }
  }

  deletePayment() {
    this.isDeletingPayment = true;
    this.posConfiService.deletePayments(this.selectedPayment.id).subscribe(
      (response: any) => {
        this.isDeletingPayment = false;
        const index = this.payments.findIndex(payment => payment.id === this.selectedPayment.id);
        this.payments.splice(index, 1); // Remove the payment from the array
        this.resetPaymentForm(); // Reset the form after deletion
      },
      (error: any) => {
        this.isDeletingPayment = false;
        this.toastr.error(error.error.message, 'Error')
      }
    );
  }

  getAllPayments() {
    const paymentDate = this.addCashPaymentForm.get('paymentDate').getRawValue();
    this.payments = [];
    this.isLoadingPayments = true;
    this.posConfiService.getAllPayments(paymentDate).subscribe(
      (response: any) => {
        this.isLoadingPayments = false;
        if (response.data.length > 0) {
          this.payments = response.data
        }
      },
      (error: any) => {
        this.isLoadingPayments = false;
      });
  }

  onPaymentRowSelect(index: number) {
    this.selectedPaymentRowIndex = index; // Highlight the selected row
    this.selectedPayment = this.payments[index]; // Get the selected payment
    // Populate the paymentForm with the selected payment's details
    this.addCashPaymentForm.patchValue({
      paymentDate: this.selectedPayment.paymentDate || this.todayDate.getRawValue(), // Use the current date if paymentDate is not available
      paymentTo: this.selectedPayment.paymentTo || '',
      amount: this.selectedPayment.amount || 0,
      remarks: this.selectedPayment.remarks || ''
    });
  }

  resetPaymentForm() {
    this.addCashPaymentForm.reset();
    this.addCashPaymentForm.get('paymentDate')?.setValue(this.todayDate.getRawValue()); // Reset to today's date
    this.selectedPaymentRowIndex = null; // Clear the selected row index
  }

  newBill() {
    this.orders = [];
    this.selectedRowIndex = null;
    this.inputQty = '';
    this.customerForm.reset();
    this.paymentForm.reset();
    this.todayDate.setValue(this.formatDate(new Date()));
    this.subtotalAmount = 0;
    this.discountPercent.setValue(0);
    this.discountFormControl.setValue('%');
    this.selectedOrderType.setValue('Table');
    this.transactionType.setValue('1');
    this.selectedBillId = ''
  }
  onItemSelect(item: any) {
    this.addItemToOrder(item);
  }

  getDeliveryBoys() {
    this.posConfiService.getDeliveryBoys().subscribe(
      (response: any) => {
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
    this.posConfiService.getAllBills(this.todayDate.getRawValue(), this.branchId).subscribe(
      (response: any) => {
        if (response.data.length > 0) {
          this.allBillsIds = response.data
          this.allBillsIds = response.data
            .map((bill: any) => ({ id: bill.id, billingId: bill.billingId }))
            .sort((a: any, b: any) => a.billingId - b.billingId); // Sort by billingId
          this.lastBillGenerated = this.allBillsIds[this.allBillsIds.length - 1]; // Store the last bill generated
          console.log(this.lastBillGenerated, "lastBillGenerated")
        }
      },
      (error: any) => {
        console.error('Error fetching delivery', error);
      })
  }

  getAllPendingBills() {
    this.loader = true;
    this.pendingBills = [];
    this.posConfiService.getAllBills(this.billDateToday.value, this.branchId, true).subscribe(
      (response: any) => {
        if (response.data.length > 0) {
          this.loader = false;
          this.pendingBills = response.data.map((item: any) => {
            item.orderType = item.isTakeAway ? 'TW' : item.isHomeDelivery ? 'HD' : 'Direct Bill';
            return item;
          })
          this.pendingBillsIds = response.data
            .map((bill: any) => ({ id: bill.id, billingId: bill.billingId }));
        } else {
          this.loader = false;
          this.pendingBills = [];
        }
      },
      (error: any) => {
        this.loader = false;
        console.error('Error fetching delivery', error);
      })
  }

  showPendingBillItems(bill: any) {
    console.log('bill: ', bill);
    this.selectedPendingBill = bill; // Set the selected bill
    this.selectedPendingBillItems = bill.billingCalc.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      rate: item.price,
      qty: item.quantity,
      total: item.price * item.quantity
    }));


    const discountMin = parseFloat(bill.subTotal) - parseFloat(bill.discount)
    this.kotPaymentForm.patchValue({
      isTakeAway: bill.isTakeAway, // Add the missing control with a default value
      isHomeDelivery: bill.isHomeDelivery, // Add other controls as needed
      paymentMode: bill.paymentMethod.name, // Example control for payment mode
      subTotal: discountMin,
      cash: bill?.billingCalc?.cash,
      card: bill?.billingCalc?.card,
      paid: 0,
      bal: -discountMin,
      customerName: [''],
      discount: bill.discount || 0
    })
  }
  onPendingBillSelect(index: number, bill: any) {
    this.selectedPendingBillIndex = index; // Highlight the selected row
    this.showPendingBillItems(bill) // Set the selected bill
  }
  receivePayment(isReceiveAll: boolean = false) {
    if (isReceiveAll) {
      const cashPaymentMode = this.allTransactionTypes.find(
      (type: any) => type.name.toLowerCase() === 'cash'
    );

    if (!cashPaymentMode) {
      this.toastr.error('Cash payment method not found');
      return;
    }

    console.log('cashPaymentMode: ', cashPaymentMode, this.pendingBills);
    const updateRequests = this.pendingBills.map((bill: any) => {
      console.log(bill, "bill")
      const updatedBill = {
        id: bill.id,
        isPendingPayment: false,
        paid: bill.subTotal || 0,
        bal: 0,
        paymentMethodId: cashPaymentMode.id
      };
      return this.posConfiService.updateBill(updatedBill.id, updatedBill);
    });
    forkJoin(updateRequests).subscribe(
      (responses: any[]) => {
        this.toastr.success('All bills updated successfully');
        this.getAllPendingBills(); // Refresh the pending bills list
        this.kotPaymentForm.reset();
        this.selectedPendingBill = null;
        this.selectedPendingBillItems = [];
      },
      (error: any) => {
        this.toastr.error(error?.error?.message || 'Error updating all bills');
      }
    );
    return;
    }       
    const paymentModeName = this.kotPaymentForm.get('paymentMode')?.value;
    // Find the corresponding payment mode ID from allTransactionTypes
    const paymentMode = this.allTransactionTypes.find(
      (type: any) => type.name === paymentModeName
    );
    if (!this.selectedPendingBill) {
      this.toastr.error('Please select the pending bill')
      return;
    }
    const paid = this.kotPaymentForm.get('paid')?.value
    if (paid <= 0) {
      this.toastr.error('Please enter valid paid amount')
      return;
    }
    // Prepare the updated bill payload
    const updatedBill = {
      id: this.selectedPendingBill.id, // Use the ID of the selected pending bill 
      isPendingPayment: this.kotPaymentForm.get('bal')?.value == 0 ? false : true, // Mark payment as completed
      paid: paid || 0, // Get the paid amount
      bal: this.kotPaymentForm.get('bal')?.value || 0, // Get the balance,
      paymentMethodId: paymentMode ? paymentMode.id : null, // Use the ID of the selected payment mode  
    };

    // Call the update API
    this.posConfiService.updateBill(updatedBill.id, updatedBill).subscribe(
      (response: any) => {
        this.getAllPendingBills(); // Refresh the pending bills list
        this.selectedPendingBill = null; // Clear the selected bill
        this.selectedPendingBillItems = []; // Clear the items
        this.kotPaymentForm.reset(); // Reset the form
      },
      (error: any) => {
        this.toastr.error(error.error.message, 'Error')
      }
    );
  }

  showBill(event: any) {
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
        this.transactionType.setValue(response.paymentMethodId);
        this.subtotalAmount = parseFloat(response.subTotal);
        const discountMin = this.subtotalAmount - parseFloat(response?.discount)
        this.paymentForm.patchValue({
          bill: discountMin,
          paid: response?.isPendingPayment ? 0 : discountMin, // Assuming full payment for now
          balance: response?.isPendingPayment ? discountMin : 0, // Assuming no balance for now
          
        });
        console.log(this.userRole, "this.userRole")
        if(this.userRole === 'cashier'){
          this.paymentForm.get('paid').disable();
          this.paymentForm.get('balance').disable();
          this.paymentForm.get('bill').disable();
          this.discountPercent.disable();
        }
        const customerDetails = response.customer
        this.customerForm.patchValue({
          customerId: [customerDetails?.id],
          mobile: [customerDetails?.phone],
          name: [customerDetails?.name],
          address: [customerDetails?.address],
          remark: [response?.remarks],
          deliveryBoy: [response?.deliveryBoyId]
        },
          { emitEvent: false });
        this.discountPercent.setValue(parseInt(response?.discount), { emitEvent: false })
        this.selectedOrderType.setValue(
          response.isTakeAway
            ? 'Take Away'
            : response.isHomeDelivery
              ? 'Home Delivery'
              : 'Table'
        );

      })
  }
  showPendingBills(event: any) {
    console.log('event: ', event.target.value);
    const selectedPendingBillId = event.target.value;

    // Find the selected bill in the pending bills list
    console.log('this.pendingBills: ', this.pendingBills);
    const selectedBill = this.pendingBills.find((bill: any) => bill.id === parseInt(selectedPendingBillId, 10));
    console.log('selectedBill: ', selectedBill);

    if (selectedBill) {
      // Highlight the selected bill in the pending bills section
      this.selectedPendingBillIndex = this.pendingBills.indexOf(selectedBill);

      // Display the items of the selected bill
      this.showPendingBillItems(selectedBill);
    } else {
      console.error('Selected bill not found in pending bills.');
    }
  }
  updateBill() {
    let payload = {
      isTakeAway: this.selectedOrderType.value === 'Take Away',
      isHomeDelivery: this.selectedOrderType.value === 'Home Delivery',
      deliveryBoyId: this.customerForm.get('deliveryBoy')?.value[0] || null,
      paymentMethodId: this.selectedPlatform, // Assuming selectedPlatform holds the payment method ID
      table: this.selectedOrderType.value === 'Table',
    }
    this.posConfiService.updateBill(this.selectedBillId, payload).subscribe(
      (response: any) => {
        if(this.userRole === 'cashier'){
          this.paymentForm.get('paid').enable();
          this.paymentForm.get('balance').enable();
          this.paymentForm.get('bill').enable();
          this.discountPercent.enable();
        }
        this.toastr.success('Bill updated successfuly', 'Success');
        this.newBill();
      },
      (error) => {
        this.toastr.success(error.error.message, 'Error')
      }
    )
  }
  openReportModal(reportType: string, apiName: string) {
    this.apiName = '';
    this.selectedReport = reportType; // Set the selected report type
    this.apiName = apiName;
    const reportModal = new bootstrap.Modal(document.getElementById('reportModal')!);
    reportModal.show(); // Show the modal
  }

  generateReport() {
    const formData = this.reportForm.value;
    this.isGeneratingReport = true;
    this.posConfiService.generateFinalReport(formData, this.apiName).subscribe(
      (pdfResponse: Blob) => {
        this.isGeneratingReport = false;
        const reportModalElement = document.getElementById('reportModal')!;
        const reportModal = bootstrap.Modal.getInstance(reportModalElement) || new bootstrap.Modal(reportModalElement);
        reportModal.hide();
        const pdfUrl = URL.createObjectURL(pdfResponse);
        window.open(pdfUrl, '_blank');
      }, (error: any) => {
        this.isGeneratingReport = false;
        this.toastr.success(error.error.message, 'Error')
      }
    )
  }

  onDateSelect(event: any) {
    console.log('event: ', event);
    this.getAllPayments()
  }

  changeTab(tab: any) {
    this.selectedSection = tab;
    this.selectedPendingBillIndex = null,
      this.selectedPendingBill = [];
    this.selectedPendingBillItems = [];
    this.billDateToday.setValue(this.formatDate(new Date()))
    this.newBill();
    if (this.selectedSection === 'kot') {
      this.getAllPendingBills();
    }
    if (this.selectedSection === 'payments') {
      this.getAllPayments();
    }
  }
}
