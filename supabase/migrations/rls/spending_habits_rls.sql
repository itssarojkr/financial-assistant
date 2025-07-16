-- RLS policies for spending habits table

-- Enable RLS
ALTER TABLE public.spending_habits ENABLE ROW LEVEL SECURITY;

-- Users can view their own spending habits and default habits
CREATE POLICY "Users can view own spending habits" ON public.spending_habits
    FOR SELECT USING (
        (SELECT auth.uid())::text = user_id OR 
        user_id = 'default'
    );

-- Users can insert their own spending habits
CREATE POLICY "Users can insert own spending habits" ON public.spending_habits
    FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Users can update their own spending habits
CREATE POLICY "Users can update own spending habits" ON public.spending_habits
    FOR UPDATE USING ((SELECT auth.uid())::text = user_id);

-- Users can delete their own spending habits
CREATE POLICY "Users can delete own spending habits" ON public.spending_habits
    FOR DELETE USING ((SELECT auth.uid())::text = user_id); 