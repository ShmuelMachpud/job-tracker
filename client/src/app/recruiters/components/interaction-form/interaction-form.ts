import { Component, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import {
  FormGroupDirective,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';

import { todayIsoDate } from '../../../applications/logic/iso-date';
import { JobApplication } from '../../../applications/models/job-application';
import {
  Interaction,
  INTERACTION_CHANNEL_ICONS,
  INTERACTION_CHANNEL_LABELS,
  INTERACTION_CHANNELS,
  INTERACTION_DIRECTION_LABELS,
  INTERACTION_DIRECTIONS,
  InteractionChannel,
  InteractionDirection,
  InteractionRequest,
  InteractionResponse,
} from '../../models/interaction';
import { Recruiter } from '../../models/recruiter';
import { InteractionsStore } from '../../state/interactions-store';

const notBlank: ValidatorFn = (control) =>
  String(control.value ?? '').trim() === '' ? { required: true } : null;

/**
 * טופס קצר לרשומה ביומן, בתוך הדף ולא בחלון.
 * ברשומה חדשה אפשר לעדכן באותה שמירה גם את הפעולה הבאה של המגייס.
 */
@Component({
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  selector: 'app-interaction-form',
  styleUrl: './interaction-form.scss',
  templateUrl: './interaction-form.html',
})
export class InteractionForm implements OnInit {
  readonly recruiter = input.required<Recruiter>();
  /** המשרות של המגייס, לבחירת המשרה שהרשומה עוסקת בה. */
  readonly jobs = input<JobApplication[]>([]);
  /** רשומה לעריכה. בלי רשומה, הטופס מוסיף רשומה חדשה. */
  readonly existing = input<Interaction | null>(null);

  readonly saved = output<InteractionResponse>();
  readonly cancelled = output<void>();

  private readonly store = inject(InteractionsStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly channels = INTERACTION_CHANNELS;
  protected readonly channelLabels = INTERACTION_CHANNEL_LABELS;
  protected readonly channelIcons = INTERACTION_CHANNEL_ICONS;
  protected readonly directions = INTERACTION_DIRECTIONS;
  protected readonly directionLabels = INTERACTION_DIRECTION_LABELS;

  protected readonly form = this.fb.group({
    date: [todayIsoDate(), notBlank],
    channel: ['phone' as InteractionChannel],
    direction: ['outgoing' as InteractionDirection],
    applicationId: [''],
    summary: ['', notBlank],
    updateNextAction: [false],
    nextAction: [''],
    nextActionAt: [''],
  });

  /** כדי לאפס גם את מצב "נשלח" של הטופס, ולא רק את הערכים. */
  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const existing = this.existing();
    if (existing) {
      this.form.patchValue({
        date: existing.date,
        channel: existing.channel,
        direction: existing.direction,
        applicationId: existing.applicationId ?? '',
        summary: existing.summary,
      });
    }

    // הפעולה הבאה מתחילה ממה שכבר רשום אצל המגייס, כדי שיהיה קל לעדכן אותה
    const recruiter = this.recruiter();
    this.form.patchValue({
      nextAction: recruiter.nextAction ?? '',
      nextActionAt: recruiter.nextActionAt ?? '',
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: InteractionRequest = {
      recruiterId: this.recruiter().id,
      applicationId: value.applicationId || null,
      date: value.date,
      channel: value.channel,
      direction: value.direction,
      summary: value.summary.trim(),
      nextAction: value.updateNextAction
        ? { action: value.nextAction.trim() || null, at: value.nextActionAt || null }
        : null,
    };

    const existing = this.existing();
    const save$: Observable<InteractionResponse> = existing
      ? this.store.update(existing.id, request)
      : this.store.create(request);

    this.busy.set(true);
    this.error.set(null);
    save$.subscribe({
      next: (response) => {
        this.busy.set(false);
        this.reset();
        this.saved.emit(response);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('השמירה נכשלה. אפשר לנסות שוב.');
      },
    });
  }

  /** אחרי הוספה הטופס מתרוקן לרשומה הבאה, ומשאיר את הערוץ והכיוון. */
  private reset(): void {
    if (this.existing()) {
      return;
    }
    // בלי resetForm, השדות הריקים היו מוצגים מיד כשגיאה (הטופס עדיין במצב "נשלח")
    const { channel, direction, nextAction, nextActionAt } = this.form.getRawValue();
    this.formDirective().resetForm({
      date: todayIsoDate(),
      channel,
      direction,
      applicationId: '',
      summary: '',
      updateNextAction: false,
      nextAction,
      nextActionAt,
    });
  }
}
