"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

const BlogPage: React.FC = () => {
  const { t, language } = useLanguage();

  useSEO({
    title: language === 'fr'
      ? 'Blog Marketing Digital - Guides & Stratégies Experts | Webtmize'
      : 'Digital Marketing Blog - Expert Guides & Strategies | Webtmize',
    description: language === 'fr'
      ? 'Découvrez guides pratiques SEO, stratégies Google Ads, insights IA et conseils croissance e-commerce. Expertise marketing digital pour entrepreneurs et marketeurs.'
      : 'Explore practical SEO guides, Google Ads strategies, AI insights and e-commerce growth tips. Digital marketing expertise for entrepreneurs and marketers.',
    url: 'https://webtimize.ca/blog',
    type: 'website',
    image: 'https://webtimize.ca/blog-og.jpg',
    structuredData: generateOrganizationSchema(language)
  });

  const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } } };
  const regular = blogPosts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Webtmize</Link>
          <div className="hidden md:flex items-center space-x-8">
            <ThemeToggle /><LanguageSwitcher />
            <a href="/#services" className="hover:text-blue-600">{t('nav.services')}</a>
            <Link href="/case-studies" className="hover:text-blue-600">{t('nav.caseStudies')}</Link>
            <span className="text-blue-600 font-medium">Blog</span>
            <a href="/#contact" className="hover:text-blue-600">{t('nav.contact')}</a>
            <Button onClick={() => window.voiceflow?.chat.open()}>🤖 Book Your Call with AI</Button>
          </div>
          <Link href="/" className="md:hidden">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />{t('nav.back')}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-7xl mx-auto">
          <motion.div variants={fadeInUp}><Badge variant="outline" className="mb-4">Blog</Badge></motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">{language === 'fr' ? 'Insights Marketing Digital' : 'Digital Marketing Insights'}</motion.h1>
          <motion.p variants={fadeInUp} className="text-xl max-w-3xl mx-auto">{language === 'fr' ? 'Découvrez les dernières stratégies...' : 'Discover the latest digital marketing strategies...'}</motion.p>
        </motion.div>
      </section>

      {/* Regular Posts */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeInUp} className="text-2xl font-bold mb-8">{language === 'fr' ? 'Tous les Articles' : 'All Articles'}</motion.h2>
          <motion.div initial="hidden" whileInView="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regular.map(post => (
              <motion.div key={post.id} variants={fadeInUp} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <img src={post.image} alt={post.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <Badge className="absolute top-4 left-4 bg-blue-600 text-white">{post.category[language]}</Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4"><Clock className="w-4 h-4" />{post.readTime}</div>
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600">{post.title[language]}</h3>
                  <p className="text-sm mb-4 line-clamp-3">{post.excerpt[language]}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0,3).map(tag => <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"><Tag className="w-3 h-3" />{tag}</span>)}
                  </div>
                  <Link href={`/blog/${post.id}`}><Button className="w-full">{language==='fr'?'Lire l’Article':'Read Article'}<ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
);
};

export default BlogPage;