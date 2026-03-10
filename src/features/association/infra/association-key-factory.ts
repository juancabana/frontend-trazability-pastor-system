export const associationKeys = {
  all: ['associations'] as const,
  list: () => [...associationKeys.all, 'list'] as const,
  byUnion: (unionId?: string) => [...associationKeys.all, 'union', unionId] as const,
};
