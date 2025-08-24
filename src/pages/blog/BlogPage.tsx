"use client";

import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

const BlogPage = (): JSX.Element => {
  const { language } = useLanguage();

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 0.86, 0.39, 0.96] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  const posts = blogPosts;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <motion.div key={post.id} variants={fadeInUp} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative overflow-hidden h-48">
                  <img loading="lazy" src={post.image} alt={post.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">{post.category[language]}</Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{post.title[language]}</h3>
                  <p className="text-gray-700 mb-4">{post.excerpt[language]}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600">{tag}</span>
                    ))}
                  </div>

                  <Link href={`/blog/${post.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                      Read Article
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        {/* existing footer content... */}
      </footer>
    </div>
  );
};

export default BlogPage;