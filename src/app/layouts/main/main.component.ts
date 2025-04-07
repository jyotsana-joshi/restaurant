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
      icon: 'home',
      link: '/home',
    },
    {
      menu: 'POS Configuration',
      icon: 'settings',
      isOpen: false, // Indicates if the submenu is open
      submenu: [
        { menu: 'Outlet User', icon: 'user', link: '/user-list' },
        { menu: 'Branches', icon: 'layout', link: '/branches' },
        { menu: 'Categories', icon: 'list', link: '/categories' },
        { menu: 'Items', icon: 'list', link: '/items' },
        { menu: 'Customers', icon: 'list', link: '/customers' },
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
  // sidebarMenu1: sidebarMenu[] = [
  //   {
  //     link: "/home",
  //     icon: "home",
  //     menu: "Dashboard",
  //   },
  //   {
  //     link: "/forms",
  //     icon: "layout",
  //     menu: "Forms",
  //   },
  //   {
  //     link: "/alerts",
  //     icon: "info",
  //     menu: "Alerts",
  //   },
  //   {
  //     link: "/grid-list",
  //     icon: "file-text",
  //     menu: "Grid List",
  //   },
  //   {
  //     link: "/menu",
  //     icon: "menu",
  //     menu: "Menus",
  //   },
  //   {
  //     link: "/table",
  //     icon: "grid",
  //     menu: "Tables",
  //   },
  //   {
  //     link: "/expansion",
  //     icon: "divide-circle",
  //     menu: "Expansion Panel",
  //   },
  //   {
  //     link: "/chips",
  //     icon: "award",
  //     menu: "Chips",
  //   },
  //   {
  //     link: "/tabs",
  //     icon: "list",
  //     menu: "Tabs",
  //   },
  //   {
  //     link: "/progress",
  //     icon: "bar-chart-2",
  //     menu: "Progress Bar",
  //   },
  //   {
  //     link: "/toolbar",
  //     icon: "voicemail",
  //     menu: "Toolbar",
  //   },
  //   {
  //     link: "/progress-snipper",
  //     icon: "loader",
  //     menu: "Progress Snipper",
  //   },
  //   {
  //     link: "/tooltip",
  //     icon: "bell",
  //     menu: "Tooltip",
  //   },
  //   {
  //     link: "/snackbar",
  //     icon: "slack",
  //     menu: "Snackbar",
  //   },
  //   {
  //     link: "/slider",
  //     icon: "sliders",
  //     menu: "Slider",
  //   },
  //   {
  //     link: "/slide-toggle",
  //     icon: "layers",
  //     menu: "Slide Toggle",
  //   },

  // ]


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
