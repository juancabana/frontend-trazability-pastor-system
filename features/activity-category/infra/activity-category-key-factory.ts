export const activityCategoryKeys = {
  all: ['activity-categories'] as const,
  list: () => [...activityCategoryKeys.all, 'list'] as const,
};
