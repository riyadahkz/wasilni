# 🔧 SIMPLE FIX FOR REGISTRATION ERROR

## The Problem
The RLS (Row Level Security) policies are too strict and blocking user registration.

## The Solution
Use a simpler, more permissive policy for development.

---

## Quick Fix Steps:

### 1️⃣ Run the Simple Fix
1. Open **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Open the file: `supabase/simple_rls_fix.sql`
3. Copy **ALL** the content
4. Paste into Supabase SQL Editor
5. Click **RUN** ✅

### 2️⃣ Restart Your App
```bash
# In terminal, press Ctrl+C then run:
npm run dev
```

### 3️⃣ Test Registration
1. Go to http://localhost:3000
2. Click **ابدأ الآن** (Start Now) to register
3. Fill in the form and submit
4. ✅ Registration should work now!

---

## What This Does
- ✅ Allows anyone to INSERT into users table (needed for signup)
- ✅ Users can only VIEW/UPDATE their own data (security maintained)
- ✅ Removes the problematic restrictive policies

---

## Still Not Working?

If you still get the error, try the **nuclear option**:

1. Open Supabase SQL Editor
2. Run this single command:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```
3. Restart dev server

⚠️ **Note**: This disables all security on the users table. Only use for development!

---

Let me know once you've tried this!
