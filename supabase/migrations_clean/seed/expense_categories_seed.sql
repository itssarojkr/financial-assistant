-- Seed default expense categories
INSERT INTO public.expense_categories (name, icon, color, is_default) VALUES
    ('Rent', 'home', '#4F46E5', TRUE),
    ('Food', 'utensils', '#16A34A', TRUE),
    ('Transport', 'car', '#F59E42', TRUE),
    ('Utilities', 'zap', '#FACC15', TRUE),
    ('Healthcare', 'heart', '#EF4444', TRUE),
    ('Insurance', 'shield', '#6366F1', TRUE),
    ('Phone', 'phone', '#0EA5E9', TRUE),
    ('Internet', 'wifi', '#A21CAF', TRUE),
    ('Shopping', 'shopping-bag', '#F472B6', TRUE),
    ('Entertainment', 'film', '#FBBF24', TRUE),
    ('Other', 'dots-horizontal', '#6B7280', TRUE)
ON CONFLICT DO NOTHING; 