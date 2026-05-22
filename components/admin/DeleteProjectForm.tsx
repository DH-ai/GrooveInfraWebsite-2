'use client'

import type { FormEvent } from 'react'

interface DeleteProjectFormProps {
  action: string
  projectTitle?: string
  buttonLabel?: string
  buttonClassName?: string
}

export default function DeleteProjectForm({
  action,
  projectTitle,
  buttonLabel = 'Delete',
  buttonClassName,
}: DeleteProjectFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const label = projectTitle
      ? `Delete "${projectTitle}"? This cannot be undone.`
      : 'Delete this project? This cannot be undone.'

    if (!window.confirm(label)) {
      event.preventDefault()
    }
  }

  return (
    <form action={action} method="post" onSubmit={handleSubmit}>
      <input type="hidden" name="_action" value="delete" />
      <button type="submit" className={buttonClassName}>
        {buttonLabel}
      </button>
    </form>
  )
}
