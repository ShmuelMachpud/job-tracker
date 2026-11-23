import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { matchRecruiters, recruiterLabel } from '../../logic/recruiter-summary';
import { Recruiter } from '../../models/recruiter';
import { RecruitersStore } from '../../state/recruiters-store';
import {
  RecruiterFormDialog,
  RecruiterFormDialogData,
  RecruiterFormDialogResult,
} from '../recruiter-form-dialog/recruiter-form-dialog';

/** הערך של האפשרות "+ מגייס חדש" ברשימה. */
const NEW_RECRUITER = '__new__';

/** בשדה יש מגייס שנבחר מהרשימה, או טקסט שהמשתמש מקליד. */
type PickerValue = Recruiter | string;

/**
 * בחירת מגייס למשרה, עם השלמה אוטומטית.
 * הערך שנשמר בטופס הוא מזהה המגייס (control). מה שרואים בשדה הוא השם (text).
 * טקסט שלא נבחר מהרשימה הוא שגיאה, כדי שלא יישמר בטעות "בלי מגייס".
 */
@Component({
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  selector: 'app-recruiter-picker',
  styleUrl: './recruiter-picker.scss',
  templateUrl: './recruiter-picker.html',
})
export class RecruiterPicker implements OnInit {
  /** מזהה המגייס בטופס המשרה. ריק = בלי מגייס. */
  readonly control = input.required<FormControl<string>>();

  private readonly store = inject(RecruitersStore);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly text = new FormControl<PickerValue>('', { nonNullable: true });
  private readonly typed = signal('');

  protected readonly newRecruiter = NEW_RECRUITER;
  protected readonly options = computed(() =>
    matchRecruiters(this.store.recruiters(), this.typed()),
  );
  protected readonly typedName = computed(() => this.typed().trim());

  /** השגיאה שייכת לשדה המזהה, אבל מוצגת בשדה הטקסט. */
  protected readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: () => {
      const control = this.control();
      return control.invalid && (control.touched || this.text.touched);
    },
  };

  private readonly unmatched: ValidatorFn = () => {
    const value = this.text.value;
    return typeof value === 'string' && value.trim() !== '' ? { unmatchedRecruiter: true } : null;
  };

  ngOnInit(): void {
    const control = this.control();
    control.addValidators(this.unmatched);
    this.destroyRef.onDestroy(() => control.removeValidators(this.unmatched));

    const selected = control.value ? this.store.byId().get(control.value) : undefined;
    this.text.setValue(selected ?? '');

    this.text.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value === NEW_RECRUITER) {
        return;
      }
      this.typed.set(typeof value === 'string' ? value : '');
      control.setValue(typeof value === 'string' ? '' : value.id);
      control.markAsDirty();
    });
  }

  protected display = (value: PickerValue | null): string =>
    !value || value === NEW_RECRUITER
      ? ''
      : typeof value === 'string'
        ? value
        : recruiterLabel(value);

  protected label(recruiter: Recruiter): string {
    return recruiterLabel(recruiter);
  }

  protected onSelected(event: MatAutocompleteSelectedEvent): void {
    if (event.option.value !== NEW_RECRUITER) {
      return;
    }
    // הרשימה כבר שמה בשדה את ערך האפשרות. מחזירים את מה שהוקלד, ופותחים חלון למגייס חדש
    const name = this.typedName();
    this.text.setValue(name);
    this.dialog
      .open<RecruiterFormDialog, RecruiterFormDialogData, RecruiterFormDialogResult>(
        RecruiterFormDialog,
        { data: { recruiter: null, initialName: name }, width: '640px', maxWidth: '95vw' },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.kind === 'created') {
          this.text.setValue(result.recruiter);
        }
      });
  }

  protected clear(): void {
    this.text.setValue('');
  }

  protected hasSelection(): boolean {
    return typeof this.text.value !== 'string';
  }
}
