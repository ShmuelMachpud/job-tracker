import { environment } from '../../environments/environment';

/**
 * דפי ההתחברות וההתנתקות נמצאים בשרת ולא ב־Angular, כי ההתחברות עוברת דרך Google.
 * returnUrl אומר לשרת לאן לחזור. בפיתוח זה האתר על פורט 4200.
 */
function withReturnUrl(path: string): string {
  return `${environment.serverUrl}${path}?returnUrl=${encodeURIComponent(window.location.origin)}`;
}

export const loginUrl = (): string => withReturnUrl('/auth/login');
export const logoutUrl = (): string => withReturnUrl('/auth/logout');
