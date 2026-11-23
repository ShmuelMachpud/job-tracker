import { ApplicationFilter } from '../models/application-filter';
import { JobApplication } from '../models/job-application';

export function filterApplications(
  applications: readonly JobApplication[],
  filter: ApplicationFilter,
): JobApplication[] {
  const query = normalize(filter.query);

  return applications.filter(
    (application) =>
      matchesStatus(application, filter.status) &&
      (filter.recruiterId === null || application.recruiterId === filter.recruiterId) &&
      matchesQuery(application, query),
  );
}

export function isFilterActive(filter: ApplicationFilter): boolean {
  return normalize(filter.query) !== '' || filter.status !== null || filter.recruiterId !== null;
}

function matchesStatus(application: JobApplication, status: ApplicationFilter['status']): boolean {
  return status === null || application.status === status;
}

function matchesQuery(application: JobApplication, query: string): boolean {
  if (query === '') {
    return true;
  }

  const searchable = [
    application.company,
    application.role,
    application.source,
    application.contact,
    application.notes,
  ];

  return searchable.some((value) => value !== null && normalize(value).includes(query));
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}
