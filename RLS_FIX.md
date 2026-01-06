# Quick Fix for RLS Infinite Recursion Error

## Problem
The database schema has RLS policies that create infinite recursion when checking admin privileges.

## Solution
Apply the fix script to remove problematic policies and add corrected ones.

---

## Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to your Supabase dashboard
- Click **SQL Editor** in the left sidebar
- Click **New Query**

### 2. Copy and Paste the Fix Script
- Open the file: `d:\mydriver\wasilni\supabase\fix_rls_policies.sql`
- Copy ALL the content (Ctrl+A, then Ctrl+C)
- Paste into the Supabase SQL Editor

### 3. Run the Script
- Click **Run** button (or press Ctrl+Enter)
- Wait for completion (should take 2-3 seconds)
- You should see "Success. No rows returned"

### 4. Restart Your App
- In your terminal, press Ctrl+C to stop the dev server
- Run `npm run dev` again
- Refresh your browser at http://localhost:3000

---

## What This Fix Does:

✅ **Removes** policies that cause infinite recursion  
✅ **Adds** simplified policies for development:
- Users can view/update their own profiles
- Users can register as customers, drivers, or companies
- Users can create and manage their own requests
- Users can view their own payments

⚠️ **Note**: Admin operations should be done through the Supabase dashboard for now. Full admin functionality with proper security will work once we implement JWT-based authentication.

---

## Verify It Works:

After applying the fix and restarting:
1. Open http://localhost:3000
2. Demo mode banner should be gone
3. Try registering a new user
4. Check browser console - no RLS errors

---

**Let me know once you've applied the fix and I'll help verify everything is working!**
