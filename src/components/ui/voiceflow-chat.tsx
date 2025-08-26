"use client";

import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ autoLoad = true }) => {
  useEffect(() => {
    // Only run on client-side and if autoLoad is true
    if (typeof window === 'undefined' || !autoLoad) return;

    // Skip loading in iframe previews (dyad preview runs inside iframes)
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInIframe) return;

    // Prevent multiple initializations across components in the same page (preview safety)
    const w = window as any;
    if (w.VOICEFLOW_LOADED) return;

    // If the Voiceflow global already exists, mark as loaded and return
    if (w.voiceflow && w.voiceflow.chat) {
      w.VOICEFLOW_LOADED = true;
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
      w.VOICEFLOW_LOADED = true;
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
          w.VOICEFLOW_LOADED = true;
        }
      };

      // Append the script to the head
      document.head.appendChild(script);
    };

    // Load the Voiceflow chat script
    loadVoiceflowChat();

    // Cleanup function
    return () => {
      // Graceful cleanup: try to close/destroy chat widget if API exposes it
      try {
        if (window.voiceflow && window.voiceflow.chat) {
          const chatApi = (window as any).voiceflow.chat;
          if (typeof chatApi.close === 'function') chatApi.close();
          if (typeof chatApi.destroy === 'function') chatApi.destroy();
        }
        // Do not remove the script tag to keep preview stable
        const chatWidget = document.querySelector('[data-voiceflow-chat]') || 
                           document.querySelector('.vfrc-chat') ||
                           document.querySelector('#voiceflow-chat');
        if (chatWidget && chatWidget.parentElement) {
          (chatWidget.parentElement as HTMLElement).style.display = 'none';
        }
      } catch (error) {
        console.warn('Error cleaning up Voiceflow chat:', error);
      }
      // Reset the flag for safety on unmount
      w.VOICEFLOW_LOADED = false;
    };
  }, [autoLoad]);

  return null; // This component doesn't render anything
};

export default VoiceflowChat;