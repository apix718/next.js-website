import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import VoiceflowChat from '@/components/ui/voiceflow-chat';
import '@/index.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="webtmize-theme">
      <LanguageProvider>
        <Component {...pageProps} />
        <VoiceflowChat />
      </LanguageProvider>
    </ThemeProvider>
  );
}