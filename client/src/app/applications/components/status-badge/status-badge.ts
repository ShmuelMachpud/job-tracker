import { Component, computed, input } from '@angular/core';

import { APPLICATION_STATUS_LABELS, ApplicationStatus } from '../../models/application-status';

/** תגית צבעונית של סטטוס. הצבע נקבע לפי data-status ב־scss. */
@Component({
  host: { '[attr.data-status]': 'status()' },
  selector: 'app-status-badge',
  styleUrl: './status-badge.scss',
  template: '{{ label() }}',
})
export class StatusBadge {
  readonly status = input.required<ApplicationStatus>();

  protected readonly label = computed(() => APPLICATION_STATUS_LABELS[this.status()]);
}
