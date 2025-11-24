import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts, BlogPost } from '../../../content/blogPosts';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | DMS MEHEDI Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['DMS MEHEDI'],
      images: [
        {
          url: post.image, // In a real app, this should be a full URL
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-primary">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {post.category}
            </span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime} read</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {post.subtitle}
          </p>
        </header>

        {/* Featured Image Placeholder */}
        <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center relative">
           {/* In production, use next/image with post.image */}
           <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-6xl">🖼️</span>
           </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword) => (
              <span 
                key={keyword} 
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to grow your business?</h3>
          <p className="text-muted-foreground mb-6">
            Contact DMS MEHEDI today for expert digital marketing services tailored to your needs.
          </p>
          <Link 
            href="/#contact" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
          >
            Get a Free Consultation
          </Link>
        </div>
      </article>
    </div>
  );
}
