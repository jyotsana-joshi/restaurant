import { Component, ElementRef, ViewChild } from '@angular/core';
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
  orders: any[] = [];
  paymentOptions: string[] = ['Cash', 'Credit Card', 'Cash & Card', 'Advance', 'Uber Eats', 'Talabat', 'Zomato'];
  currentDate: string = new Date().toLocaleDateString();
  selectedCategory: string | null = null;
  selectedTab: string = ''

  allCategories: any[] = [];
  isAtTop = true;
  isAtBottom = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  scrollAmount = 50; // px per click
  constructor(private posConfiService: POSConfigurationService) {

   }
  ngOnInit() {
    this.getCategories();
  }
  
  ngAfterViewInit() {
    this.checkScrollPosition();
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
  getCategories() {
    this.posConfiService.getCategories().subscribe(
      (response: any) => {
        if (response.data.outletMenu.length > 0) {
          this.allCategories = response.data.outletMenu;
        }
      },
      (error) => {
    
      })
  }
  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  selectTab(tab: string) {
    console.log('Selected Tab:', tab);
    this.selectedTab = tab;
  }

  addItemToOrder(item: string) {
    const existingOrder = this.orders.find(order => order.name === item);
    if (existingOrder) {
      existingOrder.qty++;
      this.updateOrderTotal(existingOrder);
    } else {
      this.orders.push({ name: item, rate: 10, qty: 1, total: 10 });
    }
  }

  updateOrderTotal(order: any) {
    order.total = order.rate * order.qty;
  }

  removeOrder(index: number) {
    this.orders.splice(index, 1);
  }

  saveAndPrint() {
    console.log('Saving and printing the bill...');
  }

  newBill() {
    this.orders = [];
    console.log('New bill started.');
  }
}
