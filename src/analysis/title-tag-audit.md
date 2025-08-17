# Title Tag Audit - Duplicate Detection

## Current Title Tags Analysis

### 1. Homepage (/) - POTENTIAL DUPLICATE ISSUE ⚠️
**SEOHead.tsx (Default)**:
- EN: `Digital Marketing Agency for E-commerce & SaaS Growth | Webtmize`
- FR: `Agence Marketing Digital Spécialisée E-commerce & SaaS | Webtmize`

**marketing-agency-website.tsx (Homepage)**:
- EN: `Webtmize - Digital Marketing Solutions for E-commerce & SaaS | Home`
- FR: `Webtmize - Solutions Marketing Digital E-commerce & SaaS | Accueil`

❌ **PROBLEM**: Both components are setting titles for the same page, causing potential conflicts.

### 2. Blog Pages - ✅ UNIQUE
**Blog Index (/blog)**:
- EN: `Digital Marketing Blog - Expert Guides & Strategies | Webtmize`
- FR: `Blog Marketing Digital - Guides & Stratégies Experts | Webtmize`

**Individual Blog Posts (/blog/:id)**:
- Dynamic: `${post.title[language]} - ${post.category[language]} | Webtmize`
- Each post has unique title based on content

### 3. Case Studies - ✅ UNIQUE
**Case Studies Index (/case-studies)**:
- EN: `Marketing Case Studies - Real Client Results | Webtmize`
- FR: `Études de Cas Marketing - Résultats Clients Réels | Webtmize`

**Individual Case Studies (/case-studies/:id)**:
- Dynamic: `${caseStudy.company} Case Study - ${caseStudy.title[language]} | Webtmize`
- Each case study has unique title based on company and content

## Issues Found

### 1. Homepage Title Conflict
The main issue is that both `SEOHead.tsx` and `marketing-agency-website.tsx` are setting titles for the homepage. This creates:
- Redundant title setting
- Potential race condition on which title appears
- SEO confusion about the canonical page title

## Recommendations

### Fix 1: Remove Default Title from SEOHead
Since each page component handles its own SEO, remove the default title setting from SEOHead.tsx.

### Fix 2: Consolidate Homepage Title
Ensure only the homepage component sets the title, not the default SEO component.

### Fix 3: Audit Blog Post Titles
Check blog posts data for any duplicate titles within the blog collection.

## Technical Implementation Notes
- The `useSEO` hook uses `document.title = seoData.title` which overwrites previous titles
- Last component to call useSEO wins the title race
- This can cause inconsistent title display depending on component render order