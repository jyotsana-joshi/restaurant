import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { MatDialog } from '@angular/material/dialog';
import { ItemDialogComponent } from '../modals/item-dialog/item-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent {
  displayedColumns: string[] = ['id', 'name', 'category', 'printer','active', 'actions'];
  dataSource:any;
  platforms: string[] = []; // Stores unique platform names
  loading = false;

  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getItems();
  }
  getItems() {
    this.loading = true;
    this.posConfiService.getItems().subscribe(
      (response: any) => {
        if(response.data.sub_items.length > 0){
          this.formatTableData(response.data.sub_items);
          this.loading = false;
        }else{
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
        console.log(error, "error")
      })
  }

  formatTableData(data: any[]) {
    console.log('data: ', data);
      let platformsSet = new Set<string>();
  
      // Extract unique platform names
      data.forEach(item => {
        console.log('item: ', item);
        item?.price?.forEach((priceObj:any) => {
          platformsSet.add(priceObj.platForm);
        });
      });
  
      this.platforms = Array.from(platformsSet); // Store unique platforms
  
      // Update displayedColumns dynamically
      this.displayedColumns = ['id', 'name', ...this.platforms, 'category', 'printer','active', 'actions'];
  
      // Transform data for table display
      this.dataSource = data.map(item => {
        console.log('item: ', item);
        let row: any = {
          id: item.id,
          name: item.name,
          category: item.outletMenu?.name || '',
          printer: item.printer,
          active: item.isActive ? 'Yes' : 'No',
          outletMenu: item.outletMenu,
          price: item.price
        };
  
        // Add platform prices to respective columns
        console.log('item.price: ', item.price);
        item?.price?.forEach((priceObj:any) => {
          row[priceObj.platForm] = priceObj.price; // Example: row['Zomato'] = "23.00"
        });
  
        return row;
      });
      console. log('Updated Columns:', this.displayedColumns);
      console.log('Updated DataSource:', this.dataSource,this.platforms);
    
  }
  addItem(){
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '600px',
      height:'auto',
      data: {isEdit: false}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        console.log('result', result);
        this.getItems()
      }
    });
  }
  editItem(element: any): void {
    console.log('Edit:', element);
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '600px',
      height:'auto',
      data: {itemDetails : element, isEdit: true}
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result.success) {
        console.log('result', result);
        this.getItems()
      }
    });
  }
  
  deleteItem(element: any): void {
    console.log('Delete:', element);
    element.loading = true
    this.posConfiService.deleteItem({ids: [element.id]}).subscribe(
      (response:any) =>{
        console.log(response);
        this.dataSource = this.dataSource.filter((item:any) => item.id !== element.id);
        this.snackBar.open('Item deleted successfully', 'Close', {
          duration: 2000,
        });
        element.loading = false;
      }, (error) =>{
        console.log(error,"error");
        this.snackBar.open('Failed to delete item', 'Close', {
          duration: 2000,
        });
        element.loading = false;

      }
    )
  }
}
