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
  kotPaymentForm: any
  searchSub!: Subscription;
  todayDate: UntypedFormControl = new UntypedFormControl('');
  billDateToday: UntypedFormControl = new UntypedFormControl('');
  subtotalAmount = 0;
  isLoading = false;
  selectedOrderType: UntypedFormControl = new UntypedFormControl('Table');
  otherChargesForm: any
  missingDetailsMessage: string = '';
  branchId: any
  userDetails: any;
  selectedSection: string = 'payments';
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
  reportForm: FormGroup;
  selectedReport: string = '';
  apiName: string = '';
  isGeneratingReport: boolean = false;
  isLoadingPayments: boolean = false;
  selectedPayment: any = null; // To store the selected payment for editing
  isSavingPayment: boolean = false; // For the "Save" button
  isUpdatingPayment: boolean = false; // For the "Update" button
  isDeletingPayment: boolean = false; 
  constructor(private posConfiService: POSConfigurationService, private fb: FormBuilder) {
    const value = localStorage.getItem('userDetails');
    const now = new Date();
    const formattedDate = this.formatDate(now); // DD/MM/YYYY
    this.todayDate.setValue(formattedDate);
    this.billDateToday.setValue(formattedDate);
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
    this.reportForm = this.fb.group({
      from: [formattedDate],
      to: [formattedDate],
      isHalfDay: [false]
    });
  }
  ngOnInit() {

    this.getAllPendingBills();
    this.customerForm = this.fb.group({
      customerId: [],
      mobile: [],
      name: [],
      address: [],
      remark: [],
      deliveryBoy: []
    });
    this.getDeliveryBoys();
    this.getAllBills()

    this.paymentForm = this.fb.group({
      bill: null,
      paid: null,
      balance: null,
    });

    this.kotPaymentForm = this.fb.group({
      isTakeAway: [false], // Add the missing control with a default value
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
      paymentTo: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      remarks: ['']
    });
    this.getAllPayments();
    this.addCashPaymentForm.get('payamentDate')?.valueChanges.subscribe((date: Date) => {
      this.getAllPayments();
    })
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
      const platformPriceObj = order.price.find((p: any) => p.platFormId == this.selectedPlatform);
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
      customerId: customerId ?? null,
      paid: this.paymentForm.get('paid')?.value ?? 0,
      bal: this.paymentForm.get('bill')?.value ?? null,
      isPendingPayment: this.subtotalAmount === this.paymentForm.get('paid')?.value ? false : true,
      remarks: this.customerForm.get('remark')?.value || '',
    };

    console.log('Saving bill with payload:', payload);

    // Call the service to save the bill
    this.posConfiService.saveBill(payload).subscribe(
      (response: any) => {
        this.printBill(response?.data?.id);
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
        alert('Failed to fetch the bill PDF. Please try again.');
      }
    );
  }
  savePayment() {
    if (this.addCashPaymentForm.valid) {
      const paymentData = this.addCashPaymentForm.getRawValue();
      paymentData.branchId = this.branchId; // Add branch ID to the payment data
      paymentData.amount = parseFloat(paymentData.amount);
      console.log('paymentData: ', paymentData,this.selectedPayment);
      const paymentId = this.selectedPayment ? this.selectedPayment.id : null;
      // Comment out the API call
      if(paymentId) {
        this.isUpdatingPayment = true;
        this.posConfiService.updatePayments(paymentId,paymentData).subscribe(
          (response: any) => {
            this.isUpdatingPayment = false;
            console.log('Payment saved successfully:', response);
          },
          (error: any) => {
            this.isUpdatingPayment = false;
            console.error('Error saving payment:', error);
            alert('Failed to save payment. Please try again.');
          }
        );
      }else{
        this.isSavingPayment = true;
        this.posConfiService.createPayments(paymentData).subscribe(
          (response: any) => {
          this.isSavingPayment = false;
            console.log('Payment saved successfully:', response);
          },
          (error: any) => {
            this.isSavingPayment = false;
            console.error('Error saving payment:', error);
            alert('Failed to save payment. Please try again.');
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
      alert('Please fill in all required fields.');
    }
  }

  deletePayment() {
    this.isDeletingPayment = true;
    this.posConfiService.deletePayments(this.selectedPayment.id).subscribe(
      (response: any) => {
        this.isDeletingPayment = false;
        console.log('Payment deleted successfully:', response);
        const index = this.payments.findIndex(payment => payment.id === this.selectedPayment.id);
        this.payments.splice(index, 1); // Remove the payment from the array
        this.resetPaymentForm(); // Reset the form after deletion
      },
      (error: any) => {
        this.isDeletingPayment = false;
        console.error('Error deleting payment:', error);
        alert('Failed to delete payment. Please try again.');
      }
    );
  }
    
  getAllPayments(){
    this.payments = [];
    this.isLoadingPayments = true;
    this.posConfiService.getAllPayments().subscribe(
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
      paymentDate: this.selectedPayment.paymentDate || this.todayDate.value, // Use the current date if paymentDate is not available
      paymentTo: this.selectedPayment.paymentTo || '',
      amount: this.selectedPayment.amount || 0,
      remarks: this.selectedPayment.remarks || ''
    });
  }

  resetPaymentForm() {
    this.addCashPaymentForm.reset();
    this.addCashPaymentForm.get('paymentDate')?.setValue(this.todayDate.value); // Reset to today's date
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
        console.log(this.allBillsIds, this.allBillsIds)
      },
      (error: any) => {
        console.error('Error fetching delivery', error);
      })
  }

  getAllPendingBills() {
    this.posConfiService.getAllBills(this.billDateToday.value, true).subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.length > 0) {
          this.pendingBills = response.data;
          this.pendingBillsIds = response.data
            .map((bill: any) => ({ id: bill.id, billingId: bill.billingId }));
        } else {
          this.pendingBills = [];
        }
      },
      (error: any) => {
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

    const balance = -parseFloat(bill.subTotal);

    this.kotPaymentForm.patchValue({
      isTakeAway: bill.isTakeAway, // Add the missing control with a default value
      isHomeDelivery: bill.isHomeDelivery, // Add other controls as needed
      paymentMode: bill.paymentMethod.name, // Example control for payment mode
      subTotal: parseFloat(bill.subTotal),
      cash: [],
      card: [],
      paid: 0,
      bal: balance,
      customerName: [''],
      discount: bill.discount || 0
    })
  }
  onPendingBillSelect(index: number, bill: any) {
    this.selectedPendingBillIndex = index; // Highlight the selected row
    this.showPendingBillItems(bill) // Set the selected bill
    console.log('Selected Pending Bill:', bill);
  }
  receivePayment() {
    console.log('this.selectedPendingBill: ', this.selectedPendingBill);
    const paymentModeName = this.kotPaymentForm.get('paymentMode')?.value;
    // Find the corresponding payment mode ID from allTransactionTypes
    const paymentMode = this.allTransactionTypes.find(
      (type: any) => type.name === paymentModeName
    );
    if (!this.selectedPendingBill) {
      alert('Please select a pending bill first.');
      return;
    }
    const paid = this.kotPaymentForm.get('paid')?.value
    if(paid <= 0){
      alert('Please enter a valid paid amount.');
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
        alert('Payment received successfully!');
        this.getAllPendingBills(); // Refresh the pending bills list
        this.selectedPendingBill = null; // Clear the selected bill
        this.selectedPendingBillItems = []; // Clear the items
        this.kotPaymentForm.reset(); // Reset the form

      },
      (error: any) => {
        alert('Failed to update payment status. Please try again.');
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
        this.subtotalAmount = parseFloat(response.subTotal);
        this.paymentForm.patchValue({
          bill: this.subtotalAmount,
          paid: response?.isPendingPayment ? 0 : this.subtotalAmount, // Assuming full payment for now
          balance: response?.isPendingPayment ? this.subtotalAmount : 0 // Assuming no balance for now
        });
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
    this.posConfiService.getBillById(this.selectedBillId).subscribe(
      (response: any) => {

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
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please try again.');
      }

  )}
}
