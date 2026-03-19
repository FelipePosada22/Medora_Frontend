import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthStateService } from '../services/auth-state.service';

/**
 * HTTP interceptor that:
 * 1. Attaches the Bearer token to every outgoing request.
 * 2. On any 401 response, clears the local session and redirects to login.
 *    This handles token expiry, revoked tokens, and malformed tokens uniformly.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenSvc   = inject(TokenService);
  const authState  = inject(AuthStateService);
  const router     = inject(Router);

  const token = tokenSvc.getAccessToken();

  const authedReq = token && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isLogoutRequest = authedReq.url.endsWith('/auth/logout');
      if (err.status === 401 && !isLogoutRequest) {
        authState.clearSession();
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    }),
  );
};
