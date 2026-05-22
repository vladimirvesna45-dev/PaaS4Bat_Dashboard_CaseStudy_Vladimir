import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/useAppStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuthenticated = useAppStore((s) => s.setAuthenticated)
  const [username, setUsername] = useState('user')
  const [password, setPassword] = useState('user')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setError(null)
    setAuthenticated(true)
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-brand-900"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </p>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mock authentication: any non-empty username and password can be used.
            </p>

            <Button className="w-full" type="submit">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
