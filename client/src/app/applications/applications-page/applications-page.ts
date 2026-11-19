import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
  ApplicationsTable,
  StatusChangeEvent,
} from '../components/applications-table/applications-table';
import { ApplicationsStore } from '../state/applications-store';

@Component({
  imports: [ApplicationsTable, MatButtonModule, MatProgressBarModule],
  selector: 'app-applications-page',
  styleUrl: './applications-page.scss',
  templateUrl: './applications-page.html',
})
export class ApplicationsPage implements OnInit {
  protected readonly store = inject(ApplicationsStore);

  ngOnInit(): void {
    this.store.load();
  }

  protected onStatusChange({ id, status }: StatusChangeEvent): void {
    this.store.changeStatus(id, status);
  }
}
