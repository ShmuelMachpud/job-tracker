import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import {
  ApplicationFormDialog,
  ApplicationFormDialogData,
  ApplicationFormDialogResult,
} from '../../applications/components/application-form-dialog/application-form-dialog';
import {
  ApplicationsTable,
  StatusChangeEvent,
} from '../../applications/components/applications-table/applications-table';
import { CompanyAvatar } from '../../applications/components/company-avatar/company-avatar';
import { JobApplication } from '../../applications/models/job-application';
import { ApplicationsStore } from '../../applications/state/applications-store';
import { AppShell } from '../../layout/app-shell/app-shell';
import {
  RecruiterFormDialog,
  RecruiterFormDialogData,
  RecruiterFormDialogResult,
} from '../components/recruiter-form-dialog/recruiter-form-dialog';
import { InteractionForm } from '../components/interaction-form/interaction-form';
import { InteractionTimeline } from '../components/interaction-timeline/interaction-timeline';
import { interactionsFor } from '../logic/interactions';
import { RECRUITER_KIND_LABELS, Recruiter } from '../models/recruiter';
import { InteractionsStore } from '../state/interactions-store';
import { RecruitersStore } from '../state/recruiters-store';

@Component({
  imports: [
    AppShell,
    ApplicationsTable,
    CompanyAvatar,
    DatePipe,
    InteractionForm,
    InteractionTimeline,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    RouterLink,
  ],
  selector: 'app-recruiter-details-page',
  styleUrl: './recruiter-details-page.scss',
  templateUrl: './recruiter-details-page.html',
})
export class RecruiterDetailsPage implements OnInit {
  /** מגיע מהכתובת /recruiters/:id. */
  readonly id = input.required<string>();

  protected readonly store = inject(RecruitersStore);
  protected readonly applications = inject(ApplicationsStore);
  protected readonly interactions = inject(InteractionsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly kindLabels = RECRUITER_KIND_LABELS;

  protected readonly recruiter = computed(() => this.store.byId().get(this.id()) ?? null);

  protected readonly jobs = computed(() =>
    this.applications.applications().filter((job) => job.recruiterId === this.id()),
  );

  protected readonly log = computed(() =>
    interactionsFor(this.interactions.interactions(), { recruiterId: this.id() }),
  );

  ngOnInit(): void {
    this.store.ensureLoaded();
    this.applications.ensureLoaded();
    this.interactions.ensureLoaded();
  }

  protected edit(recruiter: Recruiter): void {
    this.dialog
      .open<RecruiterFormDialog, RecruiterFormDialogData, RecruiterFormDialogResult>(
        RecruiterFormDialog,
        { data: { recruiter }, width: '640px', maxWidth: '95vw' },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.kind === 'updated') {
          this.snackBar.open('השינויים נשמרו', 'סגור', { duration: 4000 });
        } else if (result?.kind === 'deleted') {
          this.snackBar.open(`${result.recruiter.name} נמחק`, 'סגור', { duration: 4000 });
          this.router.navigate(['/recruiters']);
        }
      });
  }

  protected openJob(application: JobApplication): void {
    this.dialog.open<ApplicationFormDialog, ApplicationFormDialogData, ApplicationFormDialogResult>(
      ApplicationFormDialog,
      { data: { application }, width: '640px', maxWidth: '95vw' },
    );
  }

  protected onStatusChange({ id, status }: StatusChangeEvent): void {
    this.applications.changeStatus(id, status);
  }

  /** הקישור ל־tel: בלי רווחים ומקפים, שחלק מהטלפונים לא מבינים. */
  protected telHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
  }
}
