import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomerDialogComponent } from '../modals/customer-dialog/customer-dialog.component';


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
    this.getCustomers();
  }
  getCustomers() {
    this.loading = true;
    this.posConfiService.getCustomers().subscribe(
      (response: any) => {
        if(response.data.customers.length > 0){
          this.dataSource = response.data.customers.map((item:any) => {
            return {
              ...item,
              uniqueId: item.uniqueId.replace(/_/g, '-')
            };
          });
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
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '600px',
      height:'auto',
      data: {isEdit: false}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        this.getCustomers()
      }
    });
  }
  editCustomer(element: any): void {
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '600px',
      height:'auto',
      data: {customerDetails : element, isEdit: true}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        this.getCustomers()
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
