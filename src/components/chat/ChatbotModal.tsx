import React from 'react';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  // For Zapier popup, we render it when triggered
  if (!isOpen) return null;

  return (
    <zapier-interfaces-chatbot-embed 
      is-popup='true' 
      chatbot-id='cmfxud1f70034pj83m904ssvf'
    />
  );
};

export default ChatbotModal;