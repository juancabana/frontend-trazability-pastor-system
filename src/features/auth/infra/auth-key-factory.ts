export const authKeys = {
  all: ['auth'] as const,
  users: () => [...authKeys.all, 'users'] as const,
};
