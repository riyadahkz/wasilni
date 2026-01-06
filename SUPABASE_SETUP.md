# Supabase Database Setup Guide

Follow these steps to create and configure your Supabase database for the transportation application.

---

## Step 1: Create a Supabase Project

1. **Go to Supabase**: Open https://supabase.com in your browser
2. **Sign Up/Login**: Create an account or log in if you already have one
3. **Create New Project**:
   - Click on "New Project" button
   - Choose your organization (create one if needed)
   - Fill in project details:
     - **Name**: `wasilni-transport` (or any name you prefer)
     - **Database Password**: Create a strong password and **SAVE IT** somewhere safe
     - **Region**: Choose the closest region to Iraq (e.g., `Frankfurt` or `Singapore`)
     - **Pricing Plan**: Select **Free** tier (it's sufficient for development)
4. **Wait for Setup**: The project will take 1-2 minutes to set up

---

## Step 2: Get Your Project Credentials

Once your project is ready:

1. In the Supabase dashboard, click on your project
2. Click the **⚙️ Settings** icon in the left sidebar
3. Go to **API** section
4. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

**Keep these values handy** - you'll need them in the next step!

---

## Step 3: Configure Your Application

1. **Create `.env` file**:
   - In your project root (`d:\mydriver\wasilni`), create a new file called `.env`
   - Add the following content (replace with your actual values):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Save the file**

---

## Step 4: Execute Database Schema

1. **Open SQL Editor**:
   - In Supabase dashboard, click **🗂️ SQL Editor** in the left sidebar
   - Click **➕ New Query**

2. **Copy the Schema**:
   - Open the file `d:\mydriver\wasilni\supabase\schema.sql`
   - Copy ALL the content (Ctrl+A, then Ctrl+C)

3. **Paste and Run**:
   - Paste the SQL into the Supabase SQL Editor
   - Click **▶️ Run** button (or press Ctrl+Enter)
   - Wait for the query to complete (should take 5-10 seconds)

4. **Verify Success**:
   - You should see "Success. No rows returned" message
   - If you see any errors, copy the error message and let me know

---

## Step 5: Verify Tables Were Created

1. **Open Table Editor**:
   - Click **📊 Table Editor** in the left sidebar

2. **Check Tables**:
   - You should see 9 tables listed:
     - ✅ users
     - ✅ drivers
     - ✅ companies
     - ✅ requests
     - ✅ trips
     - ✅ trip_bookings
     - ✅ payments
     - ✅ ratings
     - ✅ notifications

3. **Check RLS Policies**:
   - Click on any table (e.g., `users`)
   - Look for "RLS enabled" badge at the top
   - This confirms security is properly configured

---

## Step 6: Restart Your Application

1. **Stop the Dev Server**:
   - Go to your terminal where `npm run dev` is running
   - Press `Ctrl+C` to stop it

2. **Start Again**:
   - Run `npm run dev` again
   - The app will now load with your Supabase credentials

3. **Verify in Browser**:
   - Open http://localhost:3000
   - The demo mode warning banner should be **gone**
   - Open browser console (F12)
   - You should see "✅ Supabase connected" or no connection errors

---

## Next Steps

Once everything is set up:

- ✅ You can register new users
- ✅ Test login/logout functionality
- ✅ Create bookings and trips
- ✅ All data will be stored in your Supabase database

---

## Troubleshooting

**If you see connection errors:**
- Double-check your `.env` file has the correct URL and key
- Make sure there are no extra spaces or quotes
- Restart the dev server after creating `.env`

**If SQL execution fails:**
- Make sure you copied the ENTIRE schema.sql file
- Try running it in smaller chunks if needed
- Check for any error messages and share them with me

---

Let me know when you complete each step, and I can help if you encounter any issues!
