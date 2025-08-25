module.exports = {

"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}}),
"[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react/jsx-runtime", () => require("react/jsx-runtime"));

module.exports = mod;
}}),
"[externals]/react [external] (react, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react", () => require("react"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/pages-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/contexts/ThemeContext.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "ThemeProvider": ()=>ThemeProvider,
    "useTheme": ()=>useTheme
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
const initialState = {
    theme: 'system',
    setTheme: ()=>null
};
const ThemeProviderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(initialState);
function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme', ...props }) {
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(defaultTheme);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Read from localStorage only on client
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, [
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            return;
        }
        root.classList.add(theme);
    }, [
        theme
    ]);
    const value = {
        theme,
        setTheme: (theme)=>{
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ThemeProviderContext.Provider, {
        ...props,
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/ThemeContext.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
const useTheme = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(ThemeProviderContext);
    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
}),
"[project]/src/contexts/LanguageContext.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "LanguageProvider": ()=>LanguageProvider,
    "useLanguage": ()=>useLanguage
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(undefined);
const useLanguage = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(LanguageContext);
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
        'contact.address': 'San Francisco, CA'
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
        'contact.address': 'Paris, France'
    }
};
const LanguageProvider = ({ children })=>{
    // Get initial language from URL parameter or default to 'en'
    const getInitialLanguage = ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return 'en';
    };
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(getInitialLanguage);
    // Update URL when language changes (without causing page reload)
    const handleLanguageChange = (lang)=>{
        setLanguage(lang);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    };
    const t = (key)=>{
        return translations[language][key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage: handleLanguageChange,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/LanguageContext.tsx",
        lineNumber: 318,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/components/ui/voiceflow-chat.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
const VoiceflowChat = ({ autoLoad = true })=>{
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Only run on client-side and if autoLoad is true
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const voiceflowProjectId = undefined;
        // Check if script is already being loaded or exists
        const existingScript = undefined;
        // Function to load Voiceflow chat script
        const loadVoiceflowChat = undefined;
    }, [
        autoLoad
    ]);
    return null; // This component doesn't render anything
};
const __TURBOPACK__default__export__ = VoiceflowChat;
}),
"[project]/pages/_app.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>App
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ThemeContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$voiceflow$2d$chat$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/voiceflow-chat.tsx [ssr] (ecmascript)");
;
;
;
;
;
;
;
function AppContent({ Component, pageProps }) {
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Set HTML lang attribute dynamically
        document.documentElement.lang = language;
        // Add hreflang links dynamically to avoid TypeScript issues
        const existingHreflangs = document.querySelectorAll('link[hreflang]');
        existingHreflangs.forEach((link)=>link.remove());
        // Get current path without query parameters for canonical URL
        const currentPath = window.location.pathname;
        const canonicalUrl = `https://webascendio.com${currentPath}`;
        const hreflangs = [
            {
                hreflang: 'en',
                href: canonicalUrl
            },
            {
                hreflang: 'fr',
                href: canonicalUrl
            },
            {
                hreflang: 'x-default',
                href: canonicalUrl
            }
        ];
        hreflangs.forEach(({ hreflang, href })=>{
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = hreflang;
            link.href = href;
            document.head.appendChild(link);
        });
        // Update canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            canonicalLink.href = canonicalUrl;
        } else {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            canonicalLink.href = canonicalUrl;
            document.head.appendChild(canonicalLink);
        }
    }, [
        language
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                        children: "Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies."
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "robots",
                        content: "index, follow"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "googlebot",
                        content: "index, follow"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        httpEquiv: "Content-Type",
                        content: "text/html; charset=utf-8"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "language",
                        content: language
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "canonical",
                        href: "https://webascendio.com"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:title",
                        content: "Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:description",
                        content: "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies."
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:type",
                        content: "website"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:url",
                        content: "https://webascendio.com"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:image",
                        content: "https://webascendio.com/og-image.jpg"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:site_name",
                        content: "Webtmize"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:locale",
                        content: language === 'fr' ? 'fr_FR' : 'en_US'
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:card",
                        content: "summary_large_image"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:site",
                        content: "@webtmize"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:title",
                        content: "Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:description",
                        content: "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies."
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:image",
                        content: "https://webascendio.com/og-image.jpg"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "apple-touch-icon",
                        sizes: "180x180",
                        href: "/apple-touch-icon.png"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        type: "image/png",
                        sizes: "32x32",
                        href: "/favicon-32x32.png"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        type: "image/png",
                        sizes: "16x16",
                        href: "/favicon-16x16.png"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "theme-color",
                        content: "#2563eb"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "msapplication-TileColor",
                        content: "#2563eb"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("script", {
                        type: "application/ld+json",
                        dangerouslySetInnerHTML: {
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                "name": "Webtmize",
                                "description": language === 'fr' ? "Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble." : "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together.",
                                "url": "https://webascendio.com",
                                "logo": "https://webascendio.com/logo.png",
                                "contactPoint": {
                                    "@type": "ContactPoint",
                                    "telephone": "+1-555-123-4567",
                                    "contactType": "customer service",
                                    "email": "hello@webascendio.com"
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
                            })
                        }
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                ...pageProps
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$voiceflow$2d$chat$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
function App(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        defaultTheme: "light",
        storageKey: "webtmize-theme",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["LanguageProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(AppContent, {
                ...props
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 132,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/_app.tsx",
            lineNumber: 131,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/_app.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
exports._ = _interop_require_default;
}}),
"[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
exports._ = _interop_require_wildcard;
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/side-effect.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return SideEffect;
    }
});
const _react = __turbopack_context__.r("[externals]/react [external] (react, cjs)");
const isServer = "undefined" === 'undefined';
const useClientOnlyLayoutEffect = ("TURBOPACK compile-time truthy", 1) ? ()=>{} : "TURBOPACK unreachable";
const useClientOnlyEffect = ("TURBOPACK compile-time truthy", 1) ? ()=>{} : "TURBOPACK unreachable";
function SideEffect(props) {
    const { headManager, reduceComponentsToState } = props;
    function emitChange() {
        if (headManager && headManager.mountedInstances) {
            const headElements = _react.Children.toArray(Array.from(headManager.mountedInstances).filter(Boolean));
            headManager.updateHead(reduceComponentsToState(headElements, props));
        }
    }
    if ("TURBOPACK compile-time truthy", 1) {
        var _headManager_mountedInstances;
        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
        emitChange();
    }
    useClientOnlyLayoutEffect(()=>{
        var _headManager_mountedInstances;
        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
        return ()=>{
            var _headManager_mountedInstances;
            headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.delete(props.children);
        };
    });
    // We need to call `updateHead` method whenever the `SideEffect` is trigger in all
    // life-cycles: mount, update, unmount. However, if there are multiple `SideEffect`s
    // being rendered, we only trigger the method from the last one.
    // This is ensured by keeping the last unflushed `updateHead` in the `_pendingUpdate`
    // singleton in the layout effect pass, and actually trigger it in the effect pass.
    useClientOnlyLayoutEffect(()=>{
        if (headManager) {
            headManager._pendingUpdate = emitChange;
        }
        return ()=>{
            if (headManager) {
                headManager._pendingUpdate = emitChange;
            }
        };
    });
    useClientOnlyEffect(()=>{
        if (headManager && headManager._pendingUpdate) {
            headManager._pendingUpdate();
            headManager._pendingUpdate = null;
        }
        return ()=>{
            if (headManager && headManager._pendingUpdate) {
                headManager._pendingUpdate();
                headManager._pendingUpdate = null;
            }
        };
    });
    return null;
} //# sourceMappingURL=side-effect.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/module.compiled.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time truthy", 1) {
        if ("TURBOPACK compile-time truthy", 1) {
            module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/pages-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-turbo.runtime.dev.js, cjs)");
        } else //TURBOPACK unreachable
        ;
    } else //TURBOPACK unreachable
    ;
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/vendored/contexts/amp-context.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/module.compiled.js [ssr] (ecmascript)").vendored['contexts'].AmpContext; //# sourceMappingURL=amp-context.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/vendored/contexts/head-manager-context.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/module.compiled.js [ssr] (ecmascript)").vendored['contexts'].HeadManagerContext; //# sourceMappingURL=head-manager-context.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/amp-mode.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isInAmpMode", {
    enumerable: true,
    get: function() {
        return isInAmpMode;
    }
});
function isInAmpMode(param) {
    let { ampFirst = false, hybrid = false, hasQuery = false } = param === void 0 ? {} : param;
    return ampFirst || hybrid && hasQuery;
} //# sourceMappingURL=amp-mode.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "warnOnce", {
    enumerable: true,
    get: function() {
        return warnOnce;
    }
});
let warnOnce = (_)=>{};
if ("TURBOPACK compile-time truthy", 1) {
    const warnings = new Set();
    warnOnce = (msg)=>{
        if (!warnings.has(msg)) {
            console.warn(msg);
        }
        warnings.add(msg);
    };
} //# sourceMappingURL=warn-once.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/head.js [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    defaultHead: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    defaultHead: function() {
        return defaultHead;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [ssr] (ecmascript)");
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [ssr] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[externals]/react [external] (react, cjs)"));
const _sideeffect = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/side-effect.js [ssr] (ecmascript)"));
const _ampcontextsharedruntime = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/vendored/contexts/amp-context.js [ssr] (ecmascript)");
const _headmanagercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/pages/vendored/contexts/head-manager-context.js [ssr] (ecmascript)");
const _ampmode = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/amp-mode.js [ssr] (ecmascript)");
const _warnonce = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js [ssr] (ecmascript)");
function defaultHead(inAmpMode) {
    if (inAmpMode === void 0) inAmpMode = false;
    const head = [
        /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
            charSet: "utf-8"
        }, "charset")
    ];
    if (!inAmpMode) {
        head.push(/*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
            name: "viewport",
            content: "width=device-width"
        }, "viewport"));
    }
    return head;
}
function onlyReactElement(list, child) {
    // React children can be "string" or "number" in this case we ignore them for backwards compat
    if (typeof child === 'string' || typeof child === 'number') {
        return list;
    }
    // Adds support for React.Fragment
    if (child.type === _react.default.Fragment) {
        return list.concat(_react.default.Children.toArray(child.props.children).reduce((fragmentList, fragmentChild)=>{
            if (typeof fragmentChild === 'string' || typeof fragmentChild === 'number') {
                return fragmentList;
            }
            return fragmentList.concat(fragmentChild);
        }, []));
    }
    return list.concat(child);
}
const METATYPES = [
    'name',
    'httpEquiv',
    'charSet',
    'itemProp'
];
/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/ function unique() {
    const keys = new Set();
    const tags = new Set();
    const metaTypes = new Set();
    const metaCategories = {};
    return (h)=>{
        let isUnique = true;
        let hasKey = false;
        if (h.key && typeof h.key !== 'number' && h.key.indexOf('$') > 0) {
            hasKey = true;
            const key = h.key.slice(h.key.indexOf('$') + 1);
            if (keys.has(key)) {
                isUnique = false;
            } else {
                keys.add(key);
            }
        }
        // eslint-disable-next-line default-case
        switch(h.type){
            case 'title':
            case 'base':
                if (tags.has(h.type)) {
                    isUnique = false;
                } else {
                    tags.add(h.type);
                }
                break;
            case 'meta':
                for(let i = 0, len = METATYPES.length; i < len; i++){
                    const metatype = METATYPES[i];
                    if (!h.props.hasOwnProperty(metatype)) continue;
                    if (metatype === 'charSet') {
                        if (metaTypes.has(metatype)) {
                            isUnique = false;
                        } else {
                            metaTypes.add(metatype);
                        }
                    } else {
                        const category = h.props[metatype];
                        const categories = metaCategories[metatype] || new Set();
                        if ((metatype !== 'name' || !hasKey) && categories.has(category)) {
                            isUnique = false;
                        } else {
                            categories.add(category);
                            metaCategories[metatype] = categories;
                        }
                    }
                }
                break;
        }
        return isUnique;
    };
}
/**
 *
 * @param headChildrenElements List of children of <Head>
 */ function reduceComponents(headChildrenElements, props) {
    const { inAmpMode } = props;
    return headChildrenElements.reduce(onlyReactElement, []).reverse().concat(defaultHead(inAmpMode).reverse()).filter(unique()).reverse().map((c, i)=>{
        const key = c.key || i;
        if ("TURBOPACK compile-time truthy", 1) {
            // omit JSON-LD structured data snippets from the warning
            if (c.type === 'script' && c.props['type'] !== 'application/ld+json') {
                const srcMessage = c.props['src'] ? '<script> tag with src="' + c.props['src'] + '"' : "inline <script>";
                (0, _warnonce.warnOnce)("Do not add <script> tags using next/head (see " + srcMessage + "). Use next/script instead. \nSee more info here: https://nextjs.org/docs/messages/no-script-tags-in-head-component");
            } else if (c.type === 'link' && c.props['rel'] === 'stylesheet') {
                (0, _warnonce.warnOnce)('Do not add stylesheets using next/head (see <link rel="stylesheet"> tag with href="' + c.props['href'] + '"). Use Document instead. \nSee more info here: https://nextjs.org/docs/messages/no-stylesheets-in-head-component');
            }
        }
        return /*#__PURE__*/ _react.default.cloneElement(c, {
            key
        });
    });
}
/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */ function Head(param) {
    let { children } = param;
    const ampState = (0, _react.useContext)(_ampcontextsharedruntime.AmpStateContext);
    const headManager = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_sideeffect.default, {
        reduceComponentsToState: reduceComponents,
        headManager: headManager,
        inAmpMode: (0, _ampmode.isInAmpMode)(ampState),
        children: children
    });
}
const _default = Head;
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=head.js.map
}}),
"[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/head.js [ssr] (ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/shared/lib/head.js [ssr] (ecmascript)");
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__f838bf2f._.js.map