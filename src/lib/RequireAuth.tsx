import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!session) return <Navigate to="/signin" state={{ from: location }} replace />
  return children
}
