import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApplicationFormDialog } from '../components/application-form-dialog/application-form-dialog';
import { ApplicationsFilters } from '../components/applications-filters/applications-filters';
import {
  ApplicationsTable,
  StatusChangeEvent,
} from '../components/applications-table/applications-table';
import { filterApplications } from '../logic/filter-applications';
import { EMPTY_FILTER } from '../models/application-filter';
import { JobApplication } from '../models/job-application';
import { ApplicationsStore } from '../state/applications-store';

@Component({
  imports: [ApplicationsFilters, ApplicationsTable, MatButtonModule, MatProgressBarModule],
  selector: 'app-applications-page',
  styleUrl: './applications-page.scss',
  templateUrl: './applications-page.html',
})
export class ApplicationsPage implements OnInit {
  protected readonly store = inject(ApplicationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly filter = signal(EMPTY_FILTER);
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
