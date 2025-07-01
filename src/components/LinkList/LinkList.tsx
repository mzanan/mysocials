'use client'

import { useLinkList, SOCIAL_NETWORKS } from './useLinkList'
import { LinkItem } from '@/components/LinkItem/LinkItem'
import { Link, CreateLinkData, UpdateLinkData } from '@/types/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import { SocialIcon } from 'react-social-icons'
import { Plus, X, Link as LinkIcon } from 'lucide-react'

interface LinkListProps {
  links: Link[]
  loading: boolean
  onCreateLink: (data: CreateLinkData) => Promise<void>
  onUpdateLink: (data: UpdateLinkData) => Promise<void>
  onDeleteLink: (id: string) => Promise<void>
}

export function LinkList({ 
  links, 
  loading, 
  onCreateLink, 
  onUpdateLink, 
  onDeleteLink 
}: LinkListProps) {
  const { 
    showForm, 
    setShowForm, 
    form, 
    loading: createLoading, 
    selectedSocial,
    handleCreate,
    handleSocialSelect
  } = useLinkList({ onCreateLink })

  const socialOptions = SOCIAL_NETWORKS.map(social => ({
    value: social.name.toLowerCase(),
    label: social.name
  }))

  const handleSocialChange = (value: string) => {
    if (value) {
      const social = SOCIAL_NETWORKS.find(s => s.name.toLowerCase() === value)
      if (social) {
        handleSocialSelect(social)
      }
    } else {
      form.setValue('title', '')
      form.setValue('url', '')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-purple-600" />
          My Links
        </h2>
      </div>

      {showForm && (
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                New Link
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <div>
                  <FormLabel>Social Network (Optional)</FormLabel>
                  <div className="flex gap-3 items-center mt-2">
                    <Combobox
                      options={socialOptions}
                      value={selectedSocial?.name.toLowerCase()}
                      onSelect={handleSocialChange}
                      placeholder="Choose a social network..."
                      searchPlaceholder="Search social networks..."
                      emptyText="No social network found."
                      className="flex-1"
                    />
                    {selectedSocial && (
                      <div className="flex items-center gap-2">
                        <SocialIcon 
                          url={selectedSocial.baseUrl} 
                          style={{ height: 32, width: 32 }}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            form.setValue('title', '')
                            form.setValue('url', '')
                            handleSocialChange('')
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={selectedSocial ? selectedSocial.name : "Link title"} 
                          {...field} 
                        />
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
                            placeholder={selectedSocial ? selectedSocial.placeholder : "https://example.com"} 
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
                  <Button type="submit" disabled={createLoading} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {createLoading ? 'Creating...' : 'Create Link'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {links.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 hover:border-purple-300 transition-colors">
            <CardContent className="p-8 text-center">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">You don&apos;t have any links yet.</p>
              <p className="text-sm text-gray-400 mb-4">Create your first link to get started!</p>
              <Button 
                variant="outline" 
                className="border-purple-300 text-purple-600 hover:bg-purple-50" 
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first link
              </Button>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              onUpdate={onUpdateLink}
              onDelete={onDeleteLink}
            />
          ))
        )}
      </div>

      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  )
}