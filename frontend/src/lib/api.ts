export const getApiBase = (): string => {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (envBase) {
    return envBase.replace(/\/$/, '')
  }

  // Single-service default: same-origin API
  return '/api'
}
