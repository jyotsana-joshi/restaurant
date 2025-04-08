import { Component } from '@angular/core';

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