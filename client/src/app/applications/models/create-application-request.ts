import { ApplicationDetailsRequest } from './application-details-request';
import { ApplicationStatus } from './application-status';

/** מה שהאתר שולח ביצירת משרה. מקביל ל־CreateApplicationRequest בשרת. */
export interface CreateApplicationRequest {
  details: ApplicationDetailsRequest;
  status: ApplicationStatus;
}
