import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { ApplicationsStore } from '../../applications/state/applications-store';
import { AppShell } from '../../layout/app-shell/app-shell';
import {
  RecruiterFormDialog,
  RecruiterFormDialogData,
  RecruiterFormDialogResult,
} from '../components/recruiter-form-dialog/recruiter-form-dialog';
import { RecruitersTable } from '../components/recruiters-table/recruiters-table';
import {
  countJobsByRecruiter,
  EMPTY_RECRUITER_FILTER,
  filterRecruiters,
  isRecruiterFilterActive,
} from '../logic/recruiter-summary';
import {
  RECRUITER_KIND_LABELS,
  RECRUITER_KINDS,
  Recruiter,
  RecruiterKind,
} from '../models/recruiter';
import { RecruitersStore } from '../state/recruiters-store';

@Component({
  imports: [
    AppShell,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    RecruitersTable,
  ],
  selector: 'app-recruiters-page',
  styleUrl: './recruiters-page.scss',
  templateUrl: './recruiters-page.html',
})
export class RecruitersPage implements OnInit {
  protected readonly store = inject(RecruitersStore);
  private readonly applications = inject(ApplicationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly kinds = RECRUITER_KINDS;
  protected readonly kindLabels = RECRUITER_KIND_LABELS;

  protected readonly filter = signal(EMPTY_RECRUITER_FILTER);
  protected readonly filterActive = computed(() => isRecruiterFilterActive(this.filter()));
  protected readonly visibleRecruiters = computed(() =>
    filterRecruiters(this.store.recruiters(), this.filter()),
  );

  /** המספרים מחושבים מהמשרות שבזיכרון, ולכן מתעדכנים מיד כשמקשרים משרה. */
  protected readonly jobCounts = computed(() =>
    countJobsByRecruiter(this.applications.applications()),
  );

  protected readonly summary = computed(() => {
    const count = this.store.recruiters().length;
    if (count === 0) {
      return 'כאן שומרים את המגייסים שאתה בקשר איתם, ורואים דרך מי עובר כל תהליך.';
    }
    return count === 1 ? 'מגייס אחד ברשימה' : `${count} מגייסים ברשימה`;
  });

  ngOnInit(): void {
    this.store.ensureLoaded();
    this.applications.ensureLoaded();
  }

  protected onQueryInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.filter.update((current) => ({ ...current, query }));
  }

  protected onKindChange(kind: RecruiterKind | null): void {
    this.filter.update((current) => ({ ...current, kind }));
  }

  protected clearFilter(): void {
    this.filter.set(EMPTY_RECRUITER_FILTER);
  }

  protected openDetails(recruiter: Recruiter): void {
    this.router.navigate(['/recruiters', recruiter.id]);
  }

  protected add(): void {
    this.dialog
      .open<RecruiterFormDialog, RecruiterFormDialogData, RecruiterFormDialogResult>(
        RecruiterFormDialog,
        { data: { recruiter: null }, width: '640px', maxWidth: '95vw' },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.kind === 'created') {
          this.openDetails(result.recruiter);
        }
      });
  }
}
