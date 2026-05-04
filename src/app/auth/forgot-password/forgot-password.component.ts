import { Component } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import * as ModalAction from "src/app/store/modal-dialog/modal-dialog.actions";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { AuthStore } from "src/app/store/auth/auth.store";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  form = this.fb.group({
    email: new FormControl<string>({ value: '', disabled: false },
      [Validators.required, Validators.email]
    ),
  });

  constructor(private readonly _authStore: AuthStore,
    private fb: FormBuilder,
    private readonly _store: Store<AppState>) {
  }

  getFormControl(name: string): FormControl {
    return this.form?.get(name) as FormControl;
  }

  close = (): void => this._store.dispatch(ModalAction.closeModal());

  submit(): void {
    if (this.form.valid) {
      this._authStore.passwordRecovery({ email: this.form.get('email')!.value! })
    }
  }
}
