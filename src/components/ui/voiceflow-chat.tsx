"use client";

import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ autoLoad = true }) => {
  useEffect(() => {
    if (!autoLoad) return;

    // Prevent duplicate loading across renders/pages
    const alreadyLoaded = (window as any).__voiceflowLoaded;
    if (alreadyLoaded) {
      return;
    }

    const scriptSrc = "https://cdn.voiceflow.com/widget-next/bundle.mjs";

    const loadChat = () => {
      const vf = (window as any).voiceflow;
      // If the library is ready, load the chat with the config
      if (vf && vf.chat && typeof vf.chat.load === 'function') {
        vf.chat.load({
          verify: { projectID: '6879820015a3d2e835a9a691' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
        (window as any).__voiceflowLoaded = true;
      }
    };

    // If the script already exists but not yet loaded, attach onload
    const existingScript = Array.from(document.querySelectorAll('script')).find(
      (s) => (s as HTMLScriptElement).src === scriptSrc
    ) as HTMLScriptElement | undefined;

    if (existingScript) {
      if ((window as any).voiceflow && (window as any).voiceflow.chat) {
        // Library already present, load immediately
        loadChat();
      } else {
        existingScript.onload = loadChat;
      }
      return;
    }

    // Create and attach the script
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = loadChat;
    document.head.appendChild(script);
  }, [autoLoad]);

  // The widget is loaded globally; no local DOM needed
  return null;
};

export default VoiceflowChat;