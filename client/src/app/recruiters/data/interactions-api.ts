import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Interaction, InteractionRequest, InteractionResponse } from '../models/interaction';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InteractionsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/interactions`;

  getAll(): Observable<Interaction[]> {
    return this.http.get<Interaction[]>(this.baseUrl);
  }

  create(request: InteractionRequest): Observable<InteractionResponse> {
    return this.http.post<InteractionResponse>(this.baseUrl, request);
  }

  update(id: string, request: InteractionRequest): Observable<InteractionResponse> {
    return this.http.put<InteractionResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
