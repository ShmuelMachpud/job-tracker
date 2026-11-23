import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { IsoDateTime, StatusChange } from '../../models/job-application';
import { StatusBadge } from '../status-badge/status-badge';

/** רשימת שינויי הסטטוס של משרה, האחרון למעלה. */
@Component({
  imports: [DatePipe, StatusBadge],
  selector: 'app-status-history',
  styleUrl: './status-history.scss',
  templateUrl: './status-history.html',
})
export class StatusHistory {
  readonly history = input.required<StatusChange[]>();
  /** מתי המשרה נוספה למערכת. */
  readonly createdAt = input<IsoDateTime | null>(null);
  /** כשנרשמה שעת הגשה, גם הרשומה הראשונה מוצגת עם שעה. */
  readonly timeKnown = input(false);

  protected readonly entries = computed(() =>
    [...this.history()].reverse().map((change) => ({
      ...change,
      dateOnly: !this.timeKnown() && isBeforeCreation(change, this.createdAt()),
    })),
  );
}

/**
 * רשומה מלפני שהמשרה נוספה למערכת היא תאריך ההגשה של משרה שנוספה באיחור.
 * השעה שלה לא ידועה, ולכן מציגים רק את התאריך.
 */
export function isBeforeCreation(change: StatusChange, createdAt: IsoDateTime | null): boolean {
  return createdAt !== null && Date.parse(change.at) < Date.parse(createdAt);
}
