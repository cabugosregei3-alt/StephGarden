# Stefan Files

A Google Drive-like cloud storage application built with Vue 3, Supabase, and Storj/S3-compatible storage.

## Features

- **Authentication** - Sign up, login, and manage user accounts via Supabase Auth
- **File Management** - Upload, download, preview, and delete files
- **Folder Organization** - Create folders, nested subfolders, and organize files
- **Rich Document Editor** - Built-in Word-like document editor (Tiptap)
- **Spreadsheet Editor** - Built-in Excel-like spreadsheet editor
- **Multi-Storage Profiles** - Connect multiple Storj/S3 buckets and switch between them
- **Drag & Drop** - Drag files into folders, move items between locations
- **Multi-Select** - Select multiple files/folders and move them together
- **File Previews** - Preview images and videos directly in the app
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL Database)
- **Storage**: Storj Labs / S3-compatible Object Storage
- **Rich Text**: Tiptap Editor
- **Routing**: Vue Router

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/cabugosregei3-alt/StephGarden.git
cd StephGarden
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

Go to your Supabase SQL Editor and run the following migrations in order:

**Migration 1: Users Table (if not exists)**
```sql
-- Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own folders" ON folders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own files" ON files FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- File type constraint
ALTER TABLE files ADD CONSTRAINT files_type_check CHECK (type IN ('document', 'spreadsheet', 'upload', 'image', 'video', 'audio', 'docx', 'xlsx', 'pdf', 'pptx', 'archive', 'text'));
```

**Migration 2: Storage Profiles**
```sql
-- Storage Profiles Table
CREATE TABLE IF NOT EXISTS storage_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'storj' CHECK (provider IN ('storj', 's3')),
  endpoint TEXT,
  region TEXT DEFAULT 'us-east-1',
  access_key_id TEXT,
  secret_access_key TEXT,
  bucket TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE storage_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own storage profiles" ON storage_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add columns to files and folders
ALTER TABLE files ADD COLUMN IF NOT EXISTS storage_profile_id UUID REFERENCES storage_profiles(id) ON DELETE SET NULL;
ALTER TABLE folders ADD COLUMN IF NOT EXISTS storage_profile_id UUID REFERENCES storage_profiles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_files_storage_profile_id ON files(storage_profile_id);
CREATE INDEX IF NOT EXISTS idx_folders_storage_profile_id ON folders(storage_profile_id);
```

### 5. Configure Storage

1. Go to **Settings** in the app
2. Click **Add Profile**
3. Enter your Storj/S3 bucket credentials:
   - **Profile Name**: e.g., "My Storj Bucket"
   - **Provider**: Storj or S3-compatible
   - **Endpoint**: For Storj use `https://gateway.storjshare.io`
   - **Region**: e.g., `us-east-1`
   - **Access Key ID**: Your bucket's access key
   - **Secret Access Key**: Your bucket's secret key
   - **Bucket Name**: Your bucket name
4. Click **Save**
5. Click **Set Active** on the profile to use it

### 6. Run the App

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## How Storage Profiles Work

- Each user can create multiple storage profiles (different buckets)
- Only one profile can be **Active** at a time
- Switching the active profile filters the dashboard to show only files from that profile
- Files and folders are linked to the storage profile they were created under

## Project Structure

```
src/
├── App.vue                 # Main app component
├── main.js               # Entry point
├── style.css             # Global styles
├── lib/
│   ├── supabase.js       # Supabase client
│   └── storage.js        # S3 storage operations
├── router/
│   └── index.js          # Vue Router config
├── views/
│   ├── HomeView.vue      # Landing page
│   ├── LoginView.vue     # Login page
│   ├── SignupView.vue    # Signup page
│   ├── DashboardView.vue # Main file manager
│   └── SettingsView.vue  # User & storage settings
└── components/
    ├── Navbar.vue        # Navigation header
    ├── Sidebar.vue      # Folder tree sidebar
    ├── FolderTree.vue   # Recursive folder component
    ├── DocumentEditor.vue # Rich text editor
    └── SpreadsheetEditor.vue # Spreadsheet editor
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |

## License

MIT License
