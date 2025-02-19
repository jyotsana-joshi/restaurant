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

  getUser(userId:any) {
    return this.httpClient.get(`${this.ApiUrl}user/${userId}`);
  }
  
  getUsers() {
    return this.httpClient.get(`${this.ApiUrl}user?offset=0&limit=10&orderDir=ASC&orderBy=id`);
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
    return this.httpClient.get(`${this.ApiUrl}branches?offset=0&limit=10&orderDir=ASC&orderBy=id`);
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
    return this.httpClient.get(`${this.ApiUrl}outlet-menu?offset=0&limit=10&orderDir=ASC&orderBy=id`);
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
    return this.httpClient.get(`${this.ApiUrl}sub-menu?offset=0&limit=10&orderDir=ASC&orderBy=id`);
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

  getTransactionTypes() {
    return this.httpClient.get(`${this.ApiUrl}tran-type?offset=0&limit=10&orderDir=ASC&orderBy=id`);
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
    return this.httpClient.get(`${this.ApiUrl}tran-type?offset=0&limit=10&orderDir=DESC&orderBy=id`);
  }
}
