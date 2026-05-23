'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      username, password, redirect: false
    })
    if (result?.ok) {
      router.push('/')
    } else {
      setError('اسم المستخدم أو كلمة المرور غلط')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-400">WORLD TELECOM</h1>
          <p className="text-muted-foreground text-sm mt-1">TelecomIntelligence</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-foreground"
              placeholder="mehrez"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-foreground"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-medium"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}