import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomerDialogComponent } from '../modals/customer-dialog/customer-dialog.component';
import { PageEvent } from '@angular/material/paginator';


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
  paginatedDataSource: any[] = [];
  pageSize = 50;
  currentPage = 0;
  totalCount = 0;
  currentStartIndex = 0;
  currentEndIndex = 0;
  pages: number[] = [];
  visiblePages: number[] = [];
totalPages: number = 0;
  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.fetchData();
  }
  fetchData(): void {
    // Simulate fetching data
    this.getCustomers(this.currentPage, this.pageSize);
  }

  getCustomers(page: number, pageSize: number): void {
    this.loading = true;
    const offset = page * pageSize;
    this.posConfiService.getCustomers({ offset, limit: pageSize }).subscribe(
      (response: any) => {
        if(response.data.customers.length > 0){
          this.dataSource = response.data.customers.map((item:any) => {
            return {
              ...item,
              uniqueId: item.uniqueId.replace(/_/g, '-')
            };
          });
          this.totalCount = response?.data?.page?.count ;
          this.updatePagination();
          this.loading = false;
        }else{
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      })
  }

  updatePagination(): void {
    this.currentStartIndex = this.currentPage * this.pageSize;
    this.currentEndIndex = Math.min(this.currentStartIndex + this.pageSize, this.totalCount);
  
    // Calculate the total number of pages
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    this.totalPages = totalPages;
  
    // Calculate visible pages
    const maxVisiblePages = 5; // Number of pages to show around the current page
    const startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages);
  
    this.visiblePages = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  
    this.paginatedDataSource = this.dataSource;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchData();
    }
  }

  addCustomer(){
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '600px',
      height:'auto',
      data: {isEdit: false}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        this.fetchData()
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
        this.fetchData()
      }
    });
  }
  
  deleteCustomer(element: any): void {
    element.loading = true
    this.posConfiService.deleteCustomer({ids: [element.id]}).subscribe(
      (response:any) =>{
        console.log(response);
        this.dataSource = this.dataSource.filter((item:any) => item.id !== element.id);
        this.paginatedDataSource = this.dataSource
        this.toastrService.success(response.message, 'Customer');

        element.loading = false;
      }, (error) =>{
        this.toastrService.error(error?.error?.message, 'Customer');
        element.loading = false;
      }
    )
  }
}
