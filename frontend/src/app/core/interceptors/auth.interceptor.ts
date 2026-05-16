import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Funkcionalni HTTP interceptor (Angular 17+ style).
 * Dodaje "Authorization: Bearer <token>" na zahtjeve ka našem API-ju.
 * Token se ne šalje na zahtjeve trećih strana — sigurnosna praksa.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Šalji token samo na naš API
  const isOurApi = req.url.startsWith(environment.apiBaseUrl);

  if (token && isOurApi) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
