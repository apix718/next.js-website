/// <reference types="vite/client" />

declare global {
  interface Window {
    voiceflow: {
      chat: {
        open(): void;
        load(config: any): void;
      };
    };
  }
}

export {};