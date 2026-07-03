'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Loader2, LogIn, UserPlus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/hooks/use-language'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, dir } = useLanguage()
  const { toast } = useToast()
  const { login, register, logout, user } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (mode === 'register' && password.length < 6) {
      toast({ title: t.authPasswordMinLength, variant: 'destructive' })
      setLoading(false)
      return
    }

    const result = mode === 'login'
      ? await login(email, password)
      : await register(name, email, password)

    setLoading(false)

    if (result.success) {
      toast({
        title: mode === 'login' ? t.authLoginSuccess : t.authRegisterSuccess,
      })
      onClose()
    } else {
      let errorMsg = t.authError

      if (result.error === 'Invalid email or password') {
        errorMsg = t.authInvalidCredentials
      } else if (result.error === 'Email already registered') {
        errorMsg = t.authEmailExists
      } else if (result.error === 'Password must be at least 6 characters') {
        errorMsg = t.authPasswordMinLength
      } else if (result.error && result.error.includes('Too many attempts')) {
        errorMsg = result.error
      }

      toast({ title: errorMsg, variant: 'destructive' })
    }
  }

  const handleLogout = async () => {
    await logout()
    toast({ title: t.authLogoutSuccess })
    onClose()
  }

  const isRtl = dir === 'rtl'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md frosted-glass rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-background/50 backdrop-blur-sm hover:bg-muted transition-colors"
              style={isRtl ? { left: '1rem' } : { right: '1rem' }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with gradient */}
            <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-blue-500/10 to-transparent">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-500 mb-3 shadow-lg shadow-primary/30">
                {user ? (
                  <User className="w-8 h-8 text-white" />
                ) : mode === 'login' ? (
                  <LogIn className="w-8 h-8 text-white" />
                ) : (
                  <UserPlus className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {user ? `${t.authWelcome} ${user.name || user.email}` : mode === 'login' ? t.authLogin : t.authRegister}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {user ? (
                /* Logged in state */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.authLogout}
                  </Button>
                </div>
              ) : (
                /* Login/Register form */
                <>
                  {/* Tab switcher */}
                  <div className="flex gap-2 p-1 mb-5 rounded-xl bg-muted/30">
                    <button
                      onClick={() => setMode('login')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.authLogin}
                    </button>
                    <button
                      onClick={() => setMode('register')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === 'register' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.authRegister}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="auth-name" className="text-sm font-medium">{t.authName}</Label>
                        <div className="relative">
                          <User className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" style={isRtl ? { right: '0.75rem' } : { left: '0.75rem' }} />
                          <Input
                            id="auth-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.authNamePlaceholder}
                            className={isRtl ? 'pr-10' : 'pl-10'}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="auth-email" className="text-sm font-medium">{t.authEmail}</Label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" style={isRtl ? { right: '0.75rem' } : { left: '0.75rem' }} />
                        <Input
                          id="auth-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.authEmailPlaceholder}
                          className={isRtl ? 'pr-10' : 'pl-10'}
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="auth-password" className="text-sm font-medium">{t.authPassword}</Label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" style={isRtl ? { right: '0.75rem' } : { left: '0.75rem' }} />
                        <Input
                          id="auth-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t.authPasswordPlaceholder}
                          className={isRtl ? 'pr-10' : 'pl-10'}
                          dir="ltr"
                          required
                      />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-l from-blue-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white font-bold shadow-lg shadow-primary/20"
                    >
                      {loading ? (
                        <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{mode === 'login' ? t.authLoggingIn : t.authRegistering}</span>
                        </motion.div>
                      ) : (
                        <span>{mode === 'login' ? t.authLoginButton : t.authRegisterButton}</span>
                      )}
                    </Button>
                  </form>

                  {/* Switch mode */}
                  <p className="text-center text-sm text-muted-foreground">
                    {mode === 'login' ? t.authNoAccount : t.authHaveAccount}{' '}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                      className="font-semibold text-primary hover:underline"
                    >
                      {mode === 'login' ? t.authSignUpHere : t.authSignInHere}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
