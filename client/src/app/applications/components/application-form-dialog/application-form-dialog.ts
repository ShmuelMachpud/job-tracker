import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { createApplicationForm, toDetailsRequest } from '../../forms/application-form';
import { JobApplication } from '../../models/job-application';
import { ApplicationsStore } from '../../state/applications-store';

@Component({
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  selector: 'app-application-form-dialog',
  styleUrl: './application-form-dialog.scss',
  templateUrl: './application-form-dialog.html',
})
export class ApplicationFormDialog {
  private readonly store = inject(ApplicationsStore);
  private readonly dialogRef = inject<MatDialogRef<ApplicationFormDialog, JobApplication>>(MatDialogRef);

  protected readonly form = createApplicationForm(inject(NonNullableFormBuilder));
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    this.store.create(toDetailsRequest(this.form.getRawValue())).subscribe({
      next: (created) => this.dialogRef.close(created),
      error: () => {
        this.saving.set(false);
        this.saveError.set('השמירה נכשלה. הפרטים שמילאת נשמרו בחלון, אפשר לנסות שוב.');
      },
    });
  }
}
