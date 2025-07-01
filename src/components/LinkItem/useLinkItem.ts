'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, UpdateLinkData } from '@/types/link'

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL')
})

type LinkFormData = z.infer<typeof linkSchema>

interface UseLinkItemProps {
  link: Link
  onUpdate: (data: UpdateLinkData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface UseLinkItemResult {
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  form: ReturnType<typeof useForm<LinkFormData>>
  loading: boolean
  handleUpdate: (data: LinkFormData) => Promise<void>
  handleDelete: () => Promise<void>
}

export function useLinkItem({ link, onUpdate, onDelete }: UseLinkItemProps): UseLinkItemResult {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link.title,
      url: link.url
    }
  })

  const handleUpdate = async (data: LinkFormData) => {
    setLoading(true)
    try {
      await onUpdate({
        id: link.id,
        title: data.title,
        url: data.url
      })
      setIsEditing(false)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(link.id)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return {
    isEditing,
    setIsEditing,
    form,
    loading,
    handleUpdate,
    handleDelete
  }
} 