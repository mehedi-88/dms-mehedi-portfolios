import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts, BlogPost } from '../../content/blogPosts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | DMS MEHEDI - Digital Marketing & SEO Insights',
  description: 'Explore the latest insights, tips, and strategies on SEO, Digital Marketing, and Web Development from DMS MEHEDI.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Insights & News
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest trends, strategies, and guides to elevate your digital presence.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.slug} 
              className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <Link href={`/blog/${post.slug}`} className="relative h-48 w-full overflow-hidden block">
                <div className="absolute inset-0 bg-gray-200 animate-pulse" /> {/* Placeholder */}
                {/* Note: In a real app, you'd use the actual image path. 
                    For now, we'll use a colored placeholder if image fails or just the Next.js Image 
                    assuming the images exist in public folder. 
                    Since we don't have the images yet, I'll add a fallback style. */}
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                    <span className="text-4xl">📝</span>
                </div>
              </Link>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span>{post.readTime} read</span>
                </div>

                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow text-sm">
                  {post.description}
                </p>

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    Read Article 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
