import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

/**
 * HTTP interceptor that attaches the Bearer token to every outgoing request.
 * Skips requests that already carry an Authorization header.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getAccessToken();

  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }
  return next(
    req.clone({ setHeaders: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMDVkODUzMi0zMWNjLTQ1MjctOWU5Yy03ZDI2MmEwZDZjYTkiLCJ0ZW5hbnRJZCI6ImRlZDUzZWQxLWQ4YTMtNDZlNy1hZDRkLTgyOTQ1NmU3N2RhZiIsImlhdCI6MTc3MzE5Nzg0NywiZXhwIjoxNzczMjg0MjQ3fQ.QF3zItB6F25t0qaC1nwbvFHjAKEyHhSGqJtoPof0EaM` } }),
  );
};
