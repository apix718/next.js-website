import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 h-9 px-3 bg-background/50 hover:bg-background/80 border-input"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language.toUpperCase()}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;