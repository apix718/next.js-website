"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { caseStudies } from '@/data/caseStudies';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSEO, generateArticleSchema, generateOrganizationSchema } from '@/hooks/useSEO';

const CaseStudyDetail: React.FC = () => {
  const { t, language } = useLanguage();
  const { query, back } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const study = caseStudies.find(c => c.id === id);

  if (study) {
    const desc = language === 'fr'
      ? `${study.company} (${study.industry[language]}): ${study.description[language].slice(0,100)}...`
      : `${study.company} (${study.industry[language]}): ${study.description[language].slice(0,100)}...`;

    useSEO({
      title: `${study.company} Case Study - ${study.title[language]} | Webtmize`,
      description: desc,
      url: `https://webtimize.ca/case-studies/${study.id}`,
      type: 'article',
      image: study.image,
      author: 'Webtmize',
      publishedTime: '2024-01-01T00:00:00Z',
      modifiedTime: '2024-12-01T00:00:00Z',
      structuredData: [generateArticleSchema(study, language), generateOrganizationSchema(language)]
    });
  }

  if (!study) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('caseStudies.notFound')}</h1>
          <Link href="/"><Button>{t('caseStudies.returnHome')}</Button></Link>
        </div>
      </div>
    );
  }

  const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const stag = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } } };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 border-b backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Webtmize</Link>
          <Button variant="outline" size="sm" onClick={() => back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />{t('nav.backHome')}
          </Button>
        </div>
      </nav>

      <section className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stag} className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp} className="space-y-6">
            <h2 className="text-2xl font-bold">{study.company}</h2>
            <Badge variant="outline">{study.industry[language]}</Badge>
            <h1 className="text-4xl font-bold">{study.title[language]}</h1>
            <p className="text-xl">{study.description[language]}</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="h-96 rounded-2xl overflow-hidden shadow-2xl">
            <img src={study.image} alt={study.company} className="w-full h-full object-cover"/>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-12 px-6 max-w-4xl mx-auto space-y-12">
        <motion.div initial="hidden" whileInView="visible" variants={fadeInUp}>
          <h3 className="text-2xl font-bold mb-4">{t('caseStudy.challenge')}</h3>
          <div className="prose"><ReactMarkdown>{study.fullContent.challenge[language]}</ReactMarkdown></div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" variants={fadeInUp}>
          <h3 className="text-2xl font-bold mb-4">{t('caseStudy.solution')}</h3>
          <div className="prose"><ReactMarkdown>{study.fullContent.solution[language]}</ReactMarkdown></div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" variants={fadeInUp}>
          <h3 className="text-2xl font-bold mb-4">{t('caseStudy.results')}</h3>
          <div className="prose"><ReactMarkdown>{study.fullContent.results[language]}</ReactMarkdown></div>
        </motion.div>
      </section>
    </div>
);
};

export default CaseStudyDetail;