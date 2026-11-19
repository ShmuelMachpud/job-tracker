import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';

import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ApplicationStatus,
} from '../../models/application-status';
import { JobApplication } from '../../models/job-application';
import { CompanyAvatar } from '../company-avatar/company-avatar';
import { StatusBadge } from '../status-badge/status-badge';

export interface StatusChangeEvent {
  id: string;
  status: ApplicationStatus;
}

@Component({
  imports: [CompanyAvatar, DatePipe, MatIconModule, MatMenuModule, MatTableModule, StatusBadge],
  selector: 'app-applications-table',
  styleUrl: './applications-table.scss',
  templateUrl: './applications-table.html',
})
export class ApplicationsTable {
  readonly applications = input.required<JobApplication[]>();
  readonly statusChange = output<StatusChangeEvent>();

  protected readonly columns = ['job', 'status', 'nextAction'];
  protected readonly statuses = APPLICATION_STATUSES;

  protected statusTriggerLabel(application: JobApplication): string {
    return `סטטוס: ${APPLICATION_STATUS_LABELS[application.status]}. לחץ לשינוי`;
  }

  protected selectStatus(application: JobApplication, status: ApplicationStatus): void {
    if (status !== application.status) {
      this.statusChange.emit({ id: application.id, status });
    }
  }
}
