import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { AddUserDialogComponent } from '../modals/add-user-dialog/add-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

export interface PeriodicElement {
  id: number;
  name: string;
  work: string;
  project: string;
  priority: string;
  badge: string;
  budget: string;
}


@Component({
  selector: 'app-outlet-user',
  templateUrl: './outlet-user.component.html',
  styleUrls: ['./outlet-user.component.scss']
})
export class OutletUserComponent {
  displayedColumns: string[] = ['id', 'username', 'firstName', 'lastName', 'branch', 'designation', 'active', 'actions'];

  loading = false;
  dataSource : any= [];
  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getUsers();
    
  }
  getUsers() {
    this.loading = true;
    this.posConfiService.getUsers().subscribe(
      (response: any) => {
        this.dataSource = response.data.users
        this.dataSource.map((el:any) =>{
          el.loading = false;
        });
        this.loading = false;

      },
      (error) => {
        this.loading = false;
      })
  }

  addUser() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        this.getUsers()
      }
    });
  }
  editUser(element: any): void {
    console.log('Edit:', element);
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { userDetails: element, isEdit: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        this.getUsers()
      }
    });
  }
  deleteUser(element:any){
    element.loading = true;
    this.posConfiService.deleteUser({ ids: [element.id] }).subscribe(
      (response: any) => {
        console.log(response)
        this.dataSource = this.dataSource.filter((user:any) => user.id !== element.id);
        element.loading = false;
        this.toastrService.success(response.message, 'User');
      }, (error) => {
        element.loading = false;
        this.toastrService.error(error?.error?.message, 'User');
      }
    )
  }
}
