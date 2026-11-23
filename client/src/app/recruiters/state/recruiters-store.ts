import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApplicationsStore, LoadState } from '../../applications/state/applications-store';
import { RecruitersApi } from '../data/recruiters-api';
import { Recruiter, RecruiterRequest } from '../models/recruiter';

@Injectable({ providedIn: 'root' })
export class RecruitersStore {
  private readonly api = inject(RecruitersApi);
  private readonly applications = inject(ApplicationsStore);

  private readonly items = signal<Recruiter[]>([]);
  private readonly state = signal<LoadState>('idle');

  readonly loadState = this.state.asReadonly();

  /** כל המגייסים, לפי שם. */
  readonly recruiters = computed(() =>
    [...this.items()].sort((a, b) => a.name.localeCompare(b.name, 'he')),
  );

  /** חיפוש מהיר לפי מזהה, למשל כדי להציג את שם המגייס בשורה של משרה. */
  readonly byId = computed(() => new Map(this.items().map((item) => [item.id, item])));

  load(): void {
    this.state.set('loading');
    this.api.getAll().subscribe({
      next: (recruiters) => {
        this.items.set(recruiters);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }

  /** טוען רק אם עוד לא נטען, כדי שמעבר בין מסכים לא יטען הכול מחדש. */
  ensureLoaded(): void {
    if (this.state() === 'idle' || this.state() === 'error') {
      this.load();
    }
  }

  /** מגייס שהשתנה בשרת דרך פעולה אחרת (למשל רשומה ביומן שעדכנה את "קשר אחרון"). */
  replace(updated: Recruiter): void {
    this.items.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
  }

  create(request: RecruiterRequest): Observable<Recruiter> {
    return this.api
      .create(request)
      .pipe(tap((created) => this.items.update((list) => [...list, created])));
  }

  update(id: string, request: RecruiterRequest): Observable<Recruiter> {
    return this.api.update(id, request).pipe(tap((updated) => this.replace(updated)));
  }

  /** השרת מנתק את המשרות של המגייס. כאן מנתקים גם את העותק שבזיכרון, בלי לטעון מחדש. */
  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this.items.update((list) => list.filter((item) => item.id !== id));
        this.applications.detachRecruiter(id);
      }),
    );
  }
}
