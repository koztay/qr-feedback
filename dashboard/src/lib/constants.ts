export const statusColors = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  REJECTED: 'error',
} as const;

export const categoryColors = {
  INFRASTRUCTURE: 'primary',
  SAFETY: 'error',
  CLEANLINESS: 'success',
  OTHER: 'default',
} as const; 