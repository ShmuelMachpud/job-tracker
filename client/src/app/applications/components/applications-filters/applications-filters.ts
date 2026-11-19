import { Component, computed, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { isFilterActive } from '../../logic/filter-applications';
import { ApplicationFilter, EMPTY_FILTER } from '../../models/application-filter';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ApplicationStatus,
} from '../../models/application-status';

@Component({
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  selector: 'app-applications-filters',
  styleUrl: './applications-filters.scss',
  templateUrl: './applications-filters.html',
})
export class ApplicationsFilters {
  readonly filter = model.required<ApplicationFilter>();

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly statusLabels = APPLICATION_STATUS_LABELS;
  protected readonly isActive = computed(() => isFilterActive(this.filter()));

  protected onQueryInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.filter.update((current) => ({ ...current, query }));
  }

  protected onStatusChange(status: ApplicationStatus | null): void {
    this.filter.update((current) => ({ ...current, status }));
  }

  protected clear(): void {
    this.filter.set(EMPTY_FILTER);
  }
}
