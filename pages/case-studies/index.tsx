import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { caseStudies } from '@/data/caseStudies';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO, generateOrganizationSchema } from '@/hooks/useSEO';

const CaseStudiesPage: React.FC = () => {
  const { t, language } = useLanguage();

  // SEO Implementation
  useSEO({
    title: language === 'fr' 
      ? 'Études de Cas Marketing - Résultats Clients Réels | Webtmize'
      : 'Marketing Case Studies - Real Client Results | Webtmize',
    description: language === 'fr'
      ? 'Consultez études de cas marketing : découvrez comment Pajar, Brown\'s Shoes et autres marques ont augmenté revenus grâce aux stratégies data-driven et méthodologies éprouvées.'
      : 'View marketing case studies: discover how Pajar, Brown\'s Shoes and other brands increased revenue through data-driven strategies and proven growth methodologies.',
    url: 'https://webtimize.ca/case-studies',
    type: 'website',
    image: 'https://webtimize.ca/case-studies-og.jpg',
    structuredData: generateOrganizationSchema(language)
  });

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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-blue-100 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Webtmize
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <ThemeToggle />
              <LanguageSwitcher />
              <a href="/#services" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t('nav.services')}
              </a>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{t('nav.caseStudies')}</span>
              <Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t('nav.blog')}
              </Link>
              <a href="/#contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t('nav.contact')}
              </a>
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

            <Link href="/" className="md:hidden">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('nav.back')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">{t('caseStudies.badge')}</Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100"
            >
              {t('caseStudies.title')}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            >
              {t('caseStudies.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {caseStudies.map((caseStudy) => (
              <motion.div
                key={caseStudy.id}
                variants={fadeInUp}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                whileHover={{ y: -8 }}
              >
                {/* Case Study Image */}
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={caseStudy.image} 
                    alt={`${caseStudy.company} ${caseStudy.industry[language]} marketing case study showing ${caseStudy.title[language]}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Company Logo and Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{caseStudy.company}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {caseStudy.industry[language]}
                      </Badge>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {caseStudy.title[language]}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {caseStudy.description[language]}
                  </p>

                  {/* Read More Button */}
                  <Link href={`/case-studies/${caseStudy.id}`}>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 group-hover:shadow-lg transition-all mt-4"
                    >
                      {t('caseStudies.viewCase')}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {t('caseStudies.ctaTitle')}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              {t('caseStudies.ctaSubtitle')}
            </p>
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
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
                Webtmize
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('footer.services')}</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.ecommerce')}</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.saas')}</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.performance')}</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.cro')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.about')}</Link></li>
                <li><Link href="/case-studies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.caseStudies')}</Link></li>
                <li><Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.blog')}</Link></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.careers')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('nav.contact')}</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>hello@webtmize.com</li>
                <li>{t('contact.phone')}</li>
                <li>{t('contact.address')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-100 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('footer.copyright')}
            </p>
            <div className="flex space-x-6 text-sm text-gray-700 dark:text-gray-300 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CaseStudiesPage;