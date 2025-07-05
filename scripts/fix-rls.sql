-- Fix RLS policies for profiles table
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create updated RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow inserts for authenticated users and the trigger function
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.uid() IS NOT NULL
    );

-- Fix the trigger function to handle RLS properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Use SECURITY DEFINER to bypass RLS for this function
    INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the trigger is still attached
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 