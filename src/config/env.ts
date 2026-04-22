if (!import.meta.env.VITE_BACKEND_URL && import.meta.env.PROD) {
  throw new Error(
    'VITE_BACKEND_URL environment variable is required in production',
  );
}

export const env = {
  backendUrl:
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api',
} as const;
