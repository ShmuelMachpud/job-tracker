import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ApplicationStatus,
} from '../../models/application-status';
import { JobApplication } from '../../models/job-application';
import { jobLink, jobSubtitle, jobTitle } from '../../logic/job-labels';
import { CompanyAvatar } from '../company-avatar/company-avatar';
import { StatusBadge } from '../status-badge/status-badge';
import { Recruiter } from '../../../recruiters/models/recruiter';

export interface StatusChangeEvent {
  id: string;
  status: ApplicationStatus;
}

@Component({
  imports: [
    CompanyAvatar,
    DatePipe,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    RouterLink,
    StatusBadge,
  ],
  selector: 'app-applications-table',
  styleUrl: './applications-table.scss',
  templateUrl: './applications-table.html',
})
export class ApplicationsTable {
  readonly applications = input.required<JobApplication[]>();
  readonly statusChange = output<StatusChangeEvent>();
  readonly rowSelected = output<JobApplication>();

  /**
   * המגייסים, כדי להציג את שם המגייס בכל שורה.
   * בלי מגייסים (למשל במסך של מגייס אחד, שבו כולן שלו) אין עמודת מגייס.
   */
  readonly recruiters = input<ReadonlyMap<string, Recruiter> | null>(null);

  protected readonly columns = computed(() =>
    this.recruiters()
      ? ['job', 'status', 'recruiter', 'nextAction']
      : ['job', 'status', 'nextAction'],
  );
  protected readonly statuses = APPLICATION_STATUSES;

  /** הרכיב לא מוסיף כאן את המגייס לשם: הוא מופיע בעמודה משלו (ובטלפון בשורה מתחת). */
  protected title(application: JobApplication): string {
    return jobTitle(application);
  }

  protected readonly subtitle = jobSubtitle;
  protected readonly link = jobLink;

  protected recruiterFor(application: JobApplication): Recruiter | null {
    return application.recruiterId
      ? (this.recruiters()?.get(application.recruiterId) ?? null)
      : null;
  }

  protected rowLabel(application: JobApplication): string {
    return `${jobTitle(application)}, ${application.role}. לחץ לפרטי המשרה`;
  }

  protected statusTriggerLabel(application: JobApplication): string {
    return `סטטוס: ${APPLICATION_STATUS_LABELS[application.status]}. לחץ לשינוי`;
  }

  protected selectStatus(application: JobApplication, status: ApplicationStatus): void {
    if (status !== application.status) {
      this.statusChange.emit({ id: application.id, status });
    }
  }
}
