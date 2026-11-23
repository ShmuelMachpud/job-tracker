import { Interaction } from '../models/interaction';

/** החדשה ביותר למעלה. באותו יום, מה שנרשם אחרון למעלה. */
export function sortInteractions(interactions: readonly Interaction[]): Interaction[] {
  return [...interactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export function interactionsFor(
  interactions: readonly Interaction[],
  filter: { recruiterId?: string; applicationId?: string },
): Interaction[] {
  return interactions.filter(
    (item) =>
      (filter.recruiterId === undefined || item.recruiterId === filter.recruiterId) &&
      (filter.applicationId === undefined || item.applicationId === filter.applicationId),
  );
}
