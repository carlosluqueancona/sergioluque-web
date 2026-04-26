'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/admin/obras')
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Error al iniciar sesión')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '360px',
        margin: '80px auto',
        padding: '32px',
        border: '1px solid var(--border)',
      }}
    >
      <h1
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
          marginBottom: '32px',
          textTransform: 'uppercase',
        }}
      >
        Admin — Sergio Luque
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}
          >
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '8px 12px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="password"
            style={{ display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}
          >
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '8px 12px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '16px', fontFamily: 'monospace' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: 'var(--text-primary)',
            color: 'var(--bg)',
            border: 'none',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            padding: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {loading ? 'ENTRANDO...' : 'ENTRAR'}
        </button>
      </form>
    </div>
  )
}
