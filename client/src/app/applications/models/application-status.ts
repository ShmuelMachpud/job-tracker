export const APPLICATION_STATUSES = [
  'notApplied',
  'applied',
  'screening',
  'interview',
  'homeTask',
  'offer',
  'rejected',
  'noResponse',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  notApplied: 'טרם הוגשה',
  applied: 'הוגש',
  screening: 'סינון ראשוני',
  interview: 'ראיון',
  homeTask: 'מטלת בית',
  offer: 'הצעה',
  rejected: 'נדחה',
  noResponse: 'אין מענה',
};
