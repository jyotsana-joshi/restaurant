import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { AddUserDialogComponent } from '../modals/add-user-dialog/add-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface PeriodicElement {
  id: number;
  name: string;
  work: string;
  project: string;
  priority: string;
  badge: string;
  budget: string;
}

const ELEMENT_DATA = [
  {id: 1, name: 'Deep Javiya', outletName: 'Bhavana Restuarant', mobile: '8954478415', userName: 'deep12', designation: 'Cashier', userType: 'Billing', registeredAt: '12/01/2025', active: 'Yes' },
 ];
@Component({
  selector: 'app-outlet-user',
  templateUrl: './outlet-user.component.html',
  styleUrls: ['./outlet-user.component.scss']
})
export class OutletUserComponent {
  displayedColumns: string[] = ['id', 'name', 'outletName', 'mobile', 'userName', 'designation', 'userType', 'registeredAt', 'active', 'actions'];
  dataSource = ELEMENT_DATA;
  // displayedColumns: string[] = ['id', 'assigned', 'name', 'priority', 'budget'];

  loading = false;

  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getUsers();
  }
  getUsers() {
    this.loading = true;
    this.posConfiService.getUsers().subscribe(
      (response: any) => {
        this.loading = false;
        this.dataSource = response.users
        console.log(response, "responseee");
        this.dataSource.map((el:any) =>{
          el.loading = false;
        });
      },
      (error) => {
        this.loading = false;
        console.log(error, "error")
      })
  }
  addUser() {
    this.posConfiService.addUser({}).subscribe(
      (response: any) => {
        console.log(response, "response")
      },
      (error: any) => {
        console.log(error, "error")
      }
    )
  }
  openAddUserPopup(){
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '600px',
      height:'auto'
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result) {
        console.log('User added:', result);
        // Handle the result, e.g., send it to the server
      }
    });
  }
  edit(element: any): void {
    console.log('Edit:', element);
    // Implement your edit logic here
  }
  deleteUser(){
    
  }
}
