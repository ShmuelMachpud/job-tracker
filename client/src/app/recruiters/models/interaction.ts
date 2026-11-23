import { IsoDate, IsoDateTime } from '../../applications/models/job-application';
import { Recruiter } from './recruiter';

export const INTERACTION_CHANNELS = [
  'phone',
  'email',
  'whatsApp',
  'linkedIn',
  'meeting',
  'other',
] as const;

export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number];

export const INTERACTION_CHANNEL_LABELS: Record<InteractionChannel, string> = {
  phone: 'טלפון',
  email: 'מייל',
  whatsApp: 'וואטסאפ',
  linkedIn: 'LinkedIn',
  meeting: 'פגישה',
  other: 'אחר',
};

/** אייקון של Material לכל ערוץ. */
export const INTERACTION_CHANNEL_ICONS: Record<InteractionChannel, string> = {
  phone: 'call',
  email: 'mail',
  whatsApp: 'chat',
  linkedIn: 'work',
  meeting: 'groups',
  other: 'more_horiz',
};

export const INTERACTION_DIRECTIONS = ['outgoing', 'incoming'] as const;

export type InteractionDirection = (typeof INTERACTION_DIRECTIONS)[number];

export const INTERACTION_DIRECTION_LABELS: Record<InteractionDirection, string> = {
  outgoing: 'אני פניתי',
  incoming: 'פנו אליי',
};

/** מקביל ל־Interaction בשרת. */
export interface Interaction {
  id: string;
  recruiterId: string;
  applicationId: string | null;
  date: IsoDate;
  channel: InteractionChannel;
  direction: InteractionDirection;
  summary: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface NextActionUpdate {
  action: string | null;
  at: IsoDate | null;
}

/** מה שהאתר שולח ביצירה ובעדכון. מקביל ל־InteractionRequest בשרת. */
export interface InteractionRequest {
  recruiterId: string;
  applicationId: string | null;
  date: IsoDate;
  channel: InteractionChannel;
  direction: InteractionDirection;
  summary: string;
  /** null: לא לגעת בפעולה הבאה של המגייס. */
  nextAction: NextActionUpdate | null;
}

/** מקביל ל־InteractionResponse בשרת: הרשומה, והמגייס אחרי העדכון. */
export interface InteractionResponse {
  interaction: Interaction;
  recruiter: Recruiter;
}
