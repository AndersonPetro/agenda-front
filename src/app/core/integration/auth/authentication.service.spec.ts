import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from 'src/app/core/integration/auth/authentication.service';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AuthenticationService
      ]
    });
    service = TestBed.inject(AuthenticationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
