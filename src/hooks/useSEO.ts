import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object | object[];
}

interface CaseStudy {
  id: string;
  title: { [key: string]: string };
  description: { [key: string]: string };
  industry: { [key: string]: string };
  image: string;
}

export const useSEO = (seoData: SEOData) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Set language attribute
    document.documentElement.lang = language;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      const selector = `meta[${attribute}="${name}"]`;
      
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Helper function to update title specifically
    const updateTitle = (title: string) => {
      // Only update the existing title element, don't create duplicates
      let titleElement = document.querySelector('title');
      if (titleElement) {
        titleElement.textContent = title;
      } else {
        // Only create if it doesn't exist
        titleElement = document.createElement('title');
        titleElement.textContent = title;
        document.head.appendChild(titleElement);
      }
    };

    // Helper function to update or create link tag
    const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute('href', href);
      } else {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('href', href);
        if (hreflang) {
          element.setAttribute('hreflang', hreflang);
        }
        document.head.appendChild(element);
      }
    };

    // Update title first
    updateTitle(seoData.title);

    // Basic meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('language', language);

    // Open Graph tags
    updateMetaTag('og:title', seoData.title, true);
    updateMetaTag('og:description', seoData.description, true);
    updateMetaTag('og:type', seoData.type || 'website', true);
    updateMetaTag('og:locale', language === 'fr' ? 'fr_FR' : 'en_US', true);
    updateMetaTag('og:site_name', 'Webtmize', true);
    
    if (seoData.image) {
      updateMetaTag('og:image', seoData.image, true);
      updateMetaTag('og:image:alt', seoData.title, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
    }
    
    if (seoData.url) {
      updateMetaTag('og:url', seoData.url, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@webtmize');
    updateMetaTag('twitter:title', seoData.title);
    updateMetaTag('twitter:description', seoData.description);
    
    if (seoData.image) {
      updateMetaTag('twitter:image', seoData.image);
    }

    // Article-specific meta tags
    if (seoData.type === 'article') {
      if (seoData.author) {
        updateMetaTag('article:author', seoData.author, true);
      }
      if (seoData.publishedTime) {
        updateMetaTag('article:published_time', seoData.publishedTime, true);
      }
      if (seoData.modifiedTime) {
        updateMetaTag('article:modified_time', seoData.modifiedTime, true);
      }
    }

    // Canonical URL and hreflang
    if (seoData.url) {
      updateLinkTag('canonical', seoData.url);
      
      // Hreflang tags for multilingual support
      const baseUrl = seoData.url.split('?')[0];
      updateLinkTag('alternate', baseUrl, 'en');
      updateLinkTag('alternate', `${baseUrl}?lang=fr`, 'fr');
      updateLinkTag('alternate', seoData.url, 'x-default');
    }

    // Handle structured data
    if (seoData.structuredData) {
      // Remove existing structured data
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());
      
      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      
      const jsonData = Array.isArray(seoData.structuredData) 
        ? seoData.structuredData 
        : seoData.structuredData;
        
      script.textContent = JSON.stringify(jsonData, null, 2);
      document.head.appendChild(script);
    }

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Ensure we have a proper title tag in head

  }, [seoData, language]);
};

// SEO utility functions
export const generateOrganizationSchema = (language: string) => ({
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
    "telephone": "+1-555-123-4567",
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
});

export const generateWebsiteSchema = (language: string) => ({
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
});

export const generateArticleSchema = (caseStudy: CaseStudy, language: string) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": caseStudy.title[language],
  "description": caseStudy.description[language],
  "image": caseStudy.image,
  "author": {
    "@type": "Organization",
    "name": "Webtmize"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Webtmize",
    "logo": {
      "@type": "ImageObject",
      "url": "https://webtimize.ca/logo.png"
    }
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-12-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://webtimize.ca/case-studies/${caseStudy.id}`
  },
  "about": {
    "@type": "Thing",
    "name": caseStudy.industry[language]
  }
});