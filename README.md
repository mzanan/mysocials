# MySocials 🔗

A modern, feature-rich "link-in-bio" platform built with Next.js 15, allowing users to create personalized pages with all their important links in one place.

## ✨ Features

### Core Features
- 🔐 **Authentication System** - Secure registration and login with Supabase Auth
- 📱 **Responsive Dashboard** - Modern interface to manage your links
- 🔗 **Link Management** - Full CRUD operations for your links
- 👤 **Public Profiles** - Beautiful, shareable profile pages
- 📊 **Real-time Analytics** - Track profile views and link clicks
- ⚙️ **Username Management** - Update username with 30-day restriction
- 🛡️ **Route Protection** - Middleware-based authentication
- 🎨 **Modern UI** - Built with ShadCN UI and Tailwind CSS

### Analytics & Tracking
- Profile view tracking
- Link click tracking with automatic redirection
- Real-time statistics dashboard
- Historical data (30-day recent activity)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **UI Components**: ShadCN UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Hooks, Custom Hooks
- **Form Handling**: React Hook Form, Zod validation
- **Animations**: Framer Motion
- **Notifications**: Sonner
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── login/               # Authentication page
│   ├── dashboard/           # User dashboard
│   ├── [username]/          # Dynamic public profiles
│   └── api/                 # API routes
│       ├── links/           # Link CRUD operations
│       ├── profile/         # Profile management
│       └── analytics/       # Analytics endpoints
│
├── components/              # React components
│   ├── AuthForm/           # Authentication form with validation
│   ├── Header/             # Dashboard navigation header
│   ├── LinkList/           # Links management interface
│   ├── LinkItem/           # Individual link editing
│   ├── PublicProfile/      # Public profile display
│   ├── ShareProfile/       # Profile sharing tools
│   ├── UpdateUsername/     # Username management
│   └── ui/                 # ShadCN UI components
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication state
│   ├── useLinks.ts         # Link management
│   ├── useProfile.ts       # Profile management
│   ├── usePublicProfile.ts # Public profile data
│   └── useAnalytics.ts     # Analytics data
│
├── lib/                    # Utilities and configuration
│   ├── supabase/          # Supabase client setup
│   └── utils.ts           # Helper functions
│
└── types/                  # TypeScript type definitions
    ├── auth.ts            # Authentication types
    ├── link.ts            # Link data types
    └── profile.ts         # Profile data types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mysocials
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database setup**
Execute the following SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  username_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create links table
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Analytics tables
CREATE TABLE profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX profile_views_profile_id_idx ON profile_views(profile_id);
CREATE INDEX profile_views_created_at_idx ON profile_views(created_at);
CREATE INDEX link_clicks_profile_id_idx ON link_clicks(profile_id);
CREATE INDEX link_clicks_created_at_idx ON link_clicks(created_at);
CREATE INDEX link_clicks_link_id_idx ON link_clicks(link_id);
```

5. **Row Level Security (RLS) Policies**
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Links policies
CREATE POLICY "Public links are viewable by everyone" ON links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own links" ON links
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Anyone can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own profile analytics" ON profile_views
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can insert link clicks" ON link_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own link analytics" ON link_clicks
  FOR SELECT USING (auth.uid() = profile_id);
```

6. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Usage

### For Users
1. **Sign Up**: Create an account at `/login`
2. **Dashboard**: Manage your links and view analytics at `/dashboard`
3. **Add Links**: Use the floating action button to add new links
4. **Share Profile**: Copy your profile URL to share with others
5. **Update Username**: Change your username (once every 30 days)
6. **View Analytics**: Track profile views and link clicks

### Public Profiles
- Access any user's profile at `/{username}`
- Mobile-optimized link display
- Automatic click tracking
- Profile view tracking

## 🔧 API Routes

### Authentication
- Protected routes automatically redirect to `/login`
- Session management via Supabase Auth

### Links Management
- `GET /api/links` - Fetch user's links
- `POST /api/links` - Create new link
- `PUT /api/links` - Update existing link
- `DELETE /api/links?id={linkId}` - Delete link

### Profile Management
- `GET /api/profile/{username}` - Get public profile data
- `POST /api/profile/create` - Create user profile
- `PUT /api/profile/update-username` - Update username (30-day restriction)

### Analytics
- `GET /api/analytics/stats` - Get user analytics
- `POST /api/analytics/profile-view` - Track profile view
- `GET /api/analytics/link-click/{linkId}` - Track click and redirect

## 🎨 Component Architecture

The project follows a clean component structure:

- **Component.tsx**: Pure rendering logic, no business logic
- **useComponent.ts**: Custom hooks containing all business logic and state
- **Types**: Defined locally in hooks or globally in `/types` if reused

Example:
```typescript
// LinkItem.tsx - Only rendering
export function LinkItem({ link, onUpdate, onDelete }) {
  const { /* logic */ } = useLinkItem({ link, onUpdate, onDelete })
  return (/* JSX */)
}

// useLinkItem.ts - All business logic
export function useLinkItem({ link, onUpdate, onDelete }) {
  // State management, event handlers, validation, etc.
  return { /* exposed interface */ }
}
```

## 🔒 Security Features

- Row Level Security (RLS) enabled
- Authentication middleware
- Form validation with Zod
- URL sanitization
- Protected API routes
- Username validation and restrictions

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Review the documentation and setup instructions

---

Built with ❤️ using Next.js 15, TypeScript, and Supabase.
