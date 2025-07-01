'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit3, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useUpdateUsername } from './useUpdateUsername'

export function UpdateUsername() {
  const {
    newUsername,
    setNewUsername,
    isLoading,
    error,
    success,
    canUpdate,
    daysUntilUpdate,
    handleUpdateUsername,
    resetMessages
  } = useUpdateUsername()

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-blue-600" />
          Update Username
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canUpdate && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg">
            <Clock className="w-4 h-4" />
            <p className="text-sm">
              You can update your username in {daysUntilUpdate} days
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter new username"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              resetMessages()
            }}
            disabled={!canUpdate || isLoading}
            maxLength={20}
            className={`${newUsername && newUsername.length >= 3 ? 'border-green-300' : ''}`}
          />
          <p className="text-xs text-muted-foreground">
            3-20 characters, lowercase letters, numbers and underscores only
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <p className="text-sm">Username updated successfully!</p>
          </div>
        )}

        <Button 
          onClick={handleUpdateUsername}
          disabled={!canUpdate || isLoading || !newUsername || newUsername.length < 3}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {isLoading ? 'Updating...' : 'Update Username'}
        </Button>
      </CardContent>
    </Card>
  )
} 