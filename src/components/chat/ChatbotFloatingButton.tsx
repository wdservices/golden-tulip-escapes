import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ChatbotFloatingButton = () => {
  const [isBreathing, setIsBreathing] = useState(true);

  // Breathing animation effect
  useEffect(() => {
    if (isBreathing) {
      const interval = setInterval(() => {
        const element = document.getElementById('chatbot-button');
        if (element) {
          element.style.transform = 'scale(1.1)';
          element.style.boxShadow = '0 0 15px rgba(180, 83, 9, 0.7)';
          
          setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = '0 0 5px rgba(180, 83, 9, 0.4)';
          }, 1000);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isBreathing]);

  const handleClick = () => {
    setIsBreathing(false);
    // Add your chat opening logic here
    console.log('Chat opened');
    // For now, we'll just toggle the breathing effect
    setTimeout(() => setIsBreathing(true), 100);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        id="chatbot-button"
        onClick={handleClick}
        className="h-14 w-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-all duration-1000 ease-in-out"
        style={{
          boxShadow: '0 0 5px rgba(180, 83, 9, 0.4)',
          transition: 'transform 1s ease-in-out, box-shadow 1s ease-in-out'
        }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ChatbotFloatingButton;
