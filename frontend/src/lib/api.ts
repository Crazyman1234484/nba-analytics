export const getApiBase = (): string => {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (envBase) {
    return envBase.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api'
    }
  }

  // Vercel + Render default when env is not configured.
  return 'https://nba-analytics-backend.onrender.com/api'
}
