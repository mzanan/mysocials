# MySocials 🔗

A simple, static, and fast "link-in-bio" page built with Next.js 15. All data is hardcoded for maximum performance and simplicity.

This project serves as a template for anyone wanting a personal landing page without the need for a database or backend services.

## ✨ Features

- ✅ **Fully Static**: No database, no auth, just pure HTML/CSS/JS.
- ⚡️ **Blazing Fast**: Built with Next.js and optimized for performance.
- 🎨 **Modern UI**: Clean and beautiful UI built with ShadCN UI and Tailwind CSS.
- 📱 **Responsive Design**: Looks great on all devices.
- 🔗 **Social Icons**: Automatically displays icons for your social links.
- 🛠️ **Easy to Customize**: Edit a single file to update your profile, bio, and links.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: ShadCN UI
- **Icons**: Lucide Icons, React Social Icons

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── page.tsx             # The main page that shows the profile.
│   └── layout.tsx           # The root layout.
│
├── components/              # React components
│   └── PublicProfile/       # The main component to display the profile.
│       ├── PublicProfile.tsx
│       └── usePublicProfile.ts
│
├── hooks/                   # Custom React hooks
│   └── usePublicProfile.ts  # Hook where all profile data is hardcoded.
│
├── types/                   # TypeScript type definitions
│   ├── link.ts
│   └── profile.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

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

3. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## ✍️ How to Customize

All your personal information is stored in one place. To update your profile:

1.  Open the file `src/hooks/usePublicProfile.ts`.
2.  Find the `hardcodedData` constant.
3.  Edit the `profile` object with your name, username, bio, and avatar URL.
4.  Update the `links` array with your social media links (title and URL).

**Example:**
```typescript
const hardcodedData: PublicProfileData = {
  profile: {
    id: '1',
    username: 'your_username',
    full_name: 'Your Full Name',
    avatar_url: 'https://your-avatar-url.com/image.png',
    bio: 'Your amazing bio here.',
    // ... other fields
  },
  links: [
    { id: '1', title: 'GitHub', url: 'https://github.com/your_username', /* ... */ },
    { id: '2', title: 'Twitter', url: 'https://twitter.com/your_username', /* ... */ },
    // Add more links here
  ]
}
```

That's it! Your changes will be reflected instantly in development mode.
