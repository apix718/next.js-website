import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { caseStudies } from '@/data/caseStudies';
import { useLanguage } from '@/contexts/LanguageContext';
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

  // ... rest of component unchanged
  // (keep your existing JSX here)
  // ...
};

export default CaseStudyDetail;