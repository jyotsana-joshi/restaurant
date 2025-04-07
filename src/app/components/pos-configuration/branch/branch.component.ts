import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { AddUserDialogComponent } from '../modals/add-user-dialog/add-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BranchDialogComponent } from '../modals/branch-dialog/branch-dialog.component';
import { ToastrService } from 'ngx-toastr';

export interface PeriodicElement {
  id: number;
  logo:string;
  name: string;
  work: string;
  project: string;
  priority: string;
  badge: string;
  budget: string;
}


@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent {
  displayedColumns: string[] = ['id', 'logo', 'name', 'code', 'address','prnNum','active', 'actions'];
  dataSource: any;

  loading = false;

  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getBranches();
  }
  getBranches() {
    this.loading = true;
    this.posConfiService.getBranches().subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.data.branches.length > 0) {
          this.loading = false;
          this.dataSource = response.data.branches;
          console.log('dataSource: ', this.dataSource);
          this.dataSource.map((el: any) => {
            el.loading = false;
          });
        }
      },
      (error) => {
        this.loading = false;
        this.toastrService.error(error?.error?.message, 'Branch');
      })
  }

  addBranch() {
    const dialogRef = this.dialog.open(BranchDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        console.log('result', result);
        this.getBranches()
      }
    });
  }
  editBranch(element: any): void {
    console.log('Edit:', element);
    const dialogRef = this.dialog.open(BranchDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { branchDetails: element, isEdit: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result.success) {
        console.log('result', result);
        this.getBranches()
      }
    });
  }

  deleteBranch(element: any): void {
    element.loading = true;
    this.posConfiService.deleteBranches({ ids: [element.id] }).subscribe(
      (response: any) => {
        console.log(response)
        this.dataSource = this.dataSource.filter((branch:any) => branch.id !== element.id);
        element.loading = false;
        this.toastrService.success(response.message, 'Category');

      }, (error) => {
        element.loading = false;
        this.toastrService.success(error?.error?.message, 'Category');


      }
    )
  }
}
