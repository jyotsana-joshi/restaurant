import { Component } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { AddUserDialogComponent } from '../modals/add-user-dialog/add-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BranchDialogComponent } from '../modals/branch-dialog/branch-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent {
  displayedColumns: string[] = ['id', 'name', 'code', 'address','prnNum','active', 'actions'];
  dataSource: any;

  loading = false;

  constructor(private posConfiService: POSConfigurationService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

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
          this.dataSource.map((el: any) => {
            el.loading = false;
          });
        }
      },
      (error) => {
        this.loading = false;
        console.log(error, "error")
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
        this.snackBar.open('Branch deleted successfully', 'Close', {
          duration: 2000,
        });
      }, (error) => {
        console.log(error, "error");
        element.loading = false;
        this.snackBar.open('Failed to delete branch', 'Close', {
          duration: 2000,
        });

      }
    )
  }
}
