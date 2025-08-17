import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
  projectId?: string;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ 
  autoLoad = false, 
  projectId = process.env.NEXT_PUBLIC_VOICEFLOW_PROJECT_ID 
}) => {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Validate project ID
    if (!projectId) {
      console.error('Voiceflow Project ID is missing');
      return;
    }

    // Check if Voiceflow script is already loaded
    if (!document.getElementById('voiceflow-chat-script') && autoLoad) {
      const script = document.createElement('script');
      script.id = 'voiceflow-chat-script';
      script.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
      script.type = 'module';
      script.async = true;
      script.onload = () => {
        try {
          if (window.voiceflow && window.voiceflow.chat) {
            window.voiceflow.chat.load({
              verify: { 
                projectID: projectId 
              },
              url: 'https://general-runtime.voiceflow.com',
              versionID: 'production',
              autoOpen: false,
              lazyLoad: false,
            });
          } else {
            console.error('Voiceflow chat script not loaded correctly');
          }
        } catch (error) {
          console.error('Error loading Voiceflow chat:', error);
        }
      };

      script.onerror = () => {
        console.error('Failed to load Voiceflow chat script');
      };

      document.body.appendChild(script);
    }
  }, [autoLoad, projectId]);

  return null; // This component doesn't render anything
};

export default VoiceflowChat;