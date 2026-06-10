import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);

  step: 1 | 2 = 1;
  isLoading = false;
  successMsg = '';
  errorMsg = '';
  devCode = '';
  recoveredEmail = '';
  isFinalSuccess = false;

  formStep1 = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  formStep2 = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  submitEmail(): void {
    if (this.formStep1.valid) {
      this.isLoading = true;
      this.successMsg = '';
      this.errorMsg = '';
      
      const email = this.formStep1.get('email')!.value!;
      this.authStore.passwordRecovery({ email }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.recoveredEmail = email;
          this.successMsg = res.message || 'Código de recuperação enviado!';
          if (res.devCode) {
            this.devCode = res.devCode;
            this.formStep2.patchValue({ code: res.devCode });
          }
          this.step = 2;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'Erro ao tentar recuperar a senha. Certifique-se de que o e-mail está cadastrado.';
        }
      });
    }
  }

  submitRecovery(): void {
    if (this.formStep2.valid) {
      this.isLoading = true;
      this.successMsg = '';
      this.errorMsg = '';

      const code = this.formStep2.get('code')!.value!;
      const newPassword = this.formStep2.get('newPassword')!.value!;

      this.authStore.confirmPasswordRecovery({
        email: this.recoveredEmail,
        code,
        newPassword
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMsg = 'Senha redefinida com sucesso! Você já pode fazer login com a sua nova senha.';
          this.isFinalSuccess = true;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'Erro ao redefinir a senha. Verifique o código enviado.';
        }
      });
    }
  }
}
