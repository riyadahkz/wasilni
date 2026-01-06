# Quick Start - Create Your .env File

After creating your Supabase project, create a file named `.env` in the project root directory (`d:\mydriver\wasilni\.env`) with this content:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the values with**:
- Your actual Supabase project URL from Settings → API
- Your actual anon key from Settings → API

**Important Notes**:
- This file is gitignored (not tracked by Git) for security
- Never commit this file to version control
- Never share these keys publicly
- Each team member needs their own .env file locally

After creating this file, restart your dev server (`npm run dev`) for changes to take effect.
