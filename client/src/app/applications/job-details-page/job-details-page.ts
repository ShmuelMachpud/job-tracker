import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import {
  ApplicationFormDialog,
  ApplicationFormDialogData,
  ApplicationFormDialogResult,
} from '../components/application-form-dialog/application-form-dialog';
import { CompanyAvatar } from '../components/company-avatar/company-avatar';
import { StatusBadge } from '../components/status-badge/status-badge';
import { StatusHistory } from '../components/status-history/status-history';
import { isArchived } from '../logic/archive';
import { jobLink, jobSubtitle, jobTitle } from '../logic/job-labels';
import { APPLICATION_STATUSES, ApplicationStatus } from '../models/application-status';
import { JobApplication } from '../models/job-application';
import { ApplicationsStore } from '../state/applications-store';
import { AppShell } from '../../layout/app-shell/app-shell';
import { InteractionForm } from '../../recruiters/components/interaction-form/interaction-form';
import { InteractionTimeline } from '../../recruiters/components/interaction-timeline/interaction-timeline';
import { interactionsFor } from '../../recruiters/logic/interactions';
import { InteractionsStore } from '../../recruiters/state/interactions-store';
import { RecruitersStore } from '../../recruiters/state/recruiters-store';

/** כל מה שידוע על משרה אחת: הפרטים, היסטוריית הסטטוסים ויומן הקשר עם המגייס. */
@Component({
  imports: [
    AppShell,
    CompanyAvatar,
    DatePipe,
    InteractionForm,
    InteractionTimeline,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    RouterLink,
    StatusBadge,
    StatusHistory,
  ],
  selector: 'app-job-details-page',
  styleUrl: './job-details-page.scss',
  templateUrl: './job-details-page.html',
})
export class JobDetailsPage implements OnInit {
  /** מגיע מהכתובת /jobs/:id. */
  readonly id = input.required<string>();

  protected readonly store = inject(ApplicationsStore);
  protected readonly recruiters = inject(RecruitersStore);
  protected readonly interactions = inject(InteractionsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly subtitle = jobSubtitle;
  protected readonly link = jobLink;

  protected readonly job = computed(
    () => this.store.applications().find((application) => application.id === this.id()) ?? null,
  );

  protected readonly recruiter = computed(() => {
    const recruiterId = this.job()?.recruiterId;
    return recruiterId ? (this.recruiters.byId().get(recruiterId) ?? null) : null;
  });

  protected readonly title = computed(() => {
    const job = this.job();
    return job ? jobTitle(job, this.recruiter()?.name ?? null) : '';
  });

  /** הטופס ביומן צריך את המשרה כרשימה, כדי לקשר אליה כל רשומה חדשה. */
  protected readonly jobAsList = computed(() => {
    const job = this.job();
    return job ? [job] : [];
  });

  protected readonly log = computed(() =>
    interactionsFor(this.interactions.interactions(), { applicationId: this.id() }),
  );

  ngOnInit(): void {
    this.store.ensureLoaded();
    this.recruiters.ensureLoaded();
    this.interactions.ensureLoaded();
  }

  /** החזרה למקום שממנו הגיעו: משרה בארכיון חוזרת לרשימת הארכיון. */
  protected backLabel(job: JobApplication): string {
    return isArchived(job.status) ? 'חזרה לארכיון' : 'כל המשרות';
  }

  protected backQuery(job: JobApplication): Record<string, string> {
    return isArchived(job.status) ? { view: 'archive' } : {};
  }

  protected changeStatus(job: JobApplication, status: ApplicationStatus): void {
    if (status === job.status) {
      return;
    }
    this.store.changeStatus(job.id, status);
    if (isArchived(status) !== isArchived(job.status)) {
      const message = isArchived(status) ? 'המשרה עברה לארכיון' : 'המשרה חזרה לרשימה הפעילה';
      this.snackBar.open(message, 'סגור', { duration: 4000 });
    }
  }

  protected edit(application: JobApplication): void {
    this.dialog
      .open<ApplicationFormDialog, ApplicationFormDialogData, ApplicationFormDialogResult>(
        ApplicationFormDialog,
        { data: { application }, width: '640px', maxWidth: '95vw' },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.kind === 'updated') {
          this.snackBar.open('השינויים נשמרו', 'סגור', { duration: 4000 });
        } else if (result?.kind === 'deleted') {
          this.snackBar.open(`המשרה ב־${result.application.company} נמחקה`, 'סגור', {
            duration: 4000,
          });
          this.router.navigate(['/']);
        }
      });
  }
}
