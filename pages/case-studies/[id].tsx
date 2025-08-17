import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { caseStudies } from '@/data/caseStudies';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO, generateArticleSchema, generateOrganizationSchema } from '@/hooks/useSEO';

const CaseStudyDetail: React.FC = () => {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const caseStudy = typeof id === 'string' ? caseStudies.find(study => study.id === id) : undefined;

  // Prepare SEO data unconditionally
  const seoData = caseStudy
    ? {
        title: `${caseStudy.company} Case Study - ${caseStudy.title[language]} | Webtmize`,
        description: language === 'fr'
          ? `Étude de cas ${caseStudy.company} (${caseStudy.industry[language]}) : ${caseStudy.description[language].substring(0, 100)}... Stratégies marketing avec résultats mesurables.`
          : `${caseStudy.company} case study (${caseStudy.industry[language]}): ${caseStudy.description[language].substring(0, 100)}... Marketing strategies with measurable results.`,
        url: `https://webtimize.ca/case-studies/${caseStudy.id}`,
        type: 'article' as const,
        image: caseStudy.image,
        author: 'Webtmize',
        publishedTime: '2024-01-01T00:00:00Z',
        modifiedTime: '2024-12-01T00:00:00Z',
        structuredData: [
          generateArticleSchema(caseStudy, language),
          generateOrganizationSchema(language)
        ]
      }
    : {
        title: language === 'fr' ? 'Étude de cas non trouvée | Webtmize' : 'Case Study Not Found | Webtmize',
        description: '',
        url: 'https://webtimize.ca/case-studies',
        type: 'website' as const,
        structuredData: generateOrganizationSchema(language)
      };

  useSEO(seoData);

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('caseStudies.notFound')}</h1>
          <Link href="/">
            <Button>{t('caseStudies.returnHome')}</Button>
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
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('nav.backHome')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              {/* Left Column - Content */}
              <motion.div variants={fadeInUp} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{caseStudy.company}</h2>
                    <Badge variant="outline" className="mt-1">{caseStudy.industry[language]}</Badge>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                  {caseStudy.title[language]}
                </h1>

                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  {caseStudy.description[language]}
                </p>
              </motion.div>

              {/* Right Column - Image */}
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl overflow-hidden shadow-2xl h-96"
              >
                <img 
                  src={caseStudy.id === 'browns-shoes-ecommerce-seo' 
                    ? 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                    : caseStudy.image
                  } 
                  alt={`${caseStudy.company} ${caseStudy.industry[language]} case study - ${caseStudy.title[language]}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
              {/* Challenge */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('caseStudy.challenge')}</h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose">
                  <ReactMarkdown>{caseStudy.fullContent.challenge[language]}</ReactMarkdown>
                </div>
              </motion.div>

              {/* Solution */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('caseStudy.solution')}</h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose">
                  <ReactMarkdown>{caseStudy.fullContent.solution[language]}</ReactMarkdown>
                </div>
              </motion.div>

              {/* Results */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('caseStudy.results')}</h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 prose">
                  <ReactMarkdown>{caseStudy.fullContent.results[language]}</ReactMarkdown>
                </div>
              </motion.div>

          </div>
        </div>
      </section>

      {/* Related Content Section */}
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
              {language === 'fr' ? 'Ressources Connexes' : 'Related Resources'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'fr' 
                ? 'Explorez plus de stratégies et insights pour votre croissance'
                : 'Explore more strategies and insights for your growth'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/case-studies" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'fr' ? 'Plus d\'Études de Cas' : 'More Case Studies'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {language === 'fr' 
                    ? 'Découvrez d\'autres success stories'
                    : 'Discover more success stories'
                  }
                </p>
              </div>
            </Link>

            <Link href="/blog" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'fr' ? 'Guides Marketing' : 'Marketing Guides'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {language === 'fr' 
                    ? 'Stratégies et conseils d\'experts'
                    : 'Expert strategies and tips'
                  }
                </p>
              </div>
            </Link>

            <a href="/#services" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'fr' ? 'Nos Services' : 'Our Services'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {language === 'fr' 
                    ? 'Solutions marketing complètes'
                    : 'Complete marketing solutions'
                  }
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 inline-block">
            Webtmize
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('caseStudy.footerText')}
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
            onClick={() => {
              if (window.voiceflow && window.voiceflow.chat) {
                window.voiceflow.chat.open();
              }
            }}
          >
            🤖 Book Your Call with AI
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default CaseStudyDetail;