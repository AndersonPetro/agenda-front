import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/integration/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="signup-container">
      <div class="glass-card signup-card">
        <div class="brand">
          <div class="logo">A</div>
          <h1>Criar Conta</h1>
          <p>Junte-se à nós para agendar seus serviços</p>
        </div>

        <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" *ngIf="!successMsg">
          <div class="form-row">
            <div class="form-group half">
              <label for="firstName">Nome</label>
              <input type="text" id="firstName" formControlName="firstName" placeholder="Seu nome">
            </div>
            <div class="form-group half">
              <label for="lastName">Sobrenome</label>
              <input type="text" id="lastName" formControlName="lastName" placeholder="Seu sobrenome">
            </div>
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" formControlName="email" placeholder="seu@email.com">
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" formControlName="password" placeholder="••••••••">
          </div>

          <button type="submit" class="btn-primary signup-btn" [disabled]="signupForm.invalid || isLoading">
            {{ isLoading ? 'Cadastrando...' : 'Criar Conta' }}
          </button>
        </form>

        <p class="login-link">
          Já possui conta? <a routerLink="/login">Faça Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top left, var(--bg-secondary), var(--bg-primary));
      padding: 1.5rem;
    }
    .signup-card {
      width: 100%;
      max-width: 450px;
    }
    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      width: 48px;
      height: 48px;
      background: var(--accent-primary);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
    }
    .brand h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .brand p { color: var(--text-secondary); font-size: 0.875rem; }
    
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .half {
      flex: 1;
    }
    .signup-btn {
      width: 100%;
      margin-top: 1rem;
    }
    .login-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMsg = '';
      this.authService.signup(this.signupForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMsg = 'Conta criada com sucesso! Redirecionando para o login...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        }
      });
    }
  }
}
