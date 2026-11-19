import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  ApplicationStatus,
} from '../../models/application-status';
import { JobApplication } from '../../models/job-application';

export interface StatusChangeEvent {
  id: string;
  status: ApplicationStatus;
}

@Component({
  imports: [DatePipe, MatFormFieldModule, MatSelectModule, MatTableModule],
  selector: 'app-applications-table',
  styleUrl: './applications-table.scss',
  templateUrl: './applications-table.html',
})
export class ApplicationsTable {
  readonly applications = input.required<JobApplication[]>();
  readonly statusChange = output<StatusChangeEvent>();

  protected readonly columns = ['company', 'role', 'appliedAt', 'status', 'nextAction'];
  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly statusLabels = APPLICATION_STATUS_LABELS;
}
