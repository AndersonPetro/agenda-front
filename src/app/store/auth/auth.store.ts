import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RecoveryPassword, RecoveryConfirm, RecoveryResponse } from '../../core/integration/auth/auth.model';
import { AuthenticationService } from '../../core/integration/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private authService = inject(AuthenticationService);

  passwordRecovery(payload: RecoveryPassword): Observable<RecoveryResponse> {
    console.log('Dispatching passwordRecovery with:', payload);
    return this.authService.passwordRecovery(payload);
  }

  confirmPasswordRecovery(payload: RecoveryConfirm): Observable<any> {
    console.log('Dispatching confirmPasswordRecovery with:', payload);
    return this.authService.confirmPasswordRecovery(payload);
  }
}
