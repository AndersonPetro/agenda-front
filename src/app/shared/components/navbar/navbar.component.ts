import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/integration/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar glass-card" *ngIf="isAuthenticated">
      <div class="nav-brand">
        <div class="logo">A</div>
        <span class="brand-name">AgendaService</span>
      </div>
      
      <div class="nav-links">
        <a routerLink="/appointments" routerLinkActive="active" class="nav-item">Meus Agendamentos</a>
        <a routerLink="/book" routerLinkActive="active" class="nav-item">Novo Agendamento</a>
        <a routerLink="/services" routerLinkActive="active" class="nav-item">Serviços</a>
      </div>

      <div class="nav-actions">
        <button class="btn-secondary logout-btn" (click)="logout()">Sair</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      margin: 1rem auto 2rem;
      max-width: 1200px;
      border-radius: 1rem;
      border: 1px solid var(--border-color);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo {
      width: 32px;
      height: 32px;
      background: var(--accent-primary);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .brand-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--text-primary);
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-item {
      color: var(--text-secondary);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-primary);
    }
    .logout-btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = false;

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    // In a real app we'd subscribe to an auth state observable
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
