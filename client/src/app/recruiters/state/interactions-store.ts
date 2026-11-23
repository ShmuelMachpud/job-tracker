import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { LoadState } from '../../applications/state/applications-store';
import { InteractionsApi } from '../data/interactions-api';
import { sortInteractions } from '../logic/interactions';
import { Interaction, InteractionRequest, InteractionResponse } from '../models/interaction';
import { RecruitersStore } from './recruiters-store';

@Injectable({ providedIn: 'root' })
export class InteractionsStore {
  private readonly api = inject(InteractionsApi);
  private readonly recruiters = inject(RecruitersStore);

  private readonly items = signal<Interaction[]>([]);
  private readonly state = signal<LoadState>('idle');

  readonly loadState = this.state.asReadonly();

  /**
   * כל הרשומות, החדשה ביותר למעלה.
   * רשומות של מגייס שנמחק לא מוצגות: השרת כבר מחק אותן, וכאן לא צריך לטעון מחדש.
   */
  readonly interactions = computed(() => {
    const recruiters = this.recruiters.byId();
    return sortInteractions(this.items().filter((item) => recruiters.has(item.recruiterId)));
  });

  load(): void {
    this.state.set('loading');
    this.api.getAll().subscribe({
      next: (interactions) => {
        this.items.set(interactions);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }

  ensureLoaded(): void {
    if (this.state() === 'idle' || this.state() === 'error') {
      this.load();
    }
  }

  /** השרת מעדכן גם את המגייס (קשר אחרון, פעולה הבאה), ולכן מעדכנים גם אותו בזיכרון. */
  create(request: InteractionRequest): Observable<InteractionResponse> {
    return this.api.create(request).pipe(
      tap(({ interaction, recruiter }) => {
        this.items.update((list) => [...list, interaction]);
        this.recruiters.replace(recruiter);
      }),
    );
  }

  update(id: string, request: InteractionRequest): Observable<InteractionResponse> {
    return this.api.update(id, request).pipe(
      tap(({ interaction, recruiter }) => {
        this.items.update((list) =>
          list.map((item) => (item.id === interaction.id ? interaction : item)),
        );
        this.recruiters.replace(recruiter);
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this.api
      .delete(id)
      .pipe(tap(() => this.items.update((list) => list.filter((item) => item.id !== id))));
  }
}
