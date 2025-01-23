'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { toast } from '@/components/ui/use-toast'

interface Settings {
  allowNewPrompts: boolean
  requireApproval: boolean
  maxPromptsPerUser: number
  maxFreePrompts: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    allowNewPrompts: true,
    requireApproval: true,
    maxPromptsPerUser: 10,
    maxFreePrompts: 5
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'marketplace'))
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as Settings)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'marketplace'), {
        ...settings,
        updatedAt: new Date().toISOString()
      })
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Button onClick={saveSettings} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow New Prompts</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to submit new prompts
              </p>
            </div>
            <Switch
              checked={settings.allowNewPrompts}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, allowNewPrompts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                Require admin approval for new prompts
              </p>
            </div>
            <Switch
              checked={settings.requireApproval}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, requireApproval: checked }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxPromptsPerUser">Max Prompts Per User</Label>
            <Input
              id="maxPromptsPerUser"
              type="number"
              min="0"
              value={settings.maxPromptsPerUser}
              onChange={(e) => setSettings(prev => ({ ...prev, maxPromptsPerUser: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxFreePrompts">Max Free Prompts</Label>
            <Input
              id="maxFreePrompts"
              type="number"
              min="0"
              value={settings.maxFreePrompts}
              onChange={(e) => setSettings(prev => ({ ...prev, maxFreePrompts: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 