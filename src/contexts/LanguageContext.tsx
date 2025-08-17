import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  en: {
    // Navigation
    'nav.services': 'Services',
    'nav.caseStudies': 'Case Studies',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.freeAudit': 'Get Free Audit',
    'nav.back': 'Back',
    'nav.backHome': 'Back to Home',

    // Hero Section
    'hero.title': 'More Growth More Clients\nGuaranteed',
    'hero.subtitle': 'We partner with Ecom and SaaS teams to implement proven strategies that increase revenue within 30 days',
    'hero.cta': 'Get Your Free Marketing Audit',
    'hero.metric1': 'Active Clients Globally',
    'hero.metric2': 'Projects Delivered',
    'hero.metric3': 'Managed Last Year',

    // Services Section
    'services.badge': 'Services',
    'services.title': 'Complete Marketing Solutions',
    'services.subtitle': 'From strategy to execution, we provide end-to-end marketing services designed to accelerate your growth.',
    'services.performance.title': 'Performance Marketing',
    'services.performance.description': 'Dominate search and social with optimized paid campaigns that deliver measurable ROI.',
    'services.seo.title': 'SEO & Web Development',
    'services.seo.description': 'Build lasting organic growth with strategic SEO and modern web development solutions.',
    'services.analytics.title': 'Growth Analytics',
    'services.analytics.description': 'Turn data into actionable insights with comprehensive tracking and optimization.',
    'services.learnMore': 'Learn More',

    // Services - Flip Card Back Content
    'services.performance.features.googleAds': 'Google Ads & Meta Campaigns',
    'services.performance.features.targeting': 'Advanced Audience Targeting',
    'services.performance.features.roi': 'ROI-Focused Optimization',
    'services.performance.features.tracking': 'Real-time Performance Tracking',
    
    'services.seo.features.audits': 'Technical SEO Audits',
    'services.seo.features.content': 'Content Strategy & Creation',
    'services.seo.features.development': 'Modern Web Development',
    'services.seo.features.mobile': 'Mobile-First Design',
    
    'services.analytics.features.setup': 'Advanced Analytics Setup',
    'services.analytics.features.dashboards': 'Custom Dashboard Creation',
    'services.analytics.features.cro': 'Conversion Rate Optimization',
    'services.analytics.features.insights': 'Data-Driven Insights',

    // Contact Section
    'contact.badge': 'Contact',
    'contact.title': 'Growth waits for no one. Secure your spot now!',
    'contact.subtitle': 'Claim your free marketing audit and discover how we can accelerate your results.',
    'contact.formTitle': 'Get Your Free Marketing Audit',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.company': 'Company',
    'contact.challenge': 'Primary Challenge',
    'contact.challengePlaceholder': 'Tell us about your biggest marketing challenge...',
    'contact.submit': 'Get Your Free Audit',
    'contact.thankYou': 'Thank You!',
    'contact.thankYouMessage': 'We\'ve received your request. Our team will contact you within 24 hours to schedule your free marketing audit.',
    'contact.sendAnother': 'Send Another Message',
    'contact.getInTouch': 'Get in Touch',
    'contact.getInTouchSubtitle': 'Ready to transform your marketing? Let\'s discuss how we can help you achieve your growth goals.',
    'contact.emailUs': 'Email Us',
    'contact.emailDescription': 'Get in touch via email',
    'contact.callUs': 'Call Us',
    'contact.callDescription': 'Speak directly with our team',

    // Form Validation
    'form.nameRequired': 'Name is required',
    'form.emailRequired': 'Email is required',
    'form.emailInvalid': 'Please enter a valid email',
    'form.messageRequired': 'Message is required',
    'form.messageMinLength': 'Message must be at least 10 characters',

    // Footer
    'footer.description': 'Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let\'s grow together.',
    'footer.services': 'Services',
    'footer.ecommerce': 'E-commerce Marketing',
    'footer.saas': 'SaaS Growth',
    'footer.performance': 'Performance Marketing',
    'footer.cro': 'CRO',
    'footer.company': 'Company',
    'footer.about': 'About',
    'footer.caseStudies': 'Case Studies',
    'footer.blog': 'Blog',
    'footer.careers': 'Careers',
    'footer.copyright': '© 2025 Webtmize. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',

    // Case Studies Page
    'caseStudies.badge': 'Case Studies',
    'caseStudies.title': 'Proven Results',
    'caseStudies.subtitle': 'See how we\'ve helped companies like yours achieve extraordinary growth through strategic marketing and proven methodologies.',
    'caseStudies.viewCase': 'View Case Study',
    'caseStudies.ctaTitle': 'Ready to Be Our Next Success Story?',
    'caseStudies.ctaSubtitle': 'Let\'s discuss how we can help your business achieve similar results with our proven growth strategies.',
    'caseStudies.ctaButton': 'Get Your Free Marketing Audit',
    'caseStudies.notFound': 'Case Study Not Found',
    'caseStudies.returnHome': 'Return Home',

    // Case Study Detail
    'caseStudy.challenge': 'The Challenge',
    'caseStudy.solution': 'Our Solution',
    'caseStudy.results': 'The Results',
    'caseStudy.keyTakeaways': 'Key Takeaways',
    'caseStudy.footerText': 'Ready to transform your marketing? Let\'s discuss your growth goals.',
    'caseStudy.getStarted': 'Get Started Today',

    // FAQ
    'faq.question1': 'How quickly can we see results from your marketing efforts?',
    'faq.answer1': 'Most clients see initial improvements within 30-60 days, with significant results typically achieved within 3-6 months. However, timeline varies based on your current situation, industry, and goals.',
    'faq.question2': 'Do you work with both B2B and B2C companies?',
    'faq.answer2': 'Yes, we specialize in both B2B SaaS companies and B2C e-commerce brands. Our strategies are tailored to each business model\'s unique customer journey and sales cycle.',
    'faq.question3': 'What\'s included in your free marketing audit?',
    'faq.answer3': 'Our comprehensive audit includes analysis of your current marketing channels, conversion funnel assessment, competitive analysis, and a prioritized action plan with specific recommendations.',
    'faq.question4': 'How do you measure and report on campaign performance?',
    'faq.answer4': 'We provide detailed monthly reports with key metrics, insights, and recommendations. You\'ll have access to real-time dashboards and regular strategy calls to discuss performance and optimizations.',
    'faq.question5': 'What makes your agency different from others?',
    'faq.answer5': 'We focus exclusively on e-commerce and SaaS, bringing deep industry expertise. Our data-driven approach, proven methodologies, and commitment to transparent reporting set us apart.',

    // Phone and Address
    'contact.phone': '+1 (555) 123-4567',
    'contact.address': 'San Francisco, CA',
  },
  fr: {
    // Navigation
    'nav.services': 'Services',
    'nav.caseStudies': 'Études',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.freeAudit': 'Audit Gratuit',
    'nav.back': 'Retour',
    'nav.backHome': 'Retour à l\'Accueil',

    // Hero Section
    'hero.title': 'Plus de croissance, plus de clients :\nc\'est garanti',
    'hero.subtitle': 'Nous accompagnons les équipes e-commerce et SaaS dans la mise en œuvre de stratégies éprouvées qui augmentent les revenus en 30 jours',
    'hero.cta': 'Obtenez votre audit marketing gratuit',
    'hero.metric1': 'Clients actifs dans le monde',
    'hero.metric2': 'Projets livrés',
    'hero.metric3': 'Gérés l\'année dernière',

    // Services Section
    'services.badge': 'Services',
    'services.title': 'Solutions marketing complètes',
    'services.subtitle': 'De la stratégie à l\'exécution, nous fournissons des services marketing de bout en bout conçus pour accélérer votre croissance.',
    'services.performance.title': 'Marketing de performance',
    'services.performance.description': 'Dominez les moteurs de recherche et les réseaux sociaux avec des campagnes payantes optimisées qui offrent un ROI mesurable.',
    'services.seo.title': 'SEO et développement web',
    'services.seo.description': 'Construisez une croissance organique durable avec des solutions SEO stratégiques et de développement web moderne.',
    'services.analytics.title': 'Analytique de croissance',
    'services.analytics.description': 'Transformez les données en insights actionnables avec un suivi et une optimisation complets.',
    'services.learnMore': 'En savoir plus',

    // Services - Flip Card Back Content
    'services.performance.features.googleAds': 'Campagnes Google Ads et Meta',
    'services.performance.features.targeting': 'Ciblage d\'audience avancé',
    'services.performance.features.roi': 'Optimisation axée sur le ROI',
    'services.performance.features.tracking': 'Suivi des performances en temps réel',
    
    'services.seo.features.audits': 'Audits SEO techniques',
    'services.seo.features.content': 'Stratégie et création de contenu',
    'services.seo.features.development': 'Développement web moderne',
    'services.seo.features.mobile': 'Design mobile-first',
    
    'services.analytics.features.setup': 'Configuration d\'analytiques avancées',
    'services.analytics.features.dashboards': 'Création de tableaux de bord personnalisés',
    'services.analytics.features.cro': 'Optimisation du taux de conversion',
    'services.analytics.features.insights': 'Insights basés sur les données',

    // Contact Section
    'contact.badge': 'Contact',
    'contact.title': 'La croissance n\'attend personne. Réservez votre place maintenant !',
    'contact.subtitle': 'Réclamez votre audit marketing gratuit et découvrez comment nous pouvons accélérer vos résultats.',
    'contact.formTitle': 'Obtenez votre audit marketing gratuit',
    'contact.name': 'Nom',
    'contact.email': 'Email',
    'contact.company': 'Entreprise',
    'contact.challenge': 'Défi principal',
    'contact.challengePlaceholder': 'Parlez-nous de votre plus grand défi marketing...',
    'contact.submit': 'Obtenez votre audit gratuit',
    'contact.thankYou': 'Merci !',
    'contact.thankYouMessage': 'Nous avons reçu votre demande. Notre équipe vous contactera dans les 24 heures pour planifier votre audit marketing gratuit.',
    'contact.sendAnother': 'Envoyer un autre message',
    'contact.getInTouch': 'Contactez-nous',
    'contact.getInTouchSubtitle': 'Prêt à transformer votre marketing ? Discutons de la façon dont nous pouvons vous aider à atteindre vos objectifs de croissance.',
    'contact.emailUs': 'Envoyez-nous un email',
    'contact.emailDescription': 'Contactez-nous par email',
    'contact.callUs': 'Appelez-nous',
    'contact.callDescription': 'Parlez directement avec notre équipe',

    // Form Validation
    'form.nameRequired': 'Le nom est requis',
    'form.emailRequired': 'L\'email est requis',
    'form.emailInvalid': 'Veuillez entrer un email valide',
    'form.messageRequired': 'Le message est requis',
    'form.messageMinLength': 'Le message doit contenir au moins 10 caractères',

    // Footer
    'footer.description': 'Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble.',
    'footer.services': 'Services',
    'footer.ecommerce': 'Marketing e-commerce',
    'footer.saas': 'Croissance SaaS',
    'footer.performance': 'Marketing de performance',
    'footer.cro': 'CRO',
    'footer.company': 'Entreprise',
    'footer.about': 'À propos',
    'footer.caseStudies': 'Études',
    'footer.blog': 'Blog',
    'footer.careers': 'Carrières',
    'footer.copyright': '© 2025 Webtmize. Tous droits réservés.',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.cookies': 'Politique des cookies',

    // Case Studies Page
    'caseStudies.badge': 'Études',
    'caseStudies.title': 'Résultats prouvés',
    'caseStudies.subtitle': 'Découvrez comment nous avons aidé des entreprises comme la vôtre à atteindre une croissance extraordinaire grâce au marketing stratégique et à des méthodologies éprouvées.',
    'caseStudies.viewCase': 'Voir l\'étude de cas',
    'caseStudies.ctaTitle': 'Prêt à être notre prochaine success story ?',
    'caseStudies.ctaSubtitle': 'Discutons de la façon dont nous pouvons aider votre entreprise à obtenir des résultats similaires avec nos stratégies de croissance éprouvées.',
    'caseStudies.ctaButton': 'Obtenez votre audit marketing gratuit',
    'caseStudies.notFound': 'Étude de cas non trouvée',
    'caseStudies.returnHome': 'Retour à l\'accueil',

    // Case Study Detail
    'caseStudy.challenge': 'Le défi',
    'caseStudy.solution': 'Notre solution',
    'caseStudy.results': 'Les résultats',
    'caseStudy.keyTakeaways': 'Points clés à retenir',
    'caseStudy.footerText': 'Prêt à transformer votre marketing ? Discutons de vos objectifs de croissance.',
    'caseStudy.getStarted': 'Commencez aujourd\'hui',

    // FAQ
    'faq.question1': 'À quelle vitesse pouvons-nous voir les résultats de vos efforts marketing ?',
    'faq.answer1': 'La plupart des clients voient des améliorations initiales dans les 30-60 jours, avec des résultats significatifs généralement obtenus dans les 3-6 mois. Cependant, le délai varie selon votre situation actuelle, votre secteur et vos objectifs.',
    'faq.question2': 'Travaillez-vous avec les entreprises B2B et B2C ?',
    'faq.answer2': 'Oui, nous nous spécialisons dans les entreprises SaaS B2B et les marques e-commerce B2C. Nos stratégies sont adaptées au parcours client unique et au cycle de vente de chaque modèle d\'affaires.',
    'faq.question3': 'Qu\'est-ce qui est inclus dans votre audit marketing gratuit ?',
    'faq.answer3': 'Notre audit complet inclut l\'analyse de vos canaux marketing actuels, l\'évaluation de l\'entonnoir de conversion, l\'analyse concurrentielle, et un plan d\'action priorisé avec des recommandations spécifiques.',
    'faq.question4': 'Comment mesurez-vous et rapportez-vous les performances des campagnes ?',
    'faq.answer4': 'Nous fournissons des rapports mensuels détaillés avec des métriques clés, des insights et des recommandations. Vous aurez accès à des tableaux de bord en temps réel et à des appels stratégiques réguliers pour discuter des performances et optimisations.',
    'faq.question5': 'Qu\'est-ce qui rend votre agence différente des autres ?',
    'faq.answer5': 'Nous nous concentrons exclusivement sur l\'e-commerce et le SaaS, apportant une expertise sectorielle approfondie. Notre approche axée sur les données, nos méthodologies éprouvées et notre engagement envers la transparence nous distinguent.',

    // Phone and Address
    'contact.phone': '+33 1 23 45 67 89',
    'contact.address': 'Paris, France',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get initial language from URL parameter or default to 'en'
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam === 'fr' || langParam === 'en') {
        return langParam as Language;
      }
    }
    return 'en';
  };
  
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  
  // Update URL when language changes (without causing page reload)
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (lang === 'fr') {
        url.searchParams.set('lang', 'fr');
      } else {
        url.searchParams.delete('lang');
      }
      
      // Update URL without reloading the page
      window.history.replaceState({}, '', url.toString());
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      {children}
    </LanguageContext.Provider>
  );
};