"use client";

import React from 'react';

interface VoiceflowChatProps {
  autoLoad?: boolean;
}

const VoiceflowChat: React.FC<VoiceflowChatProps> = ({ autoLoad = true }) => {
  // Suppress TypeScript unused variable error for preview builds where this prop isn't used
  void autoLoad;

  // Intentionally render nothing to remove the chat widget in all contexts
  return null;
};

export default VoiceflowChat;