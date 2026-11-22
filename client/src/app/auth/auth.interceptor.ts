import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { loginUrl } from './auth-urls';

/**
 * עובר על כל בקשה לשרת:
 * 1. שולח איתה את עוגיית ההתחברות. בפיתוח השרת בכתובת אחרת, ובלי זה הדפדפן לא שולח עוגיות.
 * 2. אם השרת עונה 401 (לא מחובר, או שהעוגייה פגה), מעביר לדף ההתחברות.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) =>
  next(request.clone({ withCredentials: true })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        window.location.assign(loginUrl());
      }
      return throwError(() => error);
    }),
  );
