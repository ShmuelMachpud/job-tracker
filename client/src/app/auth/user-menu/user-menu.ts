import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';

import { AuthApi } from '../auth-api';
import { logoutUrl } from '../auth-urls';

/** מי מחובר, וכפתור התנתקות. */
@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-user-menu',
  styleUrl: './user-menu.scss',
  templateUrl: './user-menu.html',
})
export class UserMenu {
  // אם הבקשה נכשלת, פשוט לא מציגים את המייל. מעבר לדף ההתחברות כבר מטופל ב־authInterceptor
  protected readonly user = toSignal(inject(AuthApi).me().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  protected readonly logoutUrl = logoutUrl();
}
