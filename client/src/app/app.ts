import { Component } from '@angular/core';

import { ApplicationsPage } from './applications/applications-page/applications-page';

@Component({
  imports: [ApplicationsPage],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
