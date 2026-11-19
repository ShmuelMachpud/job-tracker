import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

import { ApplicationsApi } from './applications/data/applications-api';

@Component({
  imports: [MatButtonModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly api = inject(ApplicationsApi);

  protected readonly applications = toSignal(this.api.getAll(), { initialValue: [] });
}
