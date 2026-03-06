export const districtKeys = {
  all: ['districts'] as const,
  list: (associationId?: string) => [...districtKeys.all, 'list', associationId] as const,
};
