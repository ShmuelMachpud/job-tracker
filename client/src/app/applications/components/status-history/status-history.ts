import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { StatusChange } from '../../models/job-application';
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

  protected readonly entries = computed(() => [...this.history()].reverse());
}
