import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class POSConfigurationService {

  ApiUrl = 'https://restro-back-end-production-8537.up.railway.app/v1/';
  userDetails$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(private httpClient: HttpClient) { }

  getUserRole(){
    return localStorage.getItem('userRole');
  }
  getUser(userId:any) {
    return this.httpClient.get(`${this.ApiUrl}user/${userId}`);
  }
  
  getUsers() {
    return this.httpClient.get(`${this.ApiUrl}user?offset=0&limit=1000&orderDir=ASC&orderBy=id`);
  }
  addUser(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}user/add`, payload);
  }

  editUser(payload: any, userId: any) {
    return this.httpClient.put(`${this.ApiUrl}user/${userId}`, payload);
  }
  deleteUser(userIds: any) {
    return this.httpClient.delete(`${this.ApiUrl}user`, { body: userIds });
  }
  getBranches() {
    return this.httpClient.get(`${this.ApiUrl}branches?offset=0&limit=500&orderDir=ASC&orderBy=id`);
  }
  addBranches(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}branches/add`, payload);
  }
  editBranches(payload: any, branchId: any) {
    return this.httpClient.put(`${this.ApiUrl}branches/${branchId}`, payload);

  }
  deleteBranches(branchIds: any) {
    return this.httpClient.delete(`${this.ApiUrl}branches`, { body: branchIds });
  }

  getCategories() {
    return this.httpClient.get(`${this.ApiUrl}outlet-menu?offset=0&limit=5000&orderDir=ASC&orderBy=id`);
  }

  addCategories(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}outlet-menu/add`, payload);
  }

  editCategories(payload: any, categoryId: any) {
    return this.httpClient.put(`${this.ApiUrl}outlet-menu/${categoryId}`, payload);
  }
  deleteCategories(categoryIds: any) {
    console.log('categoryIds: ', categoryIds);
    return this.httpClient.delete(`${this.ApiUrl}outlet-menu`, { body: categoryIds });

  }

  getItems() {
    return this.httpClient.get(`${this.ApiUrl}sub-menu?offset=0&limit=5000&orderDir=ASC&orderBy=id`);
  }

  addItem(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}sub-menu/add`, payload);
  }

  editItem(payload: any, itemId: any) {
    return this.httpClient.put(`${this.ApiUrl}sub-menu/${itemId}`, payload);
  }
  deleteItem(itemIds: any) {
    console.log('categoryIds: ', itemIds);
    return this.httpClient.delete(`${this.ApiUrl}sub-menu`, { body: itemIds });

  }

  getItemByCategoryId(categoryId: any) {
    return this.httpClient.get(`${this.ApiUrl}sub-menu/category/${categoryId}`);
  }

  getTransactionTypes() {
    return this.httpClient.get(`${this.ApiUrl}tran-type?offset=0&limit=500&orderDir=ASC&orderBy=id`);
  }

  addTransactionType(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}tran-type/add`, payload);
  }

  editTransactionType(payload: any, transactionId: any) {
    return this.httpClient.put(`${this.ApiUrl}tran-type/${transactionId}`, payload);
  }

  deleteTransactionType(transactionIds: any) {
    return this.httpClient.delete(`${this.ApiUrl}tran-type`, { body: transactionIds });

  }

  getDesignations() {
    return this.httpClient.get(`${this.ApiUrl}list/designations`);
  }

  getTransctionType(){
    return this.httpClient.get(`${this.ApiUrl}tran-type?offset=0&limit=500&orderDir=DESC&orderBy=id`);
  }

  getCustomers(params: { offset: number; limit: number }, search?:any) {
    let url = `${this.ApiUrl}customer-management?offset=${params.offset}&limit=${params.limit}&orderDir=ASC&orderBy=id`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.httpClient.get(url);
  }

  addCustomer(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}customer-management`, payload);
  }

  editCustomer(payload: any, customerId: any) {
    return this.httpClient.put(`${this.ApiUrl}customer-management/${customerId}`, payload);
  }
  deleteCustomer(customerIds: any) {
    console.log('categoryIds: ', customerIds);
    return this.httpClient.delete(`${this.ApiUrl}customer-management`, { body: customerIds });

  }

  getDeliveryBoys(){
      return this.httpClient.get(`${this.ApiUrl}list/delivery-boys`);
  }

  saveBill(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}billing`, payload);
  }

  getBillByIdPdf(billId: any) {
    return this.httpClient.get(`${this.ApiUrl}billing/${billId}/pdf`, { responseType: 'blob' });
  }

  getAllBills(date: any, branchId:any, isPending?: boolean) {
    let url = `${this.ApiUrl}billing?date=${date}&branchId=${branchId}`;
    if (isPending) {
      url += `&isPendingPayment=${isPending}`;
    }
    return this.httpClient.get(url);
  }

  getBillById(billId: any) {
    return this.httpClient.get(`${this.ApiUrl}billing/${billId}`);
  }

  updateBill(billingId: any, payload: any){
    return this.httpClient.put(`${this.ApiUrl}billing/${billingId}`, payload);
  }

  generateFinalReport(payload: any, api: any) {
    return this.httpClient.get(`${this.ApiUrl}billing/${api}?from=${payload.from}&to=${payload.to}&isHalfDay=${payload.isHalfDay}`, { responseType: 'blob' });
  }
  
  createPayments(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}payments`, payload);
  }
 
  updatePayments(id: any, payload: any) {
    return this.httpClient.put(`${this.ApiUrl}payments/${id}`, payload);
  }
  getAllPayments(date:any) {
    return this.httpClient.get(`${this.ApiUrl}payments?date=${date}`);
  }
  deletePayments(paymentIds: any) {
    return this.httpClient.delete(`${this.ApiUrl}payments/${paymentIds}`);
  }

  // Branch Menu Management
  updateBranchMenu(payload: any) {
    return this.httpClient.post(`${this.ApiUrl}branch-menu/update`, payload);
  }

  getBranchMenu(branchId: any) {
    return this.httpClient.get(`${this.ApiUrl}branch-menu/${branchId}`);
  }
}
