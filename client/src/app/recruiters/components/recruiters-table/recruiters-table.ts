import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { CompanyAvatar } from '../../../applications/components/company-avatar/company-avatar';
import { jobCountFor, RecruiterJobCount } from '../../logic/recruiter-summary';
import { RECRUITER_KIND_LABELS, Recruiter } from '../../models/recruiter';

@Component({
  imports: [CompanyAvatar, DatePipe, MatTableModule],
  selector: 'app-recruiters-table',
  styleUrl: './recruiters-table.scss',
  templateUrl: './recruiters-table.html',
})
export class RecruitersTable {
  readonly recruiters = input.required<Recruiter[]>();
  readonly jobCounts = input.required<ReadonlyMap<string, RecruiterJobCount>>();
  readonly rowSelected = output<Recruiter>();

  protected readonly columns = ['recruiter', 'jobs', 'lastContact', 'nextAction'];
  protected readonly kindLabels = RECRUITER_KIND_LABELS;

  protected jobs(recruiter: Recruiter): RecruiterJobCount {
    return jobCountFor(this.jobCounts(), recruiter.id);
  }

  protected activeLabel(active: number): string {
    if (active === 0) {
      return 'אין פעילות';
    }
    return active === 1 ? 'פעילה אחת' : `${active} פעילות`;
  }

  protected subtitle(recruiter: Recruiter): string {
    const kind = this.kindLabels[recruiter.kind];
    return recruiter.company ? `${kind} · ${recruiter.company}` : kind;
  }

  protected rowLabel(recruiter: Recruiter): string {
    return `${recruiter.name}, ${this.kindLabels[recruiter.kind]}. לחץ לפרטים`;
  }
}
