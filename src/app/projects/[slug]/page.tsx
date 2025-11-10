

'use client';
import { notFound } from 'next/navigation';
import ProjectDetailLayout from '../ProjectDetailLayout';

const projects = [
  {
    slug: 'move-x-health',
    title: 'Move X Health',
    logo: '/move-x.jpg',
    tagline: 'Empowering movement for a healthier life.',
    description: 'Move X Health is a health and fitness platform focused on movement and wellness. (Case study description placeholder)',
    role: 'Head of Digital Marketing – strategy, branding & AI integration',
    achievements: ['Launched AI-powered fitness tracking', 'Built scalable wellness community', 'Integrated real-time analytics'],
    technologies: ['Next.js', 'Firebase', 'AI', 'TypeScript'],
    previewImage: '/move-x.jpg',
  },
  {
    slug: 'feusar',
    title: 'Feusar',
    logo: '/feusar.com.png',
    tagline: 'Seamless business operations for the future.',
    description: 'Feusar is a next-gen platform for seamless business operations. (Case study description placeholder)',
    role: 'Lead Product Designer – UX, UI, and workflow automation',
    achievements: ['Automated business workflows', 'Enhanced user experience', 'Optimized operational efficiency'],
    technologies: ['React', 'Node.js', 'Automation', 'UX/UI'],
    previewImage: '/feusar.com.png',
  },
  {
    slug: 'softollyo',
    title: 'Softollyo',
    logo: '/softollyo.com.jpg',
    tagline: 'Software solutions for modern enterprises.',
    description: 'Softollyo delivers software solutions for modern enterprises. (Case study description placeholder)',
    role: 'Full Stack Developer – architecture & deployment',
    achievements: ['Developed enterprise-grade modules', 'Streamlined deployment', 'Improved scalability'],
    technologies: ['Node.js', 'PostgreSQL', 'Cloud', 'Enterprise'],
    previewImage: '/softollyo.com.jpg',
  },
  {
    slug: 'hello-matlab',
    title: 'Hello Matlab',
    logo: '/hello-matlab.jpg',
    tagline: 'Matlab learning and collaboration hub.',
    description: 'Hello Matlab is a learning and collaboration hub for Matlab enthusiasts. (Case study description placeholder)',
    role: 'Community Manager – content & engagement',
    achievements: ['Built collaborative learning tools', 'Grew active user base', 'Curated expert content'],
    technologies: ['Matlab', 'React', 'Community'],
    previewImage: '/hello matlab.jpg',
  },
  {
    slug: 'elita-mart',
    title: 'Elita Mart',
    logo: '/Elita mart.png',
    tagline: 'Premium products, delivered with style.',
    description: 'Elita Mart is an e-commerce platform for premium products. (Case study description placeholder)',
    role: 'E-commerce Strategist – branding & logistics',
    achievements: ['Launched premium product lines', 'Optimized logistics', 'Enhanced brand visibility'],
    technologies: ['E-commerce', 'Branding', 'Logistics'],
    previewImage: '/Elita mart.png',
  },
  {
    slug: 'ai-portfolio-platform',
    title: 'AI LLM Platform',
    logo: '/llm-applications-main.jpg',
    tagline: 'Next.js powered portfolio with AI integration.',
    description: 'AI Portfolio Platform is a Next.js powered portfolio with AI integration. (Case study description placeholder)',
    role: 'AI Engineer – integration & automation',
    achievements: ['Integrated AI chat', 'Automated LLM updates', 'Enhanced user engagement'],
    technologies: ['Next.js', 'AI', 'LLM'],
    previewImage: '/llm-applications-main.jpg',
  },
];

export default function ProjectDetail({ params }: { params: { slug: string } }) {
  const project = projects.find(p => p.slug === params.slug);
  if (!project) return notFound();
  return <ProjectDetailLayout {...project} />;
}
