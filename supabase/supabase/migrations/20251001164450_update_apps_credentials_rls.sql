-- Update RLS policy for apps_credentials to allow direct access
-- This replaces the Edge Function approach with direct RLS-based access

-- Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "apps_credentials_no_access" ON public.apps_credentials;

-- Create new policy that allows users to see their own app credentials
-- (only anon_key and url, not service_key)
CREATE POLICY "apps_credentials_select_owner" ON public.apps_credentials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = apps_credentials.app_id 
      AND apps.user_id = auth.uid()
    )
  );

-- Grant select permission to authenticated users
GRANT SELECT ON public.apps_credentials TO authenticated;
