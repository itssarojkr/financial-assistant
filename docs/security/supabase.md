# Supabase Security Guide

This document explains how to configure and maintain security for your Financial Assistant application using Supabase.

## 🔒 Security Warnings and Fixes

### Common Supabase Security Warnings

1. **Leaked Password Protection Disabled** - Entity: Auth
2. **Function Search Path Mutable** - Entity: public.handle_new_user
3. **Function Search Path Mutable** - Entity: public.update_updated_at_column
4. **RLS Performance Warnings** - Multiple tables with auth.uid() performance issues

## 🛡️ Security Issues and Solutions

### 1. Leaked Password Protection Disabled

#### **Issue**
- Supabase is not checking if users are using passwords that have been compromised in data breaches
- Users might use weak passwords that have been leaked online

#### **Risk**
- Users might use weak passwords that have been leaked online
- Increased vulnerability to credential stuffing attacks

#### **Fix**
Enable Have I Been Pwned (HIBP) integration via Supabase Dashboard:

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** > **Settings**
3. Scroll down to the **Security** section
4. Enable **"Check for compromised passwords"**
5. Save the settings

### 2. Function Search Path Mutable

#### **Issue**
- Database functions don't have explicit search paths set
- Potential for search path injection attacks

#### **Risk**
- Search path injection attacks
- Unauthorized access to other schemas
- Security vulnerabilities in database functions

#### **Fix**
Set explicit search paths for all functions. This is automatically handled in our migrations:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- function body
$$;
```

### 3. RLS Performance Warnings

#### **Issue**
- RLS policies use `auth.uid()` directly, causing performance issues at scale
- Poor query performance, especially with large datasets

#### **Risk**
- Poor query performance
- Scalability issues with large user bases
- Increased database load

#### **Fix**
Wrap `auth.uid()` in subqueries for better performance:

```sql
-- Before (causes performance warnings)
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING (auth.uid() = user_id);

-- After (optimized for performance)
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING ((SELECT auth.uid()) = user_id);
```

## 🔧 Implementation Guide

### Step 1: Apply Security Migrations

1. **Run the Security Migration**:
   ```bash
   # Apply the security optimization migration
   supabase db push
   ```

2. **Or run manually in SQL Editor**:
   ```sql
   -- Copy and paste the contents of:
   -- supabase/migrations/002_security_optimization.sql
   ```

### Step 2: Enable Leaked Password Protection

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** > **Settings**
3. Scroll down to the **Security** section
4. Enable **"Check for compromised passwords"**
5. Save the settings

### Step 3: Verify Security Configuration

Run these verification queries to ensure security is properly configured:

#### **Check Function Search Paths**
```sql
SELECT 
    proname as function_name,
    CASE 
        WHEN proconfig IS NULL OR array_length(proconfig, 1) IS NULL THEN 'No search_path set'
        ELSE 'Search path configured'
    END as search_path_status,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_context
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'update_updated_at_column')
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

#### **Check RLS Policies**
```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'user_sessions', 'user_data', 'expenses', 'budgets', 'user_preferences', 'spending_alerts')
ORDER BY tablename, policyname;
```

## 📊 Security Benefits

After applying these fixes, your application will have:

✅ **Better Password Security**: Users are warned about compromised passwords  
✅ **Protected Functions**: Database functions are secured against injection attacks  
✅ **Improved Performance**: RLS policies are optimized for scale  
✅ **Compliance**: Meets Supabase security best practices  

## 🚀 Performance Impact

The RLS performance fixes will:

- **Reduce CPU usage** by caching `auth.uid()` calls
- **Improve query response times** especially with large datasets
- **Eliminate performance warnings** in the Supabase dashboard
- **Maintain security** while being more efficient

## 🔍 Security Monitoring

### **Regular Security Checks**

1. **Monitor Security Warnings**:
   - Check Supabase Dashboard regularly for new warnings
   - Address any new security issues promptly

2. **Audit RLS Policies**:
   ```sql
   SELECT 
       tablename,
       policyname,
       cmd,
       qual
   FROM pg_policies 
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

3. **Check Function Security**:
   ```sql
   SELECT 
       proname,
       prosecdef,
       proconfig
   FROM pg_proc 
   WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
   ORDER BY proname;
   ```

### **Security Alerts**

Set up monitoring for:
- Failed authentication attempts
- Unusual access patterns
- Database connection issues
- Security warning notifications

## 🛠️ Additional Security Recommendations

### **1. Enable Multi-Factor Authentication (MFA)**
- Consider enabling MFA for enhanced security
- Configure MFA settings in Supabase Dashboard

### **2. Password Policy**
- Set minimum password requirements
- Configure password complexity rules
- Enable password expiration policies

### **3. Session Management**
- Configure session timeouts
- Set appropriate session durations
- Monitor active sessions

### **4. Rate Limiting**
- Implement rate limiting for auth endpoints
- Configure appropriate limits for your use case
- Monitor rate limit violations

### **5. Audit Logging**
- Enable audit logging for security events
- Monitor authentication and authorization events
- Review logs regularly for suspicious activity

## 🚨 Troubleshooting

### **If warnings persist:**

1. **Check if the SQL scripts ran successfully**
   - Verify migrations were applied correctly
   - Check for any error messages in the logs

2. **Verify functions have the correct search_path configuration**
   ```sql
   SELECT proname, proconfig FROM pg_proc 
   WHERE proname IN ('handle_new_user', 'update_updated_at_column');
   ```

3. **Ensure RLS policies use `(SELECT auth.uid())` instead of `auth.uid()`**
   ```sql
   SELECT qual FROM pg_policies WHERE qual LIKE '%auth.uid()%';
   ```

4. **Verify leaked password protection is enabled in the Dashboard**
   - Check Authentication > Settings > Security
   - Ensure "Check for compromised passwords" is enabled

5. **Wait a few minutes for changes to propagate**
   - Some changes may take time to take effect
   - Refresh the dashboard after making changes

### **If you get errors:**

1. **Make sure you have admin access to your Supabase project**
   - Verify your user role has sufficient permissions
   - Check if you can access the SQL Editor

2. **Check that the functions exist before trying to modify them**
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname IN ('handle_new_user', 'update_updated_at_column');
   ```

3. **Verify your Supabase version supports these features**
   - Check your Supabase project version
   - Ensure you're using a supported version

4. **Ensure tables exist before applying RLS policies**
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public';
   ```

## 📚 Best Practices

### **1. Regular Security Reviews**
- Conduct regular security audits
- Review and update security policies
- Monitor for new security threats

### **2. Principle of Least Privilege**
- Grant minimum necessary permissions
- Use specific roles for different operations
- Regularly review user permissions

### **3. Defense in Depth**
- Implement multiple layers of security
- Don't rely on a single security measure
- Use complementary security controls

### **4. Security by Design**
- Consider security from the beginning
- Integrate security into the development process
- Test security measures regularly

## 📞 Support

If you continue to see warnings after applying these fixes:

1. **Check the Supabase documentation** for the latest security guidelines
2. **Review the migration logs** for any error messages
3. **Contact Supabase support** if needed for persistent issues
4. **Check the troubleshooting section** above for common solutions

---

**For more information, see the [Security Overview](./overview.md) and [SQL Migration Guide](../database/migrations.md).** 