// Assets and content for DMS Mehedi Portfolio

export const APP_LOGO = {
  src: '/logo-dms-mehedi.png', // Main DMS logo with arrow
  alt: 'DMS Mehedi Logo',
  href: '/',
  text: 'DMS MEHEDI'
};

export const PROFILE_IMAGES = {
  main: {
    src: '/profile-main.jpg', // Professional headshot
    alt: 'DMS Mehedi - Professional Headshot',
    caption: 'DMS Mehedi - AI-Powered Developer & Digital Strategist'
  },
  secondary: {
    src: '/profile-secondary.jpg', // Professional portrait with suit
    alt: 'DMS Mehedi - Professional Portrait',
    caption: 'Professional Portrait'
  }
};

export const HOME_SECTION_CONTENT = {
  title: 'DMS Mehedi',
  subtitle: 'AI-Powered Developer & Digital Strategist',
  description: 'Building the future with cutting-edge technology, AI integration, and innovative web solutions. Specializing in Next.js, Supabase, Firebase, and real-time applications.',
  cta: {
    primary: 'Explore My Work',
    secondary: 'Get In Touch'
  },
  highlights: [
    'Real-time Chat Applications',
    'AI-Powered Solutions',
    'Modern Web Development',
    'Digital Strategy & Consulting'
  ]
};

export const ABOUT_SECTION_CONTENT = {
  title: 'About Me',
  subtitle: 'Passionate Developer & Digital Innovator',
  description: `Hello! I'm Mehedi, a passionate developer specializing in building robust, real-time web applications and AI-powered solutions. With expertise in modern technologies like Supabase, React, Next.js, and Firebase, I focus on creating seamless user experiences and efficient backend solutions.

My journey in technology spans across full-stack development, digital strategy, and AI integration. I believe in the power of real-time communication and have built sophisticated chat systems that connect people instantly.

When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, and helping businesses transform their digital presence.`,
  
  skills: [
    'Next.js & React',
    'Supabase & Firebase',
    'TypeScript & JavaScript',
    'AI Integration',
    'Real-time Applications',
    'Digital Strategy',
    'UI/UX Design',
    'Database Design'
  ],
  
  experience: [
    {
      title: 'Full-Stack Developer',
      company: 'Freelance',
      period: '2020 - Present',
      description: 'Building modern web applications and real-time chat systems'
    },
    {
      title: 'Digital Strategist',
      company: 'Various Clients',
      period: '2019 - Present',
      description: 'Helping businesses transform their digital presence'
    }
  ],
  
  achievements: [
    'Built real-time chat applications with Supabase',
    'Developed AI-powered portfolio systems',
    'Created responsive, modern web interfaces',
    'Implemented secure authentication systems'
  ]
};

export const NAVIGATION_LINKS = [
  { name: 'Home', href: '/', icon: 'Home', scroll: true },
  { name: 'About', href: '/#about', icon: 'User', scroll: true },
  { name: 'Projects', href: '/#projects', icon: 'Code', scroll: true },
  { name: 'Services', href: '/#services', icon: 'Briefcase', scroll: true },
  { name: 'Contact', href: '/#contact', icon: 'Mail', scroll: true },
  { name: 'AI Tools', href: '/dms-ai-powered', icon: 'Zap', scroll: false }
];

export const SOCIAL_LINKS = {
  github: 'https://github.com/dmsmehedi',
  linkedin: 'https://linkedin.com/in/dmsmehedi',
  twitter: 'https://twitter.com/dmsmehedi',
  email: 'mailto:dmsmehedis@gmail.com'
};

export const CONTACT_INFO = {
  email: 'dmsmehedis@gmail.com',
  phone: '+880-XXX-XXXXXX',
  location: 'Dhaka, Bangladesh',
  availability: 'Available for freelance projects'
};

export const PROJECTS_DATA = [
  {
    id: 'realtime-chat',
    title: 'Real-time Chat System',
    description: 'Advanced chat application with Supabase integration, typing indicators, and message status tracking.',
    technologies: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS'],
    image: '/project-chat.jpg',
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    id: 'ai-portfolio',
    title: 'AI-Powered Portfolio',
    description: 'Intelligent portfolio system with AI integration and dynamic content management.',
    technologies: ['Next.js', 'OpenAI', 'Firebase', 'Framer Motion'],
    image: '/project-ai.jpg',
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    id: 'digital-strategy',
    title: 'Digital Strategy Platform',
    description: 'Comprehensive platform for digital marketing and business strategy consulting.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
    image: '/project-strategy.jpg',
    liveUrl: '#',
    githubUrl: '#'
  }
];

export const SERVICES_DATA = [
  {
    title: 'Web Development',
    description: 'Modern, responsive web applications built with cutting-edge technologies.',
    icon: 'Code',
    features: ['Next.js Applications', 'React Development', 'TypeScript Integration', 'Responsive Design']
  },
  {
    title: 'Real-time Systems',
    description: 'Advanced real-time communication systems with instant messaging and live updates.',
    icon: 'Zap',
    features: ['Live Chat Systems', 'Real-time Updates', 'WebSocket Integration', 'Message Status Tracking']
  },
  {
    title: 'AI Integration',
    description: 'Intelligent solutions powered by artificial intelligence and machine learning.',
    icon: 'Brain',
    features: ['AI Chatbots', 'Smart Recommendations', 'Automated Responses', 'Data Analysis']
  },
  {
    title: 'Digital Strategy',
    description: 'Comprehensive digital transformation and business strategy consulting.',
    icon: 'TrendingUp',
    features: ['Digital Marketing', 'Business Analysis', 'Technology Consulting', 'Growth Strategy']
  }
];

export const TESTIMONIALS_DATA = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    content: 'Mehedi delivered an exceptional real-time chat system that transformed our customer support. The attention to detail and technical expertise is outstanding.',
    avatar: '/testimonial-1.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager, InnovateLab',
    content: 'Working with Mehedi was a game-changer. His AI integration skills and modern development approach helped us scale our platform efficiently.',
    avatar: '/testimonial-2.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Founder, Digital Solutions',
    content: 'Mehedi\'s digital strategy insights and technical implementation exceeded our expectations. Highly recommended for any tech project.',
    avatar: '/testimonial-3.jpg'
  }
];

export const SEO_META = {
  title: 'DMS Mehedi - AI-Powered Developer & Digital Strategist',
  description: 'Portfolio of DMS Mehedi, specializing in real-time applications, AI integration, and modern web development with Next.js, Supabase, and Firebase.',
  keywords: [
    'AI Developer',
    'Digital Strategist', 
    'Next.js Developer',
    'Supabase Expert',
    'Firebase Developer',
    'Real-time Applications',
    'Web Development',
    'TypeScript Developer'
  ],
  author: 'DMS Mehedi',
  url: 'https://dms-mehedi.com',
  image: '/og-image.jpg'
};
