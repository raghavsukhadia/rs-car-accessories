import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate(from, { replace: true })
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Admin Sign In</h1>
      <input className="w-full border rounded p-2" type="email" placeholder="Email"
             value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full border rounded p-2 mt-3" type="password" placeholder="Password"
             value={password} onChange={e=>setPassword(e.target.value)} required />
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <button className="w-full bg-blue-600 text-white rounded p-2 mt-4" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}