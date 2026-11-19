import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ApplicationsFilters } from '../components/applications-filters/applications-filters';
import {
  ApplicationsTable,
  StatusChangeEvent,
} from '../components/applications-table/applications-table';
import { filterApplications } from '../logic/filter-applications';
import { EMPTY_FILTER } from '../models/application-filter';
import { ApplicationsStore } from '../state/applications-store';

@Component({
  imports: [ApplicationsFilters, ApplicationsTable, MatButtonModule, MatProgressBarModule],
  selector: 'app-applications-page',
  styleUrl: './applications-page.scss',
  templateUrl: './applications-page.html',
})
export class ApplicationsPage implements OnInit {
  protected readonly store = inject(ApplicationsStore);

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
}
