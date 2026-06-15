import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/integration/auth/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="denied-container">
      <div class="glass-card denied-card">
        <div class="icon-wrapper">⚠️</div>
        <h1>Acesso Negado</h1>
        <p>Você não possui as permissões necessárias para acessar esta página.</p>
        <div class="actions">
          <a [routerLink]="redirectLink" class="btn-primary">{{ buttonText }}</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .denied-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top left, var(--bg-secondary), var(--bg-primary));
      padding: 1.5rem;
      font-family: 'Inter', sans-serif;
    }
    .denied-card {
      width: 100%;
      max-width: 450px;
      text-align: center;
      padding: 3rem 2rem;
    }
    .icon-wrapper {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 2rem;
      color: var(--danger);
      margin-bottom: 1rem;
    }
    p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      font-size: 1rem;
      line-height: 1.5;
    }
    .actions {
      display: flex;
      justify-content: center;
    }
    .btn-primary {
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
    }
  `]
})
export class AccessDeniedComponent implements OnInit {
  private authService = inject(AuthService);

  redirectLink = '/login';
  buttonText = 'Voltar para o Login';

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      if (this.authService.hasRole('ADMIN')) {
        this.redirectLink = '/agenda';
        this.buttonText = 'Voltar para o Painel';
      } else if (this.authService.hasRole('CLIENTE')) {
        this.redirectLink = '/user/agendamentos';
        this.buttonText = 'Voltar para Agendamentos';
      }
    }
  }
}
