import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

export type Profile = {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  is_private: boolean
  is_verified: boolean
  show_followers_to: 'everyone' | 'followers' | 'nobody'
  show_seen_receipts: boolean
  who_can_message: 'everyone' | 'followers' | 'nobody'
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  caption: string
  created_at: string
  profiles?: Profile
  likes?: Like[]
  comments?: Comment[]
  _likes_count?: number
  _comments_count?: number
  _liked_by_me?: boolean
}

export type Story = {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  caption: string
  expires_at: string
  created_at: string
  profiles?: Profile
  _viewed_by_me?: boolean
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  is_pinned: boolean
  created_at: string
  profiles?: Profile
  comment_likes?: { user_id: string }[]
  _likes_count?: number
  _liked_by_me?: boolean
}

export type Like = {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  status: 'accepted' | 'pending'
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  media_url: string
  media_type: '' | 'image' | 'video' | 'audio'
  is_seen: boolean
  is_encrypted: boolean
  view_once: boolean
  view_once_opened: boolean
  deleted_at: string | null
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export type Note = {
  id: string
  user_id: string
  content: string
  expires_at: string
  created_at: string
  profiles?: Profile
}

export type Notification = {
  id: string
  user_id: string
  actor_id: string
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'story_reply'
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
  actor?: Profile
  post?: Post
}
