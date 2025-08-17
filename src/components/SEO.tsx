import React from 'react';
import Head from 'next/head';

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
  language?: string;
}

const SEO: React.FC<SEOData> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  structuredData,
  language = 'en',
}) => {
  const ogLocale = language === 'fr' ? 'fr_FR' : 'en_US';
  const baseUrl = url ? url.split('?')[0] : '';

  const jsonLd = structuredData ? JSON.stringify(structuredData, null, 2) : null;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="language" content={language} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="Webtmize" />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:alt" content={title} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@webtmize" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Article specific */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Canonical and hreflang */}
      {url && (
        <>
          <link rel="canonical" href={url} />
          <link rel="alternate" hrefLang="en" href={baseUrl} />
          <link rel="alternate" hrefLang="fr" href={`${baseUrl}?lang=fr`} />
          <link rel="alternate" hrefLang="x-default" href={url} />
        </>
      )}

      {/* Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
    </Head>
  );
};

export default SEO;