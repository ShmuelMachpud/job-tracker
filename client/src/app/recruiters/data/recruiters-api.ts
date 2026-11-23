import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Recruiter, RecruiterRequest } from '../models/recruiter';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecruitersApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/recruiters`;

  getAll(): Observable<Recruiter[]> {
    return this.http.get<Recruiter[]>(this.baseUrl);
  }

  create(request: RecruiterRequest): Observable<Recruiter> {
    return this.http.post<Recruiter>(this.baseUrl, request);
  }

  update(id: string, request: RecruiterRequest): Observable<Recruiter> {
    return this.http.put<Recruiter>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
