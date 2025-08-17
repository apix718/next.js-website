import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ autoLoad = true }) => {
  useEffect(() => {
    // Only run on client-side and if autoLoad is true
    if (typeof window === 'undefined' || !autoLoad) return;

    // Check if Voiceflow is already loaded
    if (window.voiceflow) {
      return;
    }

    const voiceflowProjectId = '6879820015a3d2e835a9a691';

    if (!voiceflowProjectId) {
      console.error('Voiceflow Project ID is not set.');
      return;
    }

    // Check if script is already being loaded or exists
    const existingScript = document.querySelector('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
    if (existingScript) {
      return;
    }

    // Function to load Voiceflow chat script
    const loadVoiceflowChat = () => {
      const script = document.createElement('script');
      script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
      script.type = "text/javascript";
      script.async = true;
      
      script.onload = function() {
        if (window.voiceflow && window.voiceflow.chat) {
          window.voiceflow.chat.load({
            verify: { projectID: voiceflowProjectId },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production',
            voice: {
              url: "https://runtime-api.voiceflow.com"
            }
          });
        }
      };

      // Append the script to the head instead of body
      document.head.appendChild(script);
    };

    // Load the Voiceflow chat script
    loadVoiceflowChat();

    // Cleanup function
    return () => {
      // Remove Voiceflow chat widget if it exists
      if (window.voiceflow && window.voiceflow.chat) {
        try {
          // Try to close/destroy the chat widget
          const chatWidget = document.querySelector('[data-voiceflow-chat]') || 
                           document.querySelector('.vfrc-chat') ||
                           document.querySelector('#voiceflow-chat');
          if (chatWidget) {
            chatWidget.remove();
          }
        } catch (error) {
          console.warn('Error cleaning up Voiceflow chat:', error);
        }
      }

      // Remove the script
      const scripts = document.querySelectorAll('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
      scripts.forEach(script => script.remove());
      
      // Clear the voiceflow object
      if (window.voiceflow) {
        (window as any).voiceflow = undefined;
      }
    };
  }, [autoLoad]);

  return null; // This component doesn't render anything
};

export default VoiceflowChat;