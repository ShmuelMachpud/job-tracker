import { Routes } from '@angular/router';

import { ApplicationsPage } from './applications/applications-page/applications-page';

export const routes: Routes = [
  { path: '', component: ApplicationsPage, title: 'משרות · JobTracker' },
  // מסכי המגייסים נטענים רק כשנכנסים אליהם, כדי שהמסך הראשי ייטען מהר
  {
    path: 'recruiters',
    title: 'מגייסים · JobTracker',
    loadComponent: () =>
      import('./recruiters/recruiters-page/recruiters-page').then((m) => m.RecruitersPage),
  },
  {
    path: 'recruiters/:id',
    title: 'מגייס · JobTracker',
    loadComponent: () =>
      import('./recruiters/recruiter-details-page/recruiter-details-page').then(
        (m) => m.RecruiterDetailsPage,
      ),
  },
  { path: '**', redirectTo: '' },
];
