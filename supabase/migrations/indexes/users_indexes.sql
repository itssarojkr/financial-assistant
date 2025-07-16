-- Indexes for user-related tables

-- Core user table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_type ON public.user_data(data_type);
CREATE INDEX IF NOT EXISTS idx_user_data_favorite ON public.user_data(is_favorite);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_user_data_user_type ON public.user_data(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_user_data_user_favorite ON public.user_data(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON public.user_data(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_recent ON public.user_sessions(user_id, updated_at DESC);

-- Functional indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_user_data_name_ci ON public.user_data(user_id, LOWER(data_name));
CREATE INDEX IF NOT EXISTS idx_user_data_content_gin ON public.user_data USING GIN (data_content);
CREATE INDEX IF NOT EXISTS idx_user_sessions_data_gin ON public.user_sessions USING GIN (session_data);
CREATE INDEX IF NOT EXISTS idx_user_preferences_notifications_gin ON public.user_preferences USING GIN (notifications);

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_user_data_favorites_only ON public.user_data(user_id, data_type, updated_at) WHERE is_favorite = true; 