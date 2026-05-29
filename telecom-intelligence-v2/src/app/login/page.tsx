'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wifi, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { username, password, redirect: false })
    if (result?.ok) {
      router.push('/')
    } else {
      setError('اسم المستخدم أو كلمة المرور غلط')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#060B18] flex items-center justify-center relative overflow-hidden" dir="rtl">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/5 rounded-full blur-3xl" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md px-4 z-10"
      >
        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4">
              <Wifi className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">WORLD TELECOM</h1>
            <p className="text-teal-400/70 text-sm mt-1 font-medium">TelecomIntelligence Platform</p>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold text-white">تسجيل الدخول</h2>
            <p className="text-white/40 text-sm mt-1">أدخل بياناتك للوصول إلى المنصة</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Username */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="text-sm font-medium text-white/60 block mb-2">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all duration-200 text-sm"
                  placeholder="mehrez"
                  autoComplete="username"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className="text-sm font-medium text-white/60 block mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-l from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>دخول</span>
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-6 border-t border-white/5 text-center"
          >
            <p className="text-white/20 text-xs">
              WORLD TELECOM © 2026 — منصة TelecomIntelligence
            </p>
            <p className="text-white/15 text-xs mt-1">
              102, Rue Yougoslavie, Tunis • Tél: 240125
            </p>
          </motion.div>
        </div>

        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-4"
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-white/20 bg-white/5 border border-white/5 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            نظام آمن ومحمي
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

