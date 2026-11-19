import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ApplicationMetrics } from '../../logic/application-metrics';

type MetricTone = 'violet' | 'blue' | 'teal' | 'coral';

interface MetricTile {
  label: string;
  value: string;
  icon: string;
  tone: MetricTone;
}

@Component({
  imports: [MatIconModule],
  selector: 'app-application-metrics',
  styleUrl: './application-metrics.scss',
  templateUrl: './application-metrics.html',
})
export class ApplicationMetricsPanel {
  readonly metrics = input.required<ApplicationMetrics>();

  protected readonly tiles = computed<MetricTile[]>(() => {
    const m = this.metrics();
    return [
      { label: 'סה״כ משרות', value: String(m.total), icon: 'work', tone: 'violet' },
      { label: 'פעילות', value: String(m.active), icon: 'pending', tone: 'blue' },
      { label: 'הגיעו לראיון', value: String(m.interviewed), icon: 'groups', tone: 'teal' },
      {
        label: 'אחוז תגובה',
        value: m.responseRate === null ? '-' : `${m.responseRate}%`,
        icon: 'forum',
        tone: 'coral',
      },
    ];
  });
}
