'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function sendOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Set to false if you do not want the user to be automatically signed up.
        shouldCreateUser: true,
      },
    })

    if (error) {
      console.error('Error sending OTP:', error.message)
      return error.message
    } else {
      console.log('OTP sent successfully. Check your email inbox.')
      return null
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const otpError = await sendOtp(email)
    if (otpError) {
      setError(otpError)
    } else {
      setSent(true)
      setSuccess('Verification code sent. Check your email.')
    }
    setLoading(false)
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !code) return

    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: code }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Invalid or expired code')
    } else {
      router.push('/dashboard')
      router.refresh()
    }

    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-orange-600">
            🍱 KidsBite
          </Link>
          <p className="text-gray-500 mt-1">Plan healthy meals for your little ones</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Login or create a free account to start planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogle}
              variant="outline"
              className="w-full gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>

            {sent ? (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter code from email"
                    value={code}
                    onChange={e => setCode(e.target.value.trim())}
                    required
                  />
                </div>
                {success && <p className="text-sm text-green-700">{success}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                  onClick={() => {
                    setSent(false)
                    setCode('')
                    setError('')
                    setSuccess('')
                  }}
                >
                  Use a different email
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSendCode} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                {success && <p className="text-sm text-green-700">{success}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Login Code'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
