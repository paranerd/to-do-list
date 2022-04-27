import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('Should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('Should confirm that cookie exists', () => {
    document.cookie = 'debug=worx';
    const exists = AuthGuard.cookieExists('debug');
    expect(exists).toBeTrue();
  });

  it('Should get cookie content', () => {
    document.cookie = 'debug=worx';
    const cookie = AuthGuard.getCookie('debug');
    expect(cookie).toEqual('worx');
  });

  it('Should confirm that cookie does not exist', () => {
    const exists = AuthGuard.cookieExists('xyz');
    expect(exists).toBeFalse();
  });
});
