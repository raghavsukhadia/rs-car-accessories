import { useAuth } from '../lib/auth'
import { supabase } from '../supabase'
import { useState, useEffect } from 'react'

export default function AuthDebug() {
  const { session, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [adminError, setAdminError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (session) {
        try {
          const { data, error } = await supabase.rpc('is_admin')
          if (error) {
            setAdminError(error.message)
          } else {
            setIsAdmin(data)
          }
        } catch (err) {
          setAdminError(err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }
    checkAdmin()
  }, [session])

  if (loading) return <div>Loading auth status...</div>

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Authentication Debug</h3>
      <p><strong>Session:</strong> {session ? '✅ Signed in' : '❌ Not signed in'}</p>
      {session && (
        <>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Admin Status:</strong> {
            isAdmin === null ? '⏳ Checking...' : 
            isAdmin ? '✅ Admin' : '❌ Not admin'
          }</p>
          {adminError && <p><strong>Admin Error:</strong> {adminError}</p>}
        </>
      )}
    </div>
  )
}
