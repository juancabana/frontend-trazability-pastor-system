export const associationKeys = {
  all: ['associations'] as const,
  list: () => [...associationKeys.all, 'list'] as const,
};
