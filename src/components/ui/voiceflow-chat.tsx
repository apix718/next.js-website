import React, { useEffect } from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ autoLoad = true }) => {
  useEffect(() => {
    // Only run on client-side and if autoLoad is true
    if (typeof window === 'undefined' || !autoLoad) return;

    // Use the specific project ID provided
    const voiceflowProjectId = '6879820015a3d2e835a9a691';

    if (!voiceflowProjectId) {
      console.error('Voiceflow Project ID is not set.');
      return;
    }

    // Function to load Voiceflow chat script
    const loadVoiceflowChat = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(d, t) {
            var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
            v.onload = function() {
              window.voiceflow.chat.load({
                verify: { projectID: '${voiceflowProjectId}' },
                url: 'https://general-runtime.voiceflow.com',
                versionID: 'production',
                voice: {
                  url: "https://runtime-api.voiceflow.com"
                }
              });
            }
            v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; 
            v.type = "text/javascript"; 
            s.parentNode.insertBefore(v, s);
        })(document, 'script');
      `;

      // Append the script to the body
      document.body.appendChild(script);
    };

    // Load the Voiceflow chat script
    loadVoiceflowChat();

    // Cleanup function
    return () => {
      // Remove any existing Voiceflow chat scripts if needed
      const existingScripts = document.querySelectorAll('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
      existingScripts.forEach(script => script.remove());
    };
  }, [autoLoad]);

  return null; // This component doesn't render anything
};

export default VoiceflowChat;