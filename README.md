<<<<<<< HEAD
# DMS Mehedi - AI-Powered Portfolio Platform

A futuristic, real-time, AI-integrated portfolio web application built with **Next.js 14**, **TypeScript**, **TailwindCSS**, **Firebase**, and **Gemini API**. Designed to feel like it belongs in the web of 2040.

## 🚀 Features

### 🎨 Main Portfolio Website
- **Hero Section**: NASA-inspired 3D particle canvas with magnetic field lines and liquid gradients
- **About Section**: AI-styled futuristic layout with personal brand story
- **Digital Services**: Showcase of Digital Marketing, Web Development, and Shopify Dropshipping
- **Projects Grid**: Interactive 3D flip card effects with hover animations
- **Skills Cloud**: Animated skill badges organized by category
- **Timeline**: Scroll-driven animations (Lottie-ready)
- **Testimonials**: Slider with voice toggle capability
- **Blog Grid**: Firebase-backed blog content management
- **Contact Form**: Direct messaging with WhatsApp integration
- **Dark/Light Mode Toggle**: Seamless theme switching
- **SEO Optimized**: JSON-LD structured data for Person and Website

### 🤖 DMS AI Powered Tool Page (`/dms-ai-powered`)
- **OCR & Image Captioning**: Extract text and generate captions from images
- **Code Generator**: Generate code in HTML, JS, TS, Python, Node.js
- **Code Fixer**: Analyze errors, provide explanations, and generate patch diffs
- **Countries List**: Comprehensive country data with emoji flags, SVG flags, and ISO codes
- **Translator**: Translate text and JSON objects
- **Real-time Streaming**: Animated responses from Gemini API
- **Export Options**: Download results as JSON or CSV
- **Liquid Background**: Three.js or Canvas2D animated background
- **Tool Switching Sidebar**: Smooth transitions between tools

### 💬 Real-Time Chatbot Widget
- **Floating Button**: Bottom-right corner with online status indicator
- **Green Glow Animation**: Shows when admin is online
- **Real-time Sync**: Firebase Realtime Database integration
- **Typing Indicators**: "Admin is typing..." and "User is typing..." animations
- **Message Status**: Sent/Seen status tracking per message
- **Last Seen**: Display when user was last active
- **Notification Sound**: Audio feedback (muted when tab is focused)
- **Responsive Design**: Mobile-optimized chat interface

### 🛠️ Admin Panel (`/admin`)
- **Firebase Auth Protection**: Email/password login
- **Chat Management**: View all chat threads with latest messages on top
- **Live Message Viewer**: Real-time message synchronization
- **Reply Box**: Send responses to users
- **Typing Indicators**: Show when admin is typing
- **Seen/Sent Tracking**: Message status management
- **Last Seen Status**: Track user activity
- **Notification Tone**: Audio alerts for new messages
- **Blog/Testimonial CRUD**: Manage content directly from the admin panel

### 🌍 Internationalization (i18n)
- **English**: Full English support
- **Bangla (বাংলা)**: Complete Bangla translation
- **Malay (Bahasa Melayu)**: Full Malay translation
- **Easy Language Switching**: Seamless locale switching

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **Animations**: Framer Motion + Lottie
- **3D Graphics**: Three.js + React Three Fiber
- **Backend/Database**: Firebase (Realtime DB, Auth, Storage, Hosting)
- **AI Integration**: Gemini 1.5 Pro API
- **Internationalization**: i18next + react-i18next
- **Code Quality**: ESLint

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Firebase project with Realtime Database enabled
- Gemini API key from Google AI Studio
- Firebase CLI (`npm install -g firebase-tools`)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dms-mehedi-portfolio
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and Gemini API credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Update Firebase Configuration

Edit `.firebaserc` with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 5. Set Up Firebase Realtime Database Rules

In Firebase Console:
1. Go to Realtime Database → Rules
2. Copy the rules from `database.rules.json`
3. Publish the rules

### 6. Create Admin User

In Firebase Console:
1. Go to Authentication → Users
2. Create a new user with email and password
3. Use these credentials to log in to the admin panel

### 7. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your portfolio.

## 📦 Project Structure

