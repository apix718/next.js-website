"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  CheckCircle,
  Globe,
  Menu,
  X,
  BarChart3,
  Target,
} from 'lucide-react';

// Import shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlipCard, FlipCardFront, FlipCardBack } from '@/components/ui/flip-card';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO } from '@/hooks/useSEO';
import VoiceflowChat from '@/components/ui/voiceflow-chat';

// Main Marketing Agency Website Component
const MarketingAgencyWebsite: React.FC = () => {
  const { t, language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // SEO Implementation
  const seoData = React.useMemo(() => ({
    title: language === 'fr' 
      ? 'Agence Marketing Digital Spécialisée E-commerce & SaaS | Webtmize'
      : 'Digital Marketing Agency for E-commerce & SaaS Growth | Webtmize',
    description: language === 'fr'
      ? 'Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble avec nos stratégies éprouvées.'
      : 'Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let\'s grow together with proven strategies.',
    url: 'https://webtimize.ca/',
    type: 'website' as const,
    image: 'https://webtimize.ca/og-image.jpg',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Webtmize",
        "description": language === 'fr' 
          ? "Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble."
          : "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together.",
        "url": "https://webtimize.ca",
        "logo": "https://webtimize.ca/logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": language === 'fr' ? "+33 1 23 45 67 89" : "+1 (555) 123-4567",
          "contactType": "customer service",
          "email": "hello@webtmize.com"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": language === 'fr' ? "Paris" : "San Francisco",
          "addressCountry": language === 'fr' ? "FR" : "US"
        },
        "sameAs": [
          "https://linkedin.com/company/webtmize",
          "https://twitter.com/webtmize"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Webtmize",
        "description": language === 'fr' 
          ? "Agence de marketing digital spécialisée dans l'e-commerce et SaaS"
          : "Digital marketing agency specialized in e-commerce and SaaS",
        "url": "https://webtimize.ca",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://webtimize.ca/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }), [language]);

  useSEO(seoData);

  // Navigation items
  const navItems = [
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.caseStudies'), href: '/case-studies', isLink: true },
    { label: t('nav.blog'), href: '/blog', isLink: true },
    { label: t('nav.contact'), href: '#contact' }
  ];

  // Services data for 3D cards
  const services = [
    {
      id: "performance-marketing",
      title: t('services.performance.title'),
      description: t('services.performance.description'),
      icon: <Target className="w-8 h-8" />,
    },
    {
      id: "seo-content",
      title: t('services.seo.title'),
      description: t('services.seo.description'),
      icon: <Globe className="w-8 h-8" />,
    },
    {
      id: "growth-analytics",
      title: t('services.analytics.title'),
      description: t('services.analytics.description'),
      icon: <BarChart3 className="w-8 h-8" />,
    }
  ];

  // Animation variants
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              Webtmize
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <ThemeToggle />
              <LanguageSwitcher />
              {navItems.map((item, index) => {
                if (item.isLink) {
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                }
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </motion.a>
                );
              })}
              <Button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900">
                <span 
                  className="text-white cursor-pointer"
                  onClick={() => {
                    if (window.voiceflow && window.voiceflow.chat) {
                      window.voiceflow.chat.open();
                    }
                  }}
                >
                  🤖 Book Your Call with AI
                </span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-blue-100 dark:border-gray-700"
              >
                <div className="py-4 space-y-4">
                  <ThemeToggle />
                  <LanguageSwitcher />
                  {navItems.map((item) => {
                    if (item.isLink) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      );
                    }
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                    onClick={() => {
                      if (window.voiceflow && window.voiceflow.chat) {
                        window.voiceflow.chat.open();
                      }
                      setIsMenuOpen(false);
                    }}
                  >
                    🤖 Book Your Call with AI
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-700 dark:from-gray-100 dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-relaxed py-4"
            >
              {t('hero.title').split('\n').map((line, index) => (
                <span key={index}>
                  {index === 0 ? (
                    <span className="text-gray-900 dark:text-gray-100">{line}</span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400">{line}</span>
                  )}
                  {index === 0 && <br />}
                </span>
              ))}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                size="lg"
                onClick={() => {
                  if (window.voiceflow && window.voiceflow.chat) {
                    window.voiceflow.chat.open();
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-lg px-8 py-4 hover:from-blue-700 hover:to-blue-900"
              >
                🤖 Book Your Call with AI
              </Button>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { metric: "40+", label: t('hero.metric1') },
                { metric: "2000+", label: t('hero.metric2') },
                { metric: "40M$", label: t('hero.metric3') }
              ].map((item) => (
                <div key={item.metric} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{item.metric}</div>
                  <div className="text-gray-700 dark:text-gray-300">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">{t('services.badge')}</Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100"
            >
              {t('services.title')}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            >
              {t('services.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, _index) => (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  className="h-80"
                >
                  <FlipCard className="h-full w-full">
                    <FlipCardFront className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-xl">
                      <div className="flex h-full flex-col justify-between">
                        <div className="mb-6 text-blue-100">
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="mb-4 text-2xl font-bold text-white">
                            {service.title}
                          </h3>
                          <p className="text-blue-100 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </FlipCardFront>
                    <FlipCardBack className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 p-8 text-white shadow-xl">
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <h3 className="mb-6 text-2xl font-bold text-white">
                            {service.title}
                          </h3>
                          <div className="space-y-4">
                            {service.id === 'performance-marketing' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.performance.features.googleAds')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.performance.features.targeting')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.performance.features.roi')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.performance.features.tracking')}</span>
                                </div>
                              </>
                            )}
                            {service.id === 'seo-content' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.seo.features.audits')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.seo.features.content')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.seo.features.development')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.seo.features.mobile')}</span>
                                </div>
                              </>
                            )}
                            {service.id === 'growth-analytics' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.analytics.features.setup')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.analytics.features.dashboards')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.analytics.features.cro')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-gray-200">{t('services.analytics.features.insights')}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-6">
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                          >
                            {t('services.learnMore')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </FlipCardBack>
                  </FlipCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">{t('contact.badge')}</Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100"
            >
              {t('contact.title')}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            >
              {t('contact.subtitle')}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* AI Chat Booking Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-2xl p-8 lg:col-span-2 max-w-2xl mx-auto"
            >
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Book Your Call with AI Assistant</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                    Chat with our AI assistant to instantly book a consultation call. Get personalized recommendations and schedule your free marketing audit in minutes.
                  </p>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => {
                    if (window.voiceflow && window.voiceflow.chat) {
                      window.voiceflow.chat.open();
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-8 py-4 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  🤖 Chat with AI Assistant
                </Button>
                
                <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                  <p>🤖 Instant responses • 📅 Easy booking • ✨ Personalized recommendations</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
                Webtmize
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.caseStudies')}</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.blog')}</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('footer.careers')}</a></li>
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

      {/* Voiceflow Chat Widget - Conditionally loaded */}
      <VoiceflowChat autoLoad={true} />
    </div>
  );
};

export default MarketingAgencyWebsite;