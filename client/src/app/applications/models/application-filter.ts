import { ApplicationStatus } from './application-status';

export interface ApplicationFilter {
  query: string;
  status: ApplicationStatus | null;
}

export const EMPTY_FILTER: ApplicationFilter = {
  query: '',
  status: null,
};
