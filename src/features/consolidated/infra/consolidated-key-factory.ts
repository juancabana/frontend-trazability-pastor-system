export const consolidatedKeys = {
  all: ['consolidated'] as const,
  byPastor: (pastorId: string, periodOffset: number) =>
    [...consolidatedKeys.all, 'pastor', pastorId, periodOffset] as const,
  byAssociation: (assocId: string, periodOffset: number) =>
    [...consolidatedKeys.all, 'association', assocId, periodOffset] as const,
  byUnion: (unionId: string, periodOffset: number) =>
    [...consolidatedKeys.all, 'union', unionId, periodOffset] as const,
  byPastors: (pastorIds: string[], periodOffset: number) =>
    [
      ...consolidatedKeys.all,
      'custom',
      [...pastorIds].sort().join(','),
      periodOffset,
    ] as const,
};
