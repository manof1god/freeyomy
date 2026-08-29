import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import TopBar from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { ImagePlus, X } from 'lucide-react'

export default function Create() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadMedia = async (file: File) => {
    if (!user) return
    setUploading(true)
    try {
      const isVideo = file.type.startsWith('video/')
      const folder = isVideo ? 'videos' : 'images'
      const ext = file.name.split('.').pop()
      const path = `${folder}/${user.id}-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('posts')
        .upload(path, file, { upsert: true })

      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(path)

      setMediaUrl(publicUrl)
      setMediaType(isVideo ? 'video' : 'image')
      toast.success('Media uploaded')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handlePost = async () => {
    if (!user) return
    if (!mediaUrl) {
      toast.error('Please add a photo or video first')
      return
    }
    setPosting(true)
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        media_url: mediaUrl,
        media_type: mediaType,
        caption: caption.trim(),
      })
      if (error) throw error
      toast.success('Post shared!')
      navigate('/')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="pb-20">
      <TopBar
        title="New Post"
        showBack
        right={
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-semibold"
            disabled={!mediaUrl || posting}
            onClick={handlePost}
          >
            {posting ? <Spinner className="size-4" /> : 'Share'}
          </Button>
        }
      />
      <div className="max-w-lg mx-auto px-4 py-4">
        {!mediaUrl ? (
          <div
            className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Spinner className="size-8" />
            ) : (
              <>
                <ImagePlus className="size-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Tap to upload a photo or video</p>
                  <p className="text-xs text-muted-foreground mt-1">Up to 1080p quality</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            {mediaType === 'video' ? (
              <video src={mediaUrl} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
            )}
            <button
              className="absolute top-2 right-2 bg-black/60 rounded-full size-8 flex items-center justify-center"
              onClick={() => setMediaUrl('')}
            >
              <X className="size-4 text-white" />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) uploadMedia(f)
          }}
        />

        <div className="mt-4">
          <Textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            maxLength={2200}
            className="resize-none min-h-24"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{caption.length}/2200</p>
        </div>

        <Button
          className="w-full mt-6"
          size="lg"
          disabled={!mediaUrl || posting}
          onClick={handlePost}
        >
          {posting ? <Spinner className="size-4 mr-2" /> : null}
          Share Post
        </Button>
      </div>
    </div>
  )
}
