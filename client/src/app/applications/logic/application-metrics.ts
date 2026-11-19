import { JobApplication } from '../models/job-application';
import { gotResponse, isClosed, reachedInterview } from './status-groups';

export interface ApplicationMetrics {
  total: number;
  active: number;
  interviewed: number;
  /** אחוז שלם, או null כשאין עדיין משרות. */
  responseRate: number | null;
}

export function computeMetrics(applications: readonly JobApplication[]): ApplicationMetrics {
  const total = applications.length;
  const responded = applications.filter(gotResponse).length;

  return {
    total,
    active: applications.filter((application) => !isClosed(application.status)).length,
    interviewed: applications.filter(reachedInterview).length,
    responseRate: total === 0 ? null : Math.round((responded / total) * 100),
  };
}
