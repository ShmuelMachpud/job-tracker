import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { FollowUp } from '../../logic/follow-ups';
import { JobApplication } from '../../models/job-application';

@Component({
  imports: [MatIconModule],
  selector: 'app-follow-up-list',
  styleUrl: './follow-up-list.scss',
  templateUrl: './follow-up-list.html',
})
export class FollowUpList {
  readonly items = input.required<FollowUp[]>();
  readonly selected = output<JobApplication>();

  protected describe({ reason }: FollowUp): string {
    if (reason.kind === 'waiting') {
      return `${formatDays(reason.days)} בלי תגובה`;
    }

    const action = reason.action ?? 'פעולה הבאה';
    return reason.daysLate === 0 ? `${action} · היום` : `${action} · באיחור של ${formatDays(reason.daysLate)}`;
  }
}

function formatDays(days: number): string {
  if (days === 1) {
    return 'יום';
  }
  if (days === 2) {
    return 'יומיים';
  }
  return `${days} ימים`;
}
