"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, User, Tag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

const BlogPostDetail: React.FC = () => {
  const { language } = useLanguage();
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const post = blogPosts.find(p => p.id === id);

  if (post) {
    const desc = language==='fr'
      ? `${post.excerpt[language].slice(0,120)}... Article par ${post.author}, ${post.readTime}.`
      : `${post.excerpt[language].slice(0,120)}... Article by ${post.author}, ${post.readTime}.`;

    useSEO({
      title: `${post.title[language]} - ${post.category[language]} | Webtmize`,
      description: desc,
      url: `https://webtimize.ca/blog/${post.id}`,
      type: 'article',
      image: post.image,
      author: post.author,
      publishedTime: `${post.publishedDate}T00:00:00Z`,
      modifiedTime: `${post.publishedDate}T00:00:00Z`,
      structuredData: [
        {
          "@context":"https://schema.org",
          "@type":"Article",
          headline:post.title[language],
          description:desc,
          image:post.image,
          author:{ "@type":"Person","name":post.author },
          publisher:{ "@type":"Organization","name":"Webtmize","logo":{ "@type":"ImageObject","url":"https://webtimize.ca/logo.png" }},
          datePublished:`${post.publishedDate}T00:00:00Z`,
          dateModified:`${post.publishedDate}T00:00:00Z`,
          mainEntityOfPage:{ "@type":"WebPage","@id":`https://webtimize.ca/blog/${post.id}` }
        },
        generateOrganizationSchema(language)
      ]
    });
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{language==='fr'?'Article non trouvé':'Post not found'}</h1>
          <Link href="/blog"><Button>{language==='fr'?'Retour au Blog':'Back to Blog'}</Button></Link>
        </div>
      </div>
    );
  }

  const fadeInUp = { hidden:{opacity:0,y:60},visible:{opacity:1,y:0,transition:{duration:0.8}}};
  const stagger = { hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:0.2,delayChildren:0.3}}};

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Webtmize</Link>
          <Link href="/blog"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2"/>{language==='fr'?'Retour au Blog':'Back to Blog'}</Button></Link>
        </div>
      </nav>

      <section className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeInUp} className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Badge className="bg-blue-600 text-white">{post.category[language]}</Badge>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(post.publishedDate).toLocaleDateString(language==='fr'?'fr-FR':'en-US')}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4"/> {post.author}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {post.readTime}</span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6">{post.title[language]}</motion.h1>
          <motion.p variants={fadeInUp} className="text-xl mb-8">{post.excerpt[language]}</motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"><Tag className="w-3 h-3"/>{tag}</span>)}
          </motion.div>
          <motion.div variants={fadeInUp} className="rounded-2xl overflow-hidden shadow-2xl mb-12">
            <img src={post.image} alt={post.title[language]} className="w-full h-64 object-cover"/>
          </motion.div>
        </motion.div>
        <section className="prose text-gray-700 dark:text-gray-300">
          <ReactMarkdown>{post.content[language]}</ReactMarkdown>
        </section>
      </section>
    </div>
);
};

export default BlogPostDetail;