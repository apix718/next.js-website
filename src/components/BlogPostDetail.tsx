import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

const BlogPostDetail: React.FC = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const post = typeof id === 'string' ? blogPosts.find(p => p.id === id) : undefined;

  // Prepare SEO data unconditionally
  const seoData = post
    ? {
        title: `${post.title[language]} - ${post.category[language]} | Webtmize`,
        description: language === 'fr'
          ? `${post.excerpt[language].substring(0, 120)}... Article par ${post.author}, ${post.readTime}. Insights ${post.category[language].toLowerCase()}.`
          : `${post.excerpt[language].substring(0, 120)}... Article by ${post.author}, ${post.readTime}. ${post.category[language]} insights.`,
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
            "description": language === 'fr'
              ? `${post.excerpt[language].substring(0, 120)}... Article par ${post.author}, ${post.readTime}.`
              : `${post.excerpt[language].substring(0, 120)}... Article by ${post.author}, ${post.readTime}.`,
            "image": post.image,
            "author": { "@type": "Person", "name": post.author },
            "publisher": {
              "@type": "Organization",
              "name": "Webtmize",
              "logo": { "@type": "ImageObject", "url": "https://webtmize.ca/logo.png" }
            },
            "datePublished": `${post.publishedDate}T00:00:00Z`,
            "dateModified": `${post.publishedDate}T00:00:00Z`,
            "mainEntityOfPage": { "@type": "WebPage", "@id": `https://webtimize.ca/blog/${post.id}` }
          },
          generateOrganizationSchema(language)
        ]
      }
    : {
        title: language === 'fr' ? 'Article non trouvé | Webtmize' : 'Post not found | Webtmize',
        description: '',
        url: 'https://webtimize.ca/blog',
        type: 'website' as const,
        structuredData: generateOrganizationSchema(language)
      };

  useSEO(seoData);

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {language === 'fr' ? 'Article non trouvé' : 'Post not found'}
          </h1>
          <Link href="/blog">
            <Button>
              {language === 'fr' ? 'Retour au Blog' : 'Back to Blog'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const contentMarkdown = post.content?.[language] ?? post.excerpt?.[language] ?? '';

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.23, 0.86, 0.39, 0.96] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-blue-100 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Webtmize
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/blog">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Retour au Blog' : 'Back to Blog'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with fade-in */}
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
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
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
              <ReactMarkdown>{contentMarkdown}</ReactMarkdown>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Related Articles Section (omitted for brevity) */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300"
          >
            {/* You can keep rendering related content here if desired */}
          </motion.div>
        </div>
      </section>

      {/* Footer remains unchanged in this patch */}
      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 inline-block">
            Webtmize
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{/* footer description can be added here */}</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
            <Link href="/case-studies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Case Studies</Link>
            <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
            <a href="/#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostDetail;