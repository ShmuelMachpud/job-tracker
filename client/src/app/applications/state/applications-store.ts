import { computed, inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';

import { ApplicationsApi } from '../data/applications-api';
import { ApplicationDetailsRequest } from '../models/application-details-request';
import { ApplicationStatus } from '../models/application-status';
import { JobApplication } from '../models/job-application';

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Injectable({ providedIn: 'root' })
export class ApplicationsStore {
  private readonly api = inject(ApplicationsApi);
  private readonly snackBar = inject(MatSnackBar);

  private readonly items = signal<JobApplication[]>([]);
  private readonly state = signal<LoadState>('idle');

  readonly loadState = this.state.asReadonly();

  /** כל ההגשות, החדשה ביותר למעלה. */
  readonly applications = computed(() =>
    [...this.items()].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
  );

  load(): void {
    this.state.set('loading');
    this.api.getAll().subscribe({
      next: (applications) => {
        this.items.set(applications);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }

  /** מחזיר Observable כי מי שקרא צריך לדעת אם השמירה הצליחה (למשל כדי לסגור חלון). */
  create(request: ApplicationDetailsRequest): Observable<JobApplication> {
    return this.api
      .create(request)
      .pipe(tap((created) => this.items.update((list) => [...list, created])));
  }

  changeStatus(id: string, status: ApplicationStatus): void {
    this.api.changeStatus(id, status).subscribe({
      next: (updated) => this.replace(updated),
      error: () => {
        this.snackBar.open('שינוי הסטטוס נכשל. הרשימה נטענה מחדש.', 'סגור', { duration: 5000 });
        this.load();
      },
    });
  }

  private replace(updated: JobApplication): void {
    this.items.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
  }
}
