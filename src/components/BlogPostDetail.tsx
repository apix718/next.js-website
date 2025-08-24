"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Clock, User, Calendar, ArrowLeft as BackIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

const BlogPostDetail: React.FC = () => {
  const { language } = useLanguage();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Post Not Found</h2>
          <Link href="/blog" className="text-blue-600 hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const seoData = {
    title: `${post.title[language]} - ${post.category[language]} | Webtmize`,
    description: post.excerpt[language],
    url: `https://webtimize.ca/blog/${post.id}`,
    type: 'article' as const,
    image: post.image,
    author: post.author,
    publishedTime: `${post.publishedDate}T00:00:00Z`,
    modifiedTime: `${post.publishedDate}T00:00:00Z`,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title[language],
        "description": post.excerpt[language],
        "image": post.image,
        "author": { "@type": "Person", "name": post.author },
        "publisher": {
          "@type": "Organization",
          "name": "Webtmize",
          "logo": { "@type": "ImageObject", "url": "https://webtmize.ca/logo.png" }
        },
        "datePublished": post.publishedDate,
        "dateModified": post.publishedDate,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://webtmize.ca/blog/${post.id}` }
      },
      generateOrganizationSchema(language)
    ]
  };

  useSEO(seoData);

  const contentMarkdown = post.content?.[language] ?? post.excerpt?.[language] ?? '';

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 0.86, 0.39, 0.96] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="p-4 border-b border-blue-100 dark:border-gray-700">
        <Link href="/blog" className="flex items-center text-blue-600 hover:underline">
          <BackIcon className="w-4 h-4 mr-2" /> Back to Blog
        </Link>
      </header>

      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge className="bg-blue-600 text-white">{post.category[language]}</Badge>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {post.title[language]}
            </motion.h1>

            <motion.div variants={fadeInUp} className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-8">
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }: any) => (
                    <img {...props} loading="lazy" decoding="async" />
                  )
                }}
              >
                {contentMarkdown}
              </ReactMarkdown>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        {/* existing footer content... */}
      </footer>
    </div>
  );
};

export default BlogPostDetail;