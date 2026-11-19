import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApplicationFormDialog } from '../components/application-form-dialog/application-form-dialog';
import { ApplicationMetricsPanel } from '../components/application-metrics/application-metrics';
import { ApplicationsFilters } from '../components/applications-filters/applications-filters';
import {
  ApplicationsTable,
  StatusChangeEvent,
} from '../components/applications-table/applications-table';
import { FollowUpList } from '../components/follow-up-list/follow-up-list';
import { formatLongDate, greetingFor, summarize } from '../logic/dashboard-summary';
import { filterApplications, isFilterActive } from '../logic/filter-applications';
import { EMPTY_FILTER } from '../models/application-filter';
import { JobApplication } from '../models/job-application';
import { ApplicationsStore } from '../state/applications-store';
import { AppShell } from '../../layout/app-shell/app-shell';

@Component({
  imports: [
    AppShell,
    ApplicationMetricsPanel,
    ApplicationsFilters,
    ApplicationsTable,
    FollowUpList,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  selector: 'app-applications-page',
  styleUrl: './applications-page.scss',
  templateUrl: './applications-page.html',
})
export class ApplicationsPage implements OnInit {
  protected readonly store = inject(ApplicationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly filter = signal(EMPTY_FILTER);
  protected readonly filterActive = computed(() => isFilterActive(this.filter()));

  // נקבעים פעם אחת, כשהמסך נפתח.
  private readonly openedAt = new Date();
  protected readonly greeting = greetingFor(this.openedAt);
  protected readonly dateLabel = formatLongDate(this.openedAt);
  protected readonly summary = computed(() =>
    summarize(this.store.metrics(), this.store.followUps().length),
  );
  protected readonly visibleApplications = computed(() =>
    filterApplications(this.store.applications(), this.filter()),
  );

  ngOnInit(): void {
    this.store.load();
  }

  protected onStatusChange({ id, status }: StatusChangeEvent): void {
    this.store.changeStatus(id, status);
  }

  protected clearFilter(): void {
    this.filter.set(EMPTY_FILTER);
  }

  protected openAddDialog(): void {
    this.dialog
      .open<ApplicationFormDialog, void, JobApplication>(ApplicationFormDialog, {
        width: '640px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((created) => {
        if (created) {
          this.snackBar.open(`המשרה ב־${created.company} נוספה`, 'סגור', { duration: 4000 });
        }
      });
  }
}
