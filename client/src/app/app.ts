import { Component } from '@angular/core';

import { ApplicationsPage } from './applications/applications-page/applications-page';

@Component({
  imports: [ApplicationsPage],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
