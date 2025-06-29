import { Component, OnInit } from '@angular/core';
import { POSConfigurationService } from '../pos-configuration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

interface PlatformPrice {
  price: number;
  platForm: string;
  platFormId: number;
}

interface BranchPlatformPrice {
  itemId: number;
  branchId: number;
  platformPrices: PlatformPrice[];
}

@Component({
  selector: 'app-branch-menu',
  templateUrl: './branch-menu.component.html',
  styleUrls: ['./branch-menu.component.scss']
})
export class BranchMenuComponent implements OnInit {
  branches: any[] = [];
  items: any[] = [];
  selectedBranch: any = null;
  loading = false;
  menuForm: FormGroup;
  platforms: PlatformPrice[] = [];
  displayedColumns: string[] = ['id', 'name', 'category', 'platforms', 'actions'];

  constructor(
    private posConfiService: POSConfigurationService,
    private toastrService: ToastrService,
    private fb: FormBuilder
  ) {
    this.menuForm = this.fb.group({
      branchId: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadItems();
  }

  loadBranches() {
    this.loading = true;
    this.posConfiService.getBranches().subscribe({
      next: (response: any) => {
        this.branches = response.data.branches || [];
        console.log('Loaded branches:', this.branches);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading branches:', error);
        this.toastrService.error('Failed to load branches', 'Error');
        this.loading = false;
      }
    });
  }

  loadItems() {
    this.posConfiService.getItems().subscribe({
      next: (response: any) => {
        this.items = response.data?.sub_items || [];
        console.log('Loaded items:', this.items);
        
        // Extract unique platforms from all items
        const allPlatforms = new Map<number, PlatformPrice>();
        
        this.items.forEach(item => {
          if (item.price && Array.isArray(item.price)) {
            item.price.forEach((p: any) => {
              if (!allPlatforms.has(p.platFormId)) {
                allPlatforms.set(p.platFormId, {
                  price: p.price,
                  platForm: p.platForm,
                  platFormId: p.platFormId
                });
              }
            });
          }
        });
        
        this.platforms = Array.from(allPlatforms.values());
        console.log('Extracted platforms:', this.platforms);
      },
      error: (error: any) => {
        console.error('Error loading items:', error);
        this.toastrService.error('Failed to load items', 'Error');
      }
    });
  }

  onBranchSelect(branchId: string) {
    if (!branchId) {
      this.selectedBranch = null;
      return;
    }
    
    const branch = this.branches.find(b => b.id == branchId);
    if (branch) {
      this.selectedBranch = branch;
      this.menuForm.patchValue({ branchId: branch.id });
      this.initializeMenuForm();
    }
  }

  onBranchSelectChange(event: any) {
    const value = event?.target?.value || '';
    this.onBranchSelect(value);
  }

  initializeMenuForm() {
    if (!this.selectedBranch || !this.items.length) {
      return;
    }

    const itemsArray = this.menuForm.get('items') as FormArray;
    itemsArray.clear();

    this.items.forEach(item => {
      const platformPricesArray = new FormArray<FormGroup>([]);
      
      // Create form controls for each platform
      this.platforms.forEach(platform => {
        const currentPrice = this.getCurrentPriceForPlatform(item, platform.platFormId);
        
        const platformGroup = this.fb.group({
          platFormId: [platform.platFormId],
          platForm: [platform.platForm],
          currentPrice: [currentPrice || 0],
          newPrice: [currentPrice || 0]
        });
        
        platformPricesArray.push(platformGroup);
      });

      const itemGroup = this.fb.group({
        itemId: [item.id || 0],
        itemName: [item.name || ''],
        category: [item.outletMenu?.name || ''],
        isActive: [item.isActive || false],
        platformPrices: platformPricesArray
      });

      itemsArray.push(itemGroup);
    });
    
    console.log('Form initialized with', itemsArray.length, 'items');
  }

  getCurrentPriceForPlatform(item: any, platformId: number): number {
    if (!item || !item.price || !Array.isArray(item.price)) {
      return 0;
    }
    
    const platformPrice = item.price.find((p: any) => p.platFormId === platformId);
    return platformPrice ? parseFloat(platformPrice.price) || 0 : 0;
  }

  get itemsFormArray() {
    return this.menuForm.get('items') as FormArray;
  }

  getPlatformPricesArray(itemControl: any): FormArray<FormGroup> {
    return itemControl.get('platformPrices') as FormArray<FormGroup>;
  }

  getNewPriceControl(platformControl: any): FormControl {
    return platformControl.get('newPrice') as FormControl;
  }

  updateAllPrices(percentage: string) {
    const percentValue = parseFloat(percentage);
    if (isNaN(percentValue)) {
      this.toastrService.warning('Please enter a valid percentage', 'Warning');
      return;
    }

    const itemsArray = this.itemsFormArray;
    
    itemsArray.controls.forEach(itemControl => {
      const platformPricesArray = this.getPlatformPricesArray(itemControl);
      
      platformPricesArray.controls.forEach(platformControl => {
        const currentPrice = parseFloat(platformControl.get('currentPrice')?.value) || 0;
        const newPrice = currentPrice * (1 + percentValue / 100);
        platformControl.patchValue({ newPrice: Math.round(newPrice * 100) / 100 });
      });
    });
    
    const action = percentValue > 0 ? 'increased' : 'decreased';
    const absValue = Math.abs(percentValue);
    this.toastrService.success(`Updated all prices by ${absValue}% (${action})`, 'Success');
  }

  resetPrices() {
    const itemsArray = this.itemsFormArray;
    
    itemsArray.controls.forEach(itemControl => {
      const platformPricesArray = this.getPlatformPricesArray(itemControl);
      
      platformPricesArray.controls.forEach(platformControl => {
        const currentPrice = platformControl.get('currentPrice')?.value || 0;
        platformControl.patchValue({ newPrice: currentPrice });
      });
    });
    
    this.toastrService.info('All prices reset to original values', 'Reset');
  }

  saveBranchMenu() {
    if (!this.selectedBranch) {
      this.toastrService.warning('Please select a branch first', 'Warning');
      return;
    }

    const formValue = this.menuForm.value;
    const modifiedItems = formValue.items.filter((item: any) => {
      return item.platformPrices.some((platform: any) => {
        const currentPrice = parseFloat(platform.currentPrice) || 0;
        const newPrice = parseFloat(platform.newPrice) || 0;
        return Math.abs(currentPrice - newPrice) > 0.01;
      });
    });

    if (modifiedItems.length === 0) {
      this.toastrService.info('No price changes detected', 'Info');
      return;
    }

    this.loading = true;
    let successCount = 0;
    let errorCount = 0;
    const totalItems = modifiedItems.length;

    console.log(`Updating ${totalItems} items with price changes...`);

    modifiedItems.forEach((item: any, index: number) => {
      const payload = {
        branchId: formValue.branchId,
        price: item.platformPrices.map((platform: any) => ({
          platFormId: platform.platFormId,
          platForm: platform.platForm,
          price: parseFloat(platform.newPrice) || 0
        }))
      };

      console.log(`Updating item ${item.itemId}:`, item, payload);

      this.posConfiService.editItem(payload, item.itemId).subscribe({
        next: (response: any) => {
          successCount++;
          console.log(`Item ${item.itemId} updated successfully`);
          
          if (successCount + errorCount === totalItems) {
            this.loading = false;
            if (errorCount === 0) {
              this.toastrService.success(`Successfully updated ${successCount} items`, 'Success');
              this.loadItems();
            } else {
              this.toastrService.warning(`Updated ${successCount} items, ${errorCount} failed`, 'Partial Success');
              this.loadItems();
            }
            this.initializeMenuForm(); // Refresh the form with updated prices
          }
        },
        error: (error: any) => {
          errorCount++;
          console.error(`Error updating item ${item.itemId}:`, error);
          
          if (successCount + errorCount === totalItems) {
            this.loading = false;
            if (successCount === 0) {
              this.toastrService.error('Failed to update any items', 'Error');
            } else {
              this.toastrService.warning(`Updated ${successCount} items, ${errorCount} failed`, 'Partial Success');
            }
            // Reload items to get updated prices even if some failed
            if (successCount > 0) {
              this.loadItems();
            }
          }
        }
      });
    });
  }

  getTotalItems(): number {
    return this.itemsFormArray?.length || 0;
  }

  getModifiedItems(): number {
    if (!this.itemsFormArray) return 0;
    
    return this.itemsFormArray.controls.filter(itemControl => {
      const platformPricesArray = this.getPlatformPricesArray(itemControl);
      
      return platformPricesArray.controls.some(platformControl => {
        const currentPrice = parseFloat(platformControl.get('currentPrice')?.value) || 0;
        const newPrice = parseFloat(platformControl.get('newPrice')?.value) || 0;
        return Math.abs(currentPrice - newPrice) > 0.01;
      });
    }).length;
  }

  isItemModified(itemControl: any): boolean {
    const platformPricesArray = this.getPlatformPricesArray(itemControl);
    
    return platformPricesArray.controls.some(platformControl => {
      const currentPrice = parseFloat(platformControl.get('currentPrice')?.value) || 0;
      const newPrice = parseFloat(platformControl.get('newPrice')?.value) || 0;
      return Math.abs(currentPrice - newPrice) > 0.01;
    });
  }
} 