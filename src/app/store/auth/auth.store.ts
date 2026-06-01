import { Injectable } from '@angular/core';
import { RecoveryPassword } from '../../core/integration/auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  passwordRecovery(payload: { email: string }) {
    // Implemente a lógica real da Action ou ComponentStore aqui
    console.log('Dispatching passwordRecovery with:', payload);
  }
}
