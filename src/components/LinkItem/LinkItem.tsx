'use client'

import { useLinkItem } from './useLinkItem'
import { Link, UpdateLinkData } from '@/types/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SocialIcon } from 'react-social-icons'

interface LinkItemProps {
  link: Link
  onUpdate: (data: UpdateLinkData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function LinkItem({ link, onUpdate, onDelete }: LinkItemProps) {
  const { 
    isEditing, 
    setIsEditing, 
    form, 
    loading, 
    handleUpdate, 
    handleDelete 
  } = useLinkItem({ link, onUpdate, onDelete })

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Link title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input 
                          placeholder="https://example.com" 
                          {...field} 
                          className="flex-1"
                        />
                        {field.value && (
                          <SocialIcon 
                            url={field.value} 
                            style={{ height: 32, width: 32 }}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <SocialIcon 
              url={link.url} 
              style={{ height: 40, width: 40 }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">{link.title}</h3>
              <p className="text-sm text-gray-500 truncate">{link.url}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 