import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { FollowUpEntry, followUpKey } from '../../logic/follow-up-entries';
import { JobApplication } from '../../models/job-application';
import { Recruiter } from '../../../recruiters/models/recruiter';

@Component({
  imports: [MatIconModule],
  selector: 'app-follow-up-list',
  styleUrl: './follow-up-list.scss',
  templateUrl: './follow-up-list.html',
})
export class FollowUpList {
  readonly items = input.required<FollowUpEntry[]>();
  readonly selected = output<JobApplication>();
  readonly recruiterSelected = output<Recruiter>();

  protected readonly key = followUpKey;

  protected select(entry: FollowUpEntry): void {
    if (entry.kind === 'application') {
      this.selected.emit(entry.followUp.application);
    } else {
      this.recruiterSelected.emit(entry.followUp.recruiter);
    }
  }

  protected title(entry: FollowUpEntry): string {
    return entry.kind === 'application'
      ? entry.followUp.application.company
      : entry.followUp.recruiter.name;
  }

  protected describe(entry: FollowUpEntry): string {
    const reason = entry.followUp.reason;

    if (reason.kind === 'waiting') {
      return `${formatDays(reason.days)} בלי תגובה`;
    }
    if (reason.kind === 'silent') {
      return `${formatDays(reason.days)} בלי קשר, ויש משרות פעילות`;
    }

    const action = reason.action ?? 'פעולה הבאה';
    return reason.daysLate === 0
      ? `${action} · היום`
      : `${action} · באיחור של ${formatDays(reason.daysLate)}`;
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
