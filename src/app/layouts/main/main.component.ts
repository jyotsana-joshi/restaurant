import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthInterceptor } from 'src/app/utils/interceptors/auth.service';
import { POSConfigurationService } from 'src/app/components/pos-configuration/pos-configuration.service';

interface sidebarMenu {
  link: string;
  icon: string;
  menu: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  search: boolean = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  sidebarMenu = [
    {
      menu: 'Dashboard',
      icon: 'house',
      link: '/home',
    },
    {
      menu: 'POS Configuration',
      icon: 'gear',
      isOpen: false, // Indicates if the submenu is open
      submenu: [
        { menu: 'Outlet User', icon: 'person', link: '/user-list' },
        { menu: 'Branches', icon: 'building', link: '/branches' },
        { menu: 'Categories', icon: 'list-ul', link: '/categories' },
        { menu: 'Items', icon: 'box', link: '/items' },
        { menu: 'Customers', icon: 'people', link: '/customers' },
      ],
    },
    {
      menu: 'Reports',
      // icon: 'bar-chart-2',
      isOpen: false, // Indicates if the submenu is open
      submenu: [
        { menu: 'Final Report', icon: 'bar-chart-2', link: '/final-report' },
        { menu: 'Sales Report', icon: 'bar-chart-2', link: '/mode-wise-report' },
        { menu: 'Cashier Electronic Report', icon: 'bar-chart-2', link: '/cashier-electronic-report' },

      ],
    },
    // {
    //   menu: 'Reports',
    //   icon: 'bar-chart-2',
    //   link: '/reports',
    // },
    // {
    //   link: "/forms",
    //   icon: "layout",
    //   menu: "Forms",
    // },
  ];
  routerActive: string = "activelink";
  showSubmenu: boolean = false;
  showSubSubMenu: boolean = false;
  userDetails : any= []
  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthInterceptor, private router: Router,
    private route: ActivatedRoute, private posConfiguration: POSConfigurationService
  ) {
    this.getUser();
  }
  ngOnInit(): void {
    this.setOpenMenuBasedOnRoute();
  }
  getUser(){
    const value = localStorage.getItem('userDetails');
    this.posConfiguration.getUser(value).subscribe(
      (response:any) =>{
        console.log(response,"responsee");
        this.userDetails = response.data.user
      }
    )
  }
  setOpenMenuBasedOnRoute(): void {
    const currentRoute = this.router.url;

    this.sidebarMenu.forEach((menu:any) => {
      // Reset all menus to closed
      if (menu.submenu) {
        menu.isOpen = false;

        // Check if the current route matches any submenu link
        const isMatch = menu.submenu.some((submenu:any) => currentRoute.includes(submenu.link));
        if (isMatch) {
          menu.isOpen = true;
        }
      } else {
        // Check if the current route matches the top-level menu link
        if (currentRoute.includes(menu.link)) {
          menu.isOpen = true;
        }
      }
    });
  }

  openBillingScreen() {
    window.open('/billing-screen', '_blank');
  }


  toggleSubMenu(item: any) {
    if (item.submenu) {
      item.isOpen = !item.isOpen;
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['sign-in'])
  }
}
