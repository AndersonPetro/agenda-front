import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordComponent } from 'src/app/auth/forgot-password/forgot-password.component';
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { INITIAL_STATE } from "@ngrx/store";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { StoreRootModule } from "src/app/store/store-root.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthStore } from "src/app/store/auth/auth.store";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MaterialModule } from "src/app/material/material.module";

describe('ForgetPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let store: MockStore;
  const initialState = INITIAL_STATE;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        StoreRootModule,
        ReactiveFormsModule,
        MaterialModule
      ],
      providers: [
        AuthStore,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
