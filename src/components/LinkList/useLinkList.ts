'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreateLinkData } from '@/types/link'

const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL')
})

type CreateLinkFormData = z.infer<typeof createLinkSchema>

interface SocialNetwork {
  name: string
  baseUrl: string
  placeholder: string
}

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { name: 'Instagram', baseUrl: 'https://instagram.com/', placeholder: 'https://instagram.com/username' },
  { name: 'Twitter', baseUrl: 'https://twitter.com/', placeholder: 'https://twitter.com/username' },
  { name: 'Facebook', baseUrl: 'https://facebook.com/', placeholder: 'https://facebook.com/username' },
  { name: 'LinkedIn', baseUrl: 'https://linkedin.com/in/', placeholder: 'https://linkedin.com/in/username' },
  { name: 'YouTube', baseUrl: 'https://youtube.com/', placeholder: 'https://youtube.com/@username' },
  { name: 'TikTok', baseUrl: 'https://tiktok.com/@', placeholder: 'https://tiktok.com/@username' },
  { name: 'GitHub', baseUrl: 'https://github.com/', placeholder: 'https://github.com/username' },
  { name: 'Behance', baseUrl: 'https://behance.net/', placeholder: 'https://behance.net/username' },
  { name: 'Dribbble', baseUrl: 'https://dribbble.com/', placeholder: 'https://dribbble.com/username' },
  { name: 'Pinterest', baseUrl: 'https://pinterest.com/', placeholder: 'https://pinterest.com/username' },
  { name: 'Snapchat', baseUrl: 'https://snapchat.com/add/', placeholder: 'https://snapchat.com/add/username' },
  { name: 'Discord', baseUrl: 'https://discord.gg/', placeholder: 'https://discord.gg/server' },
  { name: 'WhatsApp', baseUrl: 'https://wa.me/', placeholder: 'https://wa.me/1234567890' },
  { name: 'Telegram', baseUrl: 'https://t.me/', placeholder: 'https://t.me/username' },
  { name: 'Spotify', baseUrl: 'https://open.spotify.com/artist/', placeholder: 'https://open.spotify.com/artist/id' },
  { name: 'Twitch', baseUrl: 'https://twitch.tv/', placeholder: 'https://twitch.tv/username' }
]

interface UseLinkListProps {
  onCreateLink: (data: CreateLinkData) => Promise<void>
}

interface UseLinkListResult {
  showForm: boolean
  setShowForm: (show: boolean) => void
  form: ReturnType<typeof useForm<CreateLinkFormData>>
  loading: boolean
  selectedSocial: SocialNetwork | null
  setSelectedSocial: (social: SocialNetwork | null) => void
  handleCreate: (data: CreateLinkFormData) => Promise<void>
  handleSocialSelect: (social: SocialNetwork) => void
}

export function useLinkList({ onCreateLink }: UseLinkListProps): UseLinkListResult {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSocial, setSelectedSocial] = useState<SocialNetwork | null>(null)

  const form = useForm<CreateLinkFormData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      title: '',
      url: ''
    }
  })

  const handleSocialSelect = (social: SocialNetwork) => {
    setSelectedSocial(social)
    form.setValue('title', social.name)
    form.setValue('url', social.baseUrl)
  }

  const handleCreate = async (data: CreateLinkFormData) => {
    setLoading(true)
    try {
      await onCreateLink(data)
      form.reset()
      setSelectedSocial(null)
      setShowForm(false)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return {
    showForm,
    setShowForm,
    form,
    loading,
    selectedSocial,
    setSelectedSocial,
    handleCreate,
    handleSocialSelect
  }
} 