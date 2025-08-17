"use client";

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

  useSEO({
    title: language==='fr'
      ? 'Études de Cas Marketing - Résultats Clients Réels | Webtmize'
      : 'Marketing Case Studies - Real Client Results | Webtmize',
    description: language==='fr'
      ? 'Consultez études de cas marketing…'
      : 'View marketing case studies…',
    url:'https://webtimize.ca/case-studies',
    type:'website',
    image:'https://webtimize.ca/case-studies-og.jpg',
    structuredData:generateOrganizationSchema(language)
  });

  const fadeInUp={hidden:{opacity:0,y:60},visible:{opacity:1,y:0,transition:{duration:0.8}}};
  const stag={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:0.2,delayChildren:0.3}}};

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Webtmize</Link>
          <div className="hidden md:flex items-center space-x-8">
            <ThemeToggle /><LanguageSwitcher />
            <a href="/#services" className="hover:text-blue-600">{t('nav.services')}</a>
            <span className="text-blue-600 font-medium">{t('nav.caseStudies')}</span>
            <Link href="/blog" className="hover:text-blue-600">{t('nav.blog')}</Link>
            <a href="/#contact" className="hover:text-blue-600">{t('nav.contact')}</a>
            <Button onClick={()=>window.voiceflow?.chat.open()}>🤖 Book Your Call with AI</Button>
          </div>
          <Link href="/" className="md:hidden">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2"/>{t('nav.back')}</Button>
          </Link>
        </div>
      </nav>

      <section className="pt-24 pb-20 px-6">
        <motion.div initial="hidden" animate="visible" variants={stag} className="text-center max-w-7xl mx-auto">
          <motion.div variants={fadeInUp}><Badge variant="outline" className="mb-4">{t('caseStudies.badge')}</Badge></motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">{t('caseStudies.title')}</motion.h1>
          <motion.p variants={fadeInUp} className="text-xl max-w-3xl mx-auto">{t('caseStudies.subtitle')}</motion.p>
        </motion.div>
      </section>

      <section className="py-20 px-6">
        <motion.div initial="hidden" whileInView="visible" variants={stag} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {caseStudies.map(study=>(
            <motion.div key={study.id} variants={fadeInUp} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="h-48 overflow-hidden"><img src={study.image} alt={`${study.company}`} className="w-full h-full object-cover"/></div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-1">{study.company}</h3>
                <Badge variant="outline" className="text-xs mb-3">{study.industry[language]}</Badge>
                <h4 className="text-xl font-bold mb-3 group-hover:text-blue-600">{study.title[language]}</h4>
                <p className="text-sm mb-4 line-clamp-3">{study.description[language]}</p>
                <Link href={`/case-studies/${study.id}`}><Button className="w-full">{t('caseStudies.viewCase')}<ArrowRight className="ml-2 w-4 h-4"/></Button></Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
);
};

export default CaseStudiesPage;