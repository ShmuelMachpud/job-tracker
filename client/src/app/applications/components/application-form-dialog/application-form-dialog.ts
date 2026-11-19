import { Component, computed, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';

import { createApplicationForm, toDetailsRequest, toFormValue } from '../../forms/application-form';
import { APPLICATION_STATUSES, ApplicationStatus } from '../../models/application-status';
import { JobApplication } from '../../models/job-application';
import { ApplicationsStore } from '../../state/applications-store';
import { JobLinkImport } from '../job-link-import/job-link-import';
import { StatusBadge } from '../status-badge/status-badge';
import { StatusHistory } from '../status-history/status-history';

/** מה פותחים: null למשרה חדשה, או משרה קיימת לעריכה. */
export interface ApplicationFormDialogData {
  application: JobApplication | null;
}

/** מה קרה בחלון. כשהחלון נסגר בלי פעולה, התוצאה היא undefined. */
export type ApplicationFormDialogResult =
  | { kind: 'created'; application: JobApplication }
  | { kind: 'updated'; application: JobApplication }
  | { kind: 'deleted'; application: JobApplication };

type BusyState = 'idle' | 'saving' | 'deleting';

@Component({
  imports: [
    JobLinkImport,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    StatusBadge,
    StatusHistory,
  ],
  selector: 'app-application-form-dialog',
  styleUrl: './application-form-dialog.scss',
  templateUrl: './application-form-dialog.html',
})
export class ApplicationFormDialog {
  private readonly store = inject(ApplicationsStore);
  private readonly dialogRef =
    inject<MatDialogRef<ApplicationFormDialog, ApplicationFormDialogResult>>(MatDialogRef);

  /** המשרה שנערכת, או null כשמוסיפים משרה חדשה. */
  protected readonly existing = inject<ApplicationFormDialogData>(MAT_DIALOG_DATA).application;

  protected readonly form = createApplicationForm(inject(NonNullableFormBuilder));

  /**
   * הסטטוס לא חלק מהטופס, כי הוא לא נשמר עם הפרטים.
   * במשרה חדשה בוחרים בו את סטטוס ההתחלה. בעריכה הוא נעול: משנים אותו מהטבלה, כדי שיירשם בהיסטוריה.
   */
  protected readonly statusControl = new FormControl<ApplicationStatus>(
    { value: this.existing?.status ?? 'applied', disabled: this.existing !== null },
    { nonNullable: true },
  );
  protected readonly statuses = APPLICATION_STATUSES;

  private readonly status: Signal<ApplicationStatus> = toSignal(this.statusControl.valueChanges, {
    initialValue: this.statusControl.value,
  });

  /** משרה שטרם הוגשה: התאריך הוא תאריך השמירה, לא תאריך ההגשה. */
  protected readonly dateLabel = computed(() =>
    this.status() === 'notApplied' ? 'תאריך שמירה' : 'תאריך הגשה',
  );

  protected readonly busy = signal<BusyState>('idle');
  protected readonly confirmingDelete = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly deleteLabel = computed(() => {
    if (this.busy() === 'deleting') {
      return 'מוחק...';
    }
    return this.confirmingDelete() ? 'בטוח? לחץ שוב למחיקה' : 'מחיקה';
  });

  constructor() {
    if (this.existing) {
      this.form.setValue(toFormValue(this.existing));
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const details = toDetailsRequest(this.form.getRawValue());
    const existing = this.existing;
    const save$: Observable<JobApplication> = existing
      ? this.store.update(existing.id, details)
      : this.store.create({ details, status: this.statusControl.value });
    const kind = existing ? 'updated' : 'created';

    this.start('saving');
    save$.subscribe({
      next: (application) => this.dialogRef.close({ kind, application }),
      error: () => this.fail('השמירה נכשלה. הפרטים שמילאת נשמרו בחלון, אפשר לנסות שוב.'),
    });
  }

  /** לחיצה ראשונה מבקשת אישור, לחיצה שנייה מוחקת. */
  protected delete(): void {
    const existing = this.existing;
    if (!existing) {
      return;
    }

    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      return;
    }

    this.start('deleting');
    this.store.delete(existing.id).subscribe({
      next: () => this.dialogRef.close({ kind: 'deleted', application: existing }),
      error: () => this.fail('המחיקה נכשלה. אפשר לנסות שוב.'),
    });
  }

  private start(state: BusyState): void {
    this.busy.set(state);
    this.error.set(null);
  }

  private fail(message: string): void {
    this.busy.set('idle');
    this.confirmingDelete.set(false);
    this.error.set(message);
  }
}
