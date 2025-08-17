import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, User, Tag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

export async function getStaticPaths() {
  const paths = blogPosts.map((post) => ({
    params: { id: post.id },
  }));

  return {
    paths,
    fallback: false, // Return 404 for unknown ids
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const post = blogPosts.find((p) => p.id === params.id) || null;

  return {
    props: {
      post,
    },
  };
}

interface BlogPost {
  id: string;
  title: { en: string; fr: string };
  excerpt: { en: string; fr: string };
  category: { en: string; fr: string };
  tags: string[];
  author: string;
  readTime: string;
  publishedDate: string;
  image: string;
  featured: boolean;
  content: { en: string; fr: string };
}

interface BlogPostDetailProps {
  post: BlogPost | null;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ post }) => {
  const { t, language } = useLanguage();

  // SEO Implementation for blog post
  if (post) {
    // Create unique description for each blog post
    const uniqueDescription = language === 'fr' 
      ? `${post.excerpt[language].substring(0, 120)}... Article par ${post.author}, ${post.readTime}. Insights ${post.category[language].toLowerCase()}.`
      : `${post.excerpt[language].substring(0, 120)}... Article by ${post.author}, ${post.readTime}. ${post.category[language]} insights.`;
    
    useSEO({
      title: `${post.title[language]} - ${post.category[language]} | Webtmize`,
      description: uniqueDescription,
      url: `https://webtimize.ca/blog/${post.id}`,
      type: 'article',
      image: post.image,
      author: post.author,
      publishedTime: `${post.publishedDate}T00:00:00Z`,
      modifiedTime: `${post.publishedDate}T00:00:00Z`,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title[language],
          "description": uniqueDescription,
          "image": post.image,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Webtmize",
            "logo": {
              "@type": "ImageObject",
              "url": "https://webtimize.ca/logo.png"
            }
          },
          "datePublished": `${post.publishedDate}T00:00:00Z`,
          "dateModified": `${post.publishedDate}T00:00:00Z`,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://webtimize.ca/blog/${post.id}`
          }
        },
        generateOrganizationSchema(language)
      ]
    });
  }

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

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Article Meta */}
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Badge className="bg-blue-600 text-white">
                  {post.category[language]}
                </Badge>
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
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight"
            >
              {post.title[language]}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8"
            >
              {post.excerpt[language]}
            </motion.p>

            {/* Tags */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
                  <Tag className="w-3 h-3" />
                  {tag}
                </div>
              ))}
            </motion.div>

            {/* Featured Image */}
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl overflow-hidden shadow-2xl mb-12"
            >
              <img 
                src={post.image} 
                alt={`${post.title[language]} - ${post.category[language]} article cover image`}
                className="w-full h-64 md:h-96 object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300"
          >
            <ReactMarkdown>{post.content[language]}</ReactMarkdown>
          </motion.div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {language === 'fr' ? 'Articles Connexes' : 'Related Articles'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'fr' 
                ? 'Découvrez plus de stratégies marketing pour faire croître votre entreprise'
                : 'Discover more marketing strategies to grow your business'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/case-studies" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'fr' ? 'Études de Cas Clients' : 'Client Case Studies'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {language === 'fr' 
                    ? 'Découvrez comment nous avons aidé des marques à atteindre une croissance extraordinaire'
                    : 'See how we\'ve helped brands achieve extraordinary growth'
                  }
                </p>
              </div>
            </Link>

            <a href="/#services" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'fr' ? 'Nos Services Marketing' : 'Our Marketing Services'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {language === 'fr' 
                    ? 'Performance marketing, SEO et analytics pour accélérer votre croissance'
                    : 'Performance marketing, SEO and analytics to accelerate your growth'
                  }
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Related Posts CTA */}
      <section className="py-20 px-6 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {language === 'fr' ? 'Prêt à Implémenter Ces Stratégies ?' : 'Ready to Implement These Strategies?'}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              {language === 'fr' 
                ? 'Obtenez un audit marketing gratuit et découvrez comment nous pouvons vous aider à appliquer ces techniques à votre entreprise.'
                : 'Get a free marketing audit and discover how we can help you apply these techniques to your business.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 text-lg hover:from-blue-700 hover:to-blue-900"
                onClick={() => {
                  if (window.voiceflow && window.voiceflow.chat) {
                    window.voiceflow.chat.open();
                  }
                }}
              >
                🤖 Book Your Call with AI
              </Button>
              <Link href="/blog">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  {language === 'fr' ? 'Plus d\'Articles' : 'More Articles'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 inline-block">
            Webtmize
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('footer.description')}
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.about')}</Link>
            <Link href="/case-studies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.caseStudies')}</Link>
            <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.blog')}</Link>
            <a href="/#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('nav.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostDetail;