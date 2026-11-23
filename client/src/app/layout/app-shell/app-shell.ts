import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { UserMenu } from '../../auth/user-menu/user-menu';

/**
 * המסגרת של האפליקציה: חלון לבן מעוגל עם סרגל עליון ואזור תוכן.
 * כל מסך מכניס לתוכה את התוכן שלו, ואת הפעולות שלו לסרגל העליון (עם התכונה shellActions).
 * הניווט בין המסכים, המשתמש המחובר וההתנתקות שייכים לאפליקציה כולה, ולכן הם חלק מהמסגרת.
 */
@Component({
  imports: [RouterLink, RouterLinkActive, UserMenu],
  selector: 'app-shell',
  styleUrl: './app-shell.scss',
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly router = inject(Router);

  /** "משרות" מסומן גם בדף של משרה אחת, וגם כשהרשימה פתוחה על הארכיון (?view=archive). */
  protected onJobs(): boolean {
    const path = this.router.url.split(/[?#]/)[0];
    return path === '/' || path.startsWith('/jobs/');
  }
}
