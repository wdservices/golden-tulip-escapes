import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export const ChatbotFloatingButton = () => {
  const [isBreathing, setIsBreathing] = useState(true);

  // Breathing animation effect
  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      const button = document.getElementById('chatbot-button');
      if (button) {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 0 20px rgba(180, 83, 9, 0.6)';
        
        setTimeout(() => {
          button.style.transform = 'scale(1)';
          button.style.boxShadow = '0 0 5px rgba(180, 83, 9, 0.4)';
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const handleClick = () => {
    // Trigger the Zapier popup using the global function
    if ((window as any).triggerZapierChatbot) {
      (window as any).triggerZapierChatbot();
      setIsBreathing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <button
          id="chatbot-button"
          onClick={handleClick}
          className="h-14 w-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-all duration-1000 ease-in-out flex items-center justify-center"
          style={{
            boxShadow: '0 0 5px rgba(180, 83, 9, 0.4)',
            transition: 'transform 1s ease-in-out, box-shadow 1s ease-in-out'
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default ChatbotFloatingButton;
