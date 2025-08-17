import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import VoiceflowChat from '@/components/ui/voiceflow-chat';
import '@/index.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth</title>
        <meta name="description" content="Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://webtimize.ca" />
      </Head>
      <ThemeProvider defaultTheme="light" storageKey="webtmize-theme">
        <LanguageProvider>
          <Component {...pageProps} />
          <VoiceflowChat />
        </LanguageProvider>
      </ThemeProvider>
    </>
  );
}