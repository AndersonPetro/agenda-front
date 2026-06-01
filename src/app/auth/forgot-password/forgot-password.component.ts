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

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  successMsg = '';
  errorMsg = '';

  submit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.successMsg = '';
      this.errorMsg = '';
      
      const email = this.form.get('email')!.value!;
      try {
        this.authStore.passwordRecovery({ email });
        this.isLoading = false;
        this.successMsg = 'Instruções de recuperação de senha enviadas com sucesso!';
      } catch (err) {
        this.isLoading = false;
        this.errorMsg = 'Erro ao tentar recuperar a senha. Tente novamente.';
      }
    }
  }
}
