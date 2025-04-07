import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { AddUserDialogComponent } from '../modals/add-user-dialog/add-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from '../modals/category-dialog/category-dialog.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  displayedColumns: string[] = ['id', 'name','printer', 'active', 'actions'];
  dataSource: any;

  loading = false;
  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getCategories();
  }
  getCategories() {
    this.loading = true;
    this.posConfiService.getCategories().subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.outletMenu.length > 0) {
          this.loading = false;
          this.dataSource = response.data.outletMenu;
          this.dataSource.map((el: any) => {
            el.loading = false;
          })
        }else{
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
        this.toastrService.error(error?.error?.message, 'Category');

      })
  }

  addCategory() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        console.log('result', result);
        this.getCategories()
      }
    });
  }
  editCategory(element: any): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { categoryDetails: element, isEdit: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        this.getCategories()
      }
    });
  }

  deleteCategory(element: any): void {
    element.loading = true;
    this.posConfiService.deleteCategories({ ids: [element.id] }).subscribe(
      (response: any) => {
        element.loading = false;
        this.dataSource = this.dataSource.filter((item:any) => item.id !== element.id);
        this.toastrService.success(response.message, 'Category');
    
        console.log(response)
      }, (error) => {
        this.toastrService.success(error?.error?.message, 'Category');
        element.loading = false;
      }
    )
  }
}
