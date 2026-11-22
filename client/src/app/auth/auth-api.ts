import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

/** המשתמש המחובר. מקביל ל־CurrentUserResponse בשרת. */
export interface CurrentUser {
  email: string;
  name: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  me(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${environment.apiBaseUrl}/me`);
  }
}
