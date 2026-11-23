import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';

import { ApplicationsStore } from '../../../applications/state/applications-store';
import { createRecruiterForm, toFormValue, toRecruiterRequest } from '../../forms/recruiter-form';
import { countJobsByRecruiter, jobCountFor } from '../../logic/recruiter-summary';
import { RECRUITER_KIND_LABELS, RECRUITER_KINDS, Recruiter } from '../../models/recruiter';
import { RecruitersStore } from '../../state/recruiters-store';

/** מה פותחים: null למגייס חדש (אפשר עם שם התחלתי), או מגייס קיים לעריכה. */
export interface RecruiterFormDialogData {
  recruiter: Recruiter | null;
  initialName?: string;
}

/** מה קרה בחלון. כשהחלון נסגר בלי פעולה, התוצאה היא undefined. */
export type RecruiterFormDialogResult =
  | { kind: 'created'; recruiter: Recruiter }
  | { kind: 'updated'; recruiter: Recruiter }
  | { kind: 'deleted'; recruiter: Recruiter };

type BusyState = 'idle' | 'saving' | 'deleting';

@Component({
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  selector: 'app-recruiter-form-dialog',
  styleUrl: './recruiter-form-dialog.scss',
  templateUrl: './recruiter-form-dialog.html',
})
export class RecruiterFormDialog {
  private readonly store = inject(RecruitersStore);
  private readonly applications = inject(ApplicationsStore);
  private readonly dialogRef =
    inject<MatDialogRef<RecruiterFormDialog, RecruiterFormDialogResult>>(MatDialogRef);
  private readonly data = inject<RecruiterFormDialogData>(MAT_DIALOG_DATA);

  /** המגייס שנערך, או null כשמוסיפים מגייס חדש. */
  protected readonly existing = this.data.recruiter;

  protected readonly form = createRecruiterForm(inject(NonNullableFormBuilder));
  protected readonly kinds = RECRUITER_KINDS;
  protected readonly kindLabels = RECRUITER_KIND_LABELS;

  protected readonly busy = signal<BusyState>('idle');
  protected readonly confirmingDelete = signal(false);
  protected readonly error = signal<string | null>(null);

  /** כמה משרות יתנתקו אם המגייס יימחק. */
  private readonly linkedJobs = computed(() =>
    this.existing
      ? jobCountFor(countJobsByRecruiter(this.applications.applications()), this.existing.id).total
      : 0,
  );

  protected readonly deleteLabel = computed(() => {
    if (this.busy() === 'deleting') {
      return 'מוחק...';
    }
    if (!this.confirmingDelete()) {
      return 'מחיקה';
    }
    const jobs = this.linkedJobs();
    if (jobs === 0) {
      return 'בטוח? לחץ שוב למחיקה';
    }
    const detached = jobs === 1 ? 'משרה אחת תתנתק' : `${jobs} משרות יתנתקו`;
    return `בטוח? ${detached} ממנו. לחץ שוב למחיקה`;
  });

  constructor() {
    if (this.existing) {
      this.form.setValue(toFormValue(this.existing));
    } else if (this.data.initialName) {
      this.form.controls.name.setValue(this.data.initialName.trim());
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = toRecruiterRequest(this.form.getRawValue());
    const existing = this.existing;
    const save$: Observable<Recruiter> = existing
      ? this.store.update(existing.id, request)
      : this.store.create(request);
    const kind = existing ? 'updated' : 'created';

    this.start('saving');
    save$.subscribe({
      next: (recruiter) => this.dialogRef.close({ kind, recruiter }),
      error: () => this.fail('השמירה נכשלה. הפרטים שמילאת נשמרו בחלון, אפשר לנסות שוב.'),
    });
  }

  /** לחיצה ראשונה מבקשת אישור (ואומרת כמה משרות יתנתקו), לחיצה שנייה מוחקת. */
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
      next: () => this.dialogRef.close({ kind: 'deleted', recruiter: existing }),
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
