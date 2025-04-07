import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { MatDialog } from '@angular/material/dialog';
import { ItemDialogComponent } from '../modals/item-dialog/item-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {
  displayedColumns: string[] = ['id', 'name', 'email', 'address','phone','birthDate','anniversaryDate0','active', 'actions'];
  dataSource:any = [];
  platforms: string[] = []; // Stores unique platform names
  loading = false;

  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getItems();
  }
  getItems() {
    this.loading = true;
    this.posConfiService.getCustomers().subscribe(
      (response: any) => {
        if(response.data.customers.length > 0){
          this.dataSource = response.data.customers
          this.loading = false;
        }else{
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      })
  }


  addCustomer(){
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '600px',
      height:'auto',
      data: {isEdit: false}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        this.getItems()
      }
    });
  }
  editCustomer(element: any): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '600px',
      height:'auto',
      data: {itemDetails : element, isEdit: true}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        this.getItems()
      }
    });
  }
  
  deleteCustomer(element: any): void {
    element.loading = true
    this.posConfiService.deleteCustomer({ids: [element.id]}).subscribe(
      (response:any) =>{
        console.log(response);
        this.dataSource = this.dataSource.filter((item:any) => item.id !== element.id);
        this.toastrService.success(response.message, 'Customer');

        element.loading = false;
      }, (error) =>{
        this.toastrService.error(error?.error?.message, 'Customer');
        element.loading = false;
      }
    )
  }
}
