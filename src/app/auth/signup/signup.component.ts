import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/integration/auth/auth.service';

/**
 * Validador personalizado para garantir que a senha e a confirmação de senha coincidam.
 */
const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

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
          <p>Junte-se a nós para agendar seus serviços</p>
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
            <div class="password-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                placeholder="••••••••"
              >
              <button 
                type="button" 
                class="password-toggle" 
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <svg *ngIf="!showPassword" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.errors" class="validation-error">
              <small *ngIf="signupForm.get('password')?.errors?.['required']">A senha é obrigatória.</small>
              <small *ngIf="signupForm.get('password')?.errors?.['minlength']">A senha deve ter pelo menos 6 caracteres.</small>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha</label>
            <div class="password-wrapper">
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                placeholder="••••••••"
              >
              <button 
                type="button" 
                class="password-toggle" 
                (click)="toggleConfirmPasswordVisibility()"
                [attr.aria-label]="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <svg *ngIf="!showConfirmPassword" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showConfirmPassword" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div *ngIf="signupForm.get('confirmPassword')?.touched" class="validation-error">
              <small *ngIf="signupForm.get('confirmPassword')?.errors?.['required']">A confirmação de senha é obrigatória.</small>
              <small *ngIf="signupForm.errors?.['passwordMismatch'] && !signupForm.get('confirmPassword')?.errors?.['required']">As senhas não coincidem.</small>
            </div>
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
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-wrapper input {
      padding-right: 2.75rem;
    }
    .password-toggle {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }
    .password-toggle:hover {
      color: var(--text-primary);
    }
    .password-toggle svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .validation-error {
      color: var(--danger);
      margin-top: 0.25rem;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  showConfirmPassword = false;

  signupForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMsg = '';
      
      const { confirmPassword, ...signupData } = this.signupForm.value;

      this.authService.signup(signupData).subscribe({
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
