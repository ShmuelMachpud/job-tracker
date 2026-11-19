import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { JobExtractionApi } from '../../data/job-extraction-api';
import { ApplicationForm, applySuggestion } from '../../forms/application-form';

type ImportState = 'idle' | 'loading' | 'done' | 'error';

/** "הדבק קישור": מבקש מהשרת הצעה, וממלא בה את השדות הריקים בטופס שקיבל. */
@Component({
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  selector: 'app-job-link-import',
  styleUrl: './job-link-import.scss',
  templateUrl: './job-link-import.html',
})
export class JobLinkImport {
  readonly form = input.required<ApplicationForm>();

  private readonly api = inject(JobExtractionApi);

  protected readonly link = new FormControl('', { nonNullable: true });
  protected readonly state = signal<ImportState>('idle');
  protected readonly message = signal<string | null>(null);

  protected extract(): void {
    const url = this.link.value.trim();
    if (url === '') {
      this.finish('error', 'הדבק קודם קישור למשרה');
      return;
    }

    this.state.set('loading');
    this.message.set(null);

    this.api.extract(url).subscribe({
      next: (suggestion) => {
        const filled = applySuggestion(this.form(), suggestion);
        const details = filled.filter((label) => label !== 'קישור');

        if (details.length === 0) {
          this.finish('error', 'לא מצאנו פרטים חדשים בדף. הקישור נשמר, ואת השאר אפשר למלא ידנית.');
        } else {
          this.finish('done', `מילאנו: ${details.join(', ')}. כדאי לעבור על הפרטים לפני השמירה.`);
        }
      },
      error: (error: HttpErrorResponse) => this.finish('error', errorMessage(error)),
    });
  }

  private finish(state: ImportState, message: string): void {
    this.state.set(state);
    this.message.set(message);
  }
}

/** השרת מחזיר את סיבת הכישלון בשדה errors.url. אם אין, מציגים הודעה כללית. */
function errorMessage(error: HttpErrorResponse): string {
  const fromServer: unknown = error.error?.errors?.url?.[0];
  return typeof fromServer === 'string'
    ? fromServer
    : 'לא הצלחנו לקרוא את הקישור. אפשר למלא את הפרטים ידנית.';
}
