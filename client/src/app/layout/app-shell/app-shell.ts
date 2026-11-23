import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
export class AppShell {}
