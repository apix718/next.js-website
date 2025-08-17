import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ autoLoad = false }) => {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Check if Voiceflow script is already loaded
    if (!document.getElementById('voiceflow-chat-script') && autoLoad) {
      const script = document.createElement('script');
      script.id = 'voiceflow-chat-script';
      script.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
      script.type = 'module';
      script.async = true;
      script.onload = () => {
        if (window.voiceflow && window.voiceflow.chat) {
          window.voiceflow.chat.load({
            verify: { projectID: 'YOUR_PROJECT_ID' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production',
            autoOpen: false,
            lazyLoad: false,
          });
        }
      };
      document.body.appendChild(script);
    }
  }, [autoLoad]);

  return null; // This component doesn't render anything
};

export default VoiceflowChat;