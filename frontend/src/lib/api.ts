export const getApiBase = (): string => {
  // Use local backend during local development; otherwise use deployed backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api'
    }
  }
  return 'https://nba-analytics-backend.onrender.com/api'
}
