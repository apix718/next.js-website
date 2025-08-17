import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  projectId?: string;
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ 
  projectId = '6879820015a3d2e835a9a691',
  autoLoad = true 
}) => {
  useEffect(() => {
    if (!autoLoad) return;

    // Load Voiceflow script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
    script.type = 'text/javascript';
    script.async = true;
    
    script.onload = () => {
      if (window.voiceflow && window.voiceflow.chat) {
        window.voiceflow.chat.load({
          verify: { projectID: projectId },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
      }
    };

    // Only load if not already loaded
    if (!document.querySelector('script[src*="voiceflow"]')) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector('script[src*="voiceflow"]');
      if (existingScript) {
        // Don't remove as it might be used elsewhere, but we could add cleanup logic here
      }
    };
  }, [projectId, autoLoad]);

  return null; // This component doesn't render anything visible
};

export default VoiceflowChat;