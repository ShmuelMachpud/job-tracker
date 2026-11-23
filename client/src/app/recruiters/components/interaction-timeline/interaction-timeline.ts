import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { JobApplication } from '../../../applications/models/job-application';
import {
  Interaction,
  INTERACTION_CHANNEL_ICONS,
  INTERACTION_CHANNEL_LABELS,
  INTERACTION_DIRECTION_LABELS,
} from '../../models/interaction';
import { Recruiter } from '../../models/recruiter';
import { InteractionsStore } from '../../state/interactions-store';
import { InteractionForm } from '../interaction-form/interaction-form';

/**
 * רשומות היומן, החדשה למעלה.
 * עם מגייס (recruiter) אפשר לערוך ולמחוק כל רשומה בתוך הרשימה. בלי מגייס הרשימה לקריאה בלבד.
 */
@Component({
  imports: [DatePipe, InteractionForm, MatButtonModule, MatIconModule],
  selector: 'app-interaction-timeline',
  styleUrl: './interaction-timeline.scss',
  templateUrl: './interaction-timeline.html',
})
export class InteractionTimeline {
  readonly interactions = input.required<Interaction[]>();
  /** המשרות, כדי להציג את שם המשרה של כל רשומה (ולבחור משרה בעריכה). */
  readonly jobs = input<JobApplication[]>([]);
  readonly recruiter = input<Recruiter | null>(null);
  /** במסך של משרה אחת אין טעם להציג שוב את שם המשרה בכל רשומה. */
  readonly showJob = input(true);

  private readonly store = inject(InteractionsStore);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly channelLabels = INTERACTION_CHANNEL_LABELS;
  protected readonly channelIcons = INTERACTION_CHANNEL_ICONS;
  protected readonly directionLabels = INTERACTION_DIRECTION_LABELS;

  protected readonly editingId = signal<string | null>(null);
  protected readonly confirmingDeleteId = signal<string | null>(null);

  private readonly jobsById = computed(() => new Map(this.jobs().map((job) => [job.id, job])));

  protected jobLabel(interaction: Interaction): string | null {
    if (!this.showJob() || interaction.applicationId === null) {
      return null;
    }
    const job = this.jobsById().get(interaction.applicationId);
    return job ? `${job.company} · ${job.role}` : null;
  }

  protected edit(interaction: Interaction): void {
    this.confirmingDeleteId.set(null);
    this.editingId.set(interaction.id);
  }

  /** לחיצה ראשונה מבקשת אישור, לחיצה שנייה מוחקת. */
  protected delete(interaction: Interaction): void {
    if (this.confirmingDeleteId() !== interaction.id) {
      this.confirmingDeleteId.set(interaction.id);
      return;
    }

    this.store.delete(interaction.id).subscribe({
      next: () => this.confirmingDeleteId.set(null),
      error: () => {
        this.confirmingDeleteId.set(null);
        this.snackBar.open('המחיקה נכשלה. אפשר לנסות שוב.', 'סגור', { duration: 5000 });
      },
    });
  }
}
