import { Component, computed, input } from '@angular/core';

const TONES = ['violet', 'teal', 'coral', 'pink', 'blue', 'amber'] as const;
type AvatarTone = (typeof TONES)[number];

/** ריבוע צבעוני עם האות הראשונה של שם החברה. אותה חברה תמיד מקבלת אותו צבע. */
@Component({
  host: { '[attr.data-tone]': 'tone()', 'aria-hidden': 'true' },
  selector: 'app-company-avatar',
  styleUrl: './company-avatar.scss',
  template: '{{ initial() }}',
})
export class CompanyAvatar {
  readonly company = input.required<string>();

  protected readonly initial = computed(() => [...this.company().trim()][0]?.toUpperCase() ?? '?');
  protected readonly tone = computed(() => toneFor(this.company()));
}

function toneFor(company: string): AvatarTone {
  let sum = 0;
  for (const char of company.trim()) {
    sum += char.codePointAt(0) ?? 0;
  }
  return TONES[sum % TONES.length];
}
