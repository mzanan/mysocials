'use client'

import { useState, useEffect } from 'react'
import { Link, CreateLinkData, UpdateLinkData } from '@/types/link'

interface UseLinksResult {
  links: Link[]
  loading: boolean
  error: string | null
  createLink: (data: CreateLinkData) => Promise<void>
  updateLink: (data: UpdateLinkData) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  fetchLinks: () => Promise<void>
}

export function useLinks(): UseLinksResult {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/links')
      
      if (!response.ok) {
        throw new Error('Error loading links')
      }
      
      const data = await response.json()
      setLinks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createLink = async (data: CreateLinkData) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Error creating link')
      }

      await fetchLinks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateLink = async (data: UpdateLinkData) => {
    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Error updating link')
      }

      await fetchLinks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const deleteLink = async (id: string) => {
    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error deleting link')
      }

      await fetchLinks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  return {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    fetchLinks
  }
} 