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
  displayedColumns: string[] = ['id', 'name', 'category', 'active', 'actions'];
  dataSource:any;

  loading = false;

  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getItems();
  }
  getItems() {
    this.loading = true;
    this.posConfiService.getItems().subscribe(
      (response: any) => {
        console.log('response: ', response);
        if(response.data.sub_items.length > 0){
          this.loading = false;
          this.dataSource = response.data.sub_items;
          this.dataSource.map((el:any) =>{
            el.loading = false;
          });
        }
      },
      (error) => {
        this.loading = false;
        console.log(error, "error")
      })
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
