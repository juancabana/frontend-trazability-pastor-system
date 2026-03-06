export const env = {
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000/api',
} as const;
