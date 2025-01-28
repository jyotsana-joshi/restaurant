import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { AddUserDialogComponent } from '../modals/add-user-dialog/add-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from '../modals/category-dialog/category-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  displayedColumns: string[] = ['id', 'name', 'branchName', 'active', 'actions'];
  dataSource: any;

  loading = false;
  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog,private snackBar: MatSnackBar) { }

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
          console.log('this.dataSource: ', this.dataSource);
        }
      },
      (error) => {
        this.loading = false;
        console.log(error, "error")
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
    console.log('Edit:', element);
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { categoryDetails: element, isEdit: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        console.log('result', result);
        this.getCategories()
      }
    });
  }

  deleteCategory(element: any): void {
    console.log('Delete:', element);
    element.loading = true;
    this.posConfiService.deleteCategories({ ids: [element.id] }).subscribe(
      (response: any) => {
        element.loading = false;
        this.dataSource = this.dataSource.filter((item:any) => item.id !== element.id);
        this.snackBar.open('Category deleted successfully', 'Close', {
          duration: 2000,
        });
        console.log(response)
      }, (error) => {
        this.snackBar.open('Failed to delete category', 'Close', {
          duration: 2000,
        });
        element.loading = false;

        console.log(error, "error");

      }
    )
  }
}
