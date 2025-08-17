"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSEO } from '@/hooks/useSEO';
import VoiceflowChat from '@/components/ui/voiceflow-chat';

const MarketingAgencyWebsite: React.FC = () => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

  useSEO({
    title: language==='fr'
      ? 'Agence Marketing Digital Spécialisée E-commerce & SaaS | Webtmize'
      : 'Digital Marketing Agency for E-commerce & SaaS Growth | Webtmize',
    description: language==='fr'
      ? 'Webtmize offre des solutions marketing à haut ROI…'
      : 'Webtmize delivers high-ROI marketing solutions…',
    url:'https://webtimize.ca/',
    type:'website',
    image:'https://webtimize.ca/og-image.jpg'
  });

  const navItems = [
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.caseStudies'), href: '/case-studies', link: true },
    { label: t('nav.blog'), href: '/blog', link: true },
    { label: t('nav.contact'), href: '#contact' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Webtmize
          </motion.div>
          <div className="hidden md:flex items-center space-x-8">
            <ThemeToggle /><LanguageSwitcher />
            {navItems.map((i, idx) =>
              i.link ? (
                <motion.div key={i.label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Link href={i.href} className="hover:text-blue-600">{i.label}</Link>
                </motion.div>
              ) : (
                <motion.a key={i.label} href={i.href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="hover:text-blue-600">
                  {i.label}
                </motion.a>
              )
            )}
            <Button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white" onClick={() => window.voiceflow?.chat.open()}>
              🤖 Book Your Call with AI
            </Button>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t p-4">
              <ThemeToggle /><LanguageSwitcher />
              {navItems.map(i =>
                i.link ? (
                  <Link key={i.label} href={i.href} className="block py-2 hover:text-blue-600">{i.label}</Link>
                ) : (
                  <a key={i.label} href={i.href} className="block py-2 hover:text-blue-600">{i.label}</a>
                )
              )}
              <Button className="w-full mt-2" onClick={() => { window.voiceflow?.chat.open(); setOpen(false); }}>
                🤖 Book Your Call with AI
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Hero, services, contact sections omitted */}
      <VoiceflowChat autoLoad={true} />
    </div>
);
};

export default MarketingAgencyWebsite;