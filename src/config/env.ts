export const env = {
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000/api',
} as const;
