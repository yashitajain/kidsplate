'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Copy, Check, Share2, Camera } from 'lucide-react'
import type { Menu } from '@/lib/supabase'

type Props = {
  menu: Menu
  onTogglePublic: (isPublic: boolean) => Promise<void>
}

export default function ShareButton({ menu, onTogglePublic }: Props) {
  const [isPublic, setIsPublic] = useState(menu.is_public)
  const [slug, setSlug] = useState(menu.share_slug)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const shareUrl = slug ? `${window.location.origin}/shared/${slug}` : ''

  async function handleToggle(checked: boolean) {
    setToggling(true)
    try {
      await onTogglePublic(checked)
      setIsPublic(checked)
      // After toggling, if now public, we need the slug from the server response
      if (checked && !slug) {
        // Re-fetch menu to get generated slug
        const res = await fetch(`/api/menus/${menu.id}`)
        const data = await res.json()
        setSlug(data.menu?.share_slug ?? null)
      }
    } finally {
      setToggling(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Check out this kids meal plan: ${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  async function shareScreenshot() {
    setCapturing(true)
    try {
      const target = document.querySelector('main')
      if (!target) throw new Error('Could not find menu view to capture')

      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(target as HTMLElement, {
        backgroundColor: '#faf7f4',
        scale: 2,
        useCORS: true,
      })

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Failed to create screenshot')

      const filename = `${menu.title.replace(/\s+/g, '-').toLowerCase() || 'menu'}.png`
      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: menu.title,
          text: 'Weekly meal plan screenshot',
        })
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to share screenshot'
      alert(message)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch
          id="public-toggle"
          checked={isPublic}
          onCheckedChange={handleToggle}
          disabled={toggling}
        />
        <Label htmlFor="public-toggle" className="cursor-pointer">
          {isPublic ? '🌐 Public — anyone with the link can view' : '🔒 Private — only you can view'}
        </Label>
      </div>

      {isPublic && shareUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 text-sm border rounded px-3 py-1.5 bg-gray-50 text-gray-700"
            />
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <Button
            onClick={shareWhatsApp}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full"
          >
            <Share2 className="w-4 h-4" />
            Share on WhatsApp
          </Button>
        </div>
      )}
      <Button
        onClick={shareScreenshot}
        variant="outline"
        className="gap-2 w-full"
        disabled={capturing}
      >
        <Camera className="w-4 h-4" />
        {capturing ? 'Capturing...' : 'Share Screenshot'}
      </Button>
    </div>
  )
}
