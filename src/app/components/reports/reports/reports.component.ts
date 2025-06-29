import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { POSConfigurationService } from '../../pos-configuration/pos-configuration.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  isGeneratingReport: boolean = false;
reportForm!: FormGroup;
apiName:any
reportName: string = '';
  constructor(private posConfiService: POSConfigurationService, private fb:FormBuilder, private toastr: ToastrService, private route: ActivatedRoute) { 
    const routePath = this.route.routeConfig?.path;
    this.apiName = routePath;
    this.reportName = this.apiName === 'final-report' ? 'Final Report' : this.apiName === 'mode-wise-report' ? 'Sales Report' : 'Cashier Electronic Report';
  console.log('Route name (path):', routePath);
  }

  ngOnInit() {
    const now = new Date();
    const formattedDate = this.formatDate(now); // DD/MM/YYYY
    this.reportForm = this.fb.group({
      from: [formattedDate],
      to: [formattedDate],
      isHalfDay: [false]
    });
  }

    formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // format for input[type=date]
  }


  generateReport() {
      const formData = this.reportForm.getRawValue();
      this.isGeneratingReport = true;
      this.posConfiService.generateFinalReport(formData, this.apiName).subscribe(
        (pdfResponse: Blob) => {
          this.isGeneratingReport = false;

          const pdfUrl = URL.createObjectURL(pdfResponse);
          window.open(pdfUrl, '_blank');
        }, (error: any) => {
          this.isGeneratingReport = false;
          this.toastr.success(error.error.message, 'Error')
        }
      )
    }
}