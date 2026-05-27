'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteProjectFormProps {
  action: string
  projectTitle?: string
  buttonLabel?: string
  buttonClassName?: string
  redirectTo?: string
}

export default function DeleteProjectForm({
  action,
  projectTitle,
  buttonLabel = 'Delete',
  buttonClassName,
  redirectTo,
}: DeleteProjectFormProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const label = projectTitle
      ? `Delete "${projectTitle}"? This cannot be undone.`
      : 'Delete this project? This cannot be undone.'
    if (!window.confirm(label)) return

    setBusy(true)
    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'delete' }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        deleted?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        window.alert(`Delete failed: ${data.error ?? res.status}`)
        return
      }
      const target = redirectTo ?? `/admin?deleted=1&slug=${data.deleted ?? ''}`
      router.push(target)
      router.refresh()
    } catch (err) {
      console.error('[DeleteProjectForm] failed:', err)
      window.alert('Delete failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={busy} className={buttonClassName}>
        {busy ? 'Deleting…' : buttonLabel}
      </button>
    </form>
  )
}