```
dms-mehedi-portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── page.tsx                # Main portfolio page
│   │   ├── globals.css             # Global styles & design system
│   │   ├── dms-ai-powered/
│   │   │   └── page.tsx            # AI tools page
│   │   └── admin/
│   │       └── page.tsx            # Admin panel
│   ├── components/
│   │   ├── ThemeProvider.tsx       # Dark/Light mode context
│   │   ├── Hero.tsx                # Hero section with 3D canvas
│   │   ├── About.tsx               # About section
│   │   ├── Services.tsx            # Services showcase
│   │   ├── Projects.tsx            # Projects grid with 3D flip
│   │   ├── Skills.tsx              # Skills cloud
│   │   ├── Contact.tsx             # Contact form
│   │   ├── AIToolsPage.tsx         # AI tools interface
│   │   └── ChatbotWidget.tsx       # Real-time chat widget
│   ├── lib/
│   │   └── firebase.ts             # Firebase configuration
│   ├── locales/
│   │   ├── en.json                 # English translations
│   │   ├── bn.json                 # Bangla translations
│   │   └── ms.json                 # Malay translations
│   └── public/
│       └── assets/                 # Images, icons, etc.
├── firebase.json                   # Firebase hosting config
├── database.rules.json             # Realtime DB security rules
├── .firebaserc                      # Firebase project config
├── .env.example                    # Environment variables template
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # TailwindCSS configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🚀 Deployment to Firebase Hosting

### 1. Build the Project

```bash
pnpm build
```

### 2. Deploy to Firebase

```bash
firebase deploy
```

This will deploy:
- Next.js static files to Firebase Hosting
- Realtime Database rules
- All configurations from `firebase.json`

### 3. Access Your Site

Your portfolio will be available at: `https://your-firebase-project-id.web.app`

## 🔧 API Integration

### Gemini API Setup

The AI tools page requires a backend API endpoint to securely call the Gemini API. Create an API route:

```typescript
// src/app/api/ai-tools/route.ts
import { GoogleGenerativeAI } from '@google/generai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { tool, input } = await request.json();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Process based on tool type
    let prompt = '';
    switch (tool) {
      case 'ocr':
        prompt = `Extract all text from this image and provide a caption`;
        break;
      case 'codegen':
        prompt = `Generate code for: ${input}`;
        break;
      // ... other tools
    }

    const result = await model.generateContent(prompt);
    return Response.json({ result: result.response.text() });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
```

## 🎨 Design System

### Color Palette
- **Primary**: `#1254FF` (Vibrant Blue)
- **Accent**: `#00C4FF` (Cyan)
- **Neutral**: `#8D8D8D` (Gray)
- **Background**: `#000000` (Deep Black)

### Typography
- **Font**: Inter (Google Fonts)
- **Heading 1**: 4xl-6xl, Bold
- **Heading 2**: 3xl-4xl, Bold
- **Heading 3**: 2xl-3xl, Bold
- **Body**: Base-lg, Regular

### Animations
- **Framer Motion**: All section introductions and interactions
- **Custom CSS**: Glassmorphism, gradients, and micro-interactions
- **60fps Performance**: Optimized for smooth animations

## 📱 Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large touch targets and spacing
- **Accessible**: WCAG 2.1 AA compliant

## 🔐 Security

- **Firebase Auth**: Secure user authentication
- **Database Rules**: Row-level security for Realtime Database
- **Environment Variables**: Sensitive keys never exposed to client
- **HTTPS**: Automatic with Firebase Hosting
- **CSP Headers**: Content Security Policy configured

## 📊 Performance Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: Images and components loaded on demand
- **Image Optimization**: Next.js Image component
- **Caching**: Static assets cached with long-term cache headers
- **Minification**: Automatic with production build

## 🌐 SEO

- **Meta Tags**: Optimized for search engines
- **JSON-LD**: Structured data for Person and Website
- **Open Graph**: Social media preview optimization
- **Sitemap**: Auto-generated with Next.js
- **Robots.txt**: Search engine crawling configuration

## 📞 Support & Contact

For questions or support:
- Email: hello@dmsmehedi.com
- WhatsApp: [Your WhatsApp Link]
- Twitter: [@dmsmehedi](https://twitter.com/dmsmehedi)
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [Your GitHub Profile]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- [ ] Blog system with CMS integration
- [ ] Testimonials management in admin panel
- [ ] Email notifications for new messages
- [ ] Advanced analytics dashboard
- [ ] Video tutorials and case studies
- [ ] Client portfolio showcase
- [ ] Booking/consultation system
- [ ] Payment integration for services

## 🙏 Acknowledgments

Built with inspiration from the future of web design, powered by:
- Next.js team for the amazing framework
- Firebase for reliable backend services
- Google AI for Gemini API
- Framer Motion for smooth animations
- TailwindCSS for utility-first styling

---

**Built with ❤️ by DMS Mehedi - AI-Powered Developer & Digital Strategist**

*This site is designed to belong to the AI internet of 2040. It's immersive, responsive, real-time, multilingual, and intelligent — built to last forever on free Firebase hosting.*
=======
# dms-mehedi-portfolios
portfollio build in next.js14
>>>>>>> f1b343ebc1fe2868aeb5e1d90949b13ad9074156
