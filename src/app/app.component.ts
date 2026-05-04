import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'agenda-front';
  showNavbar = false;
  
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.showNavbar = !url.includes('/login') && !url.includes('/signup');
      });
    }
  }
}
