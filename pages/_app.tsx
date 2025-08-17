import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import VoiceflowChat from '@/components/ui/voiceflow-chat';
import '@/index.css';

function AppContent({ Component, pageProps }: AppProps) {
  const { language } = useLanguage();

  useEffect(() => {
    // Set HTML lang attribute dynamically
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <Head>
        <title>Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth</title>
        <meta name="description" content="Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content={language} />
        
        {/* Canonical and hreflang */}
        <link rel="canonical" href="https://webtimize.ca" />
        <link rel="alternate" hreflang="en" href="https://webtimize.ca" />
        <link rel="alternate" hreflang="fr" href="https://webtimize.ca?lang=fr" />
        <link rel="alternate" hreflang="x-default" href="https://webtimize.ca" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth" />
        <meta property="og:description" content="Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://webtimize.ca" />
        <meta property="og:image" content="https://webtimize.ca/og-image.jpg" />
        <meta property="og:site_name" content="Webtmize" />
        <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_US'} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@webtmize" />
        <meta name="twitter:title" content="Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth" />
        <meta name="twitter:description" content="Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies." />
        <meta name="twitter:image" content="https://webtimize.ca/og-image.jpg" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Webtmize",
              "description": language === 'fr' 
                ? "Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble."
                : "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together.",
              "url": "https://webtmize.ca",
              "logo": "https://webtmize.ca/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "email": "hello@webtmize.com"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Montreal",
                "addressRegion": "QC",
                "addressCountry": "CA"
              },
              "sameAs": [
                "https://linkedin.com/company/webtmize",
                "https://twitter.com/webtmize"
              ]
            })
          }}
        />
      </Head>
      <Component {...pageProps} />
      <VoiceflowChat />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="webtmize-theme">
      <LanguageProvider>
        <AppContent {...props} />
      </LanguageProvider>
    </ThemeProvider>
  );
}