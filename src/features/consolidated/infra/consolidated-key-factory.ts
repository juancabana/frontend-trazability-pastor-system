export const consolidatedKeys = {
  all: ['consolidated'] as const,
  byPastor: (pastorId: string, month: number, year: number) =>
    [...consolidatedKeys.all, 'pastor', pastorId, month, year] as const,
  byAssociation: (assocId: string, month: number, year: number) =>
    [...consolidatedKeys.all, 'association', assocId, month, year] as const,
};
