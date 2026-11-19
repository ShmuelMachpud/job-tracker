import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { JobDetailsSuggestion } from '../models/job-details-suggestion';

@Injectable({ providedIn: 'root' })
export class JobExtractionApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/job-extraction`;

  extract(url: string): Observable<JobDetailsSuggestion> {
    return this.http.post<JobDetailsSuggestion>(this.url, { url });
  }
}
