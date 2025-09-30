import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ChatbotFloatingButton = () => {
  const [isBreathing, setIsBreathing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleClick = async () => {
    setIsLoading(true);
    setIsBreathing(false);
    
    try {
      // First, try to find the chatbot element
      let chatbotElement = document.querySelector('zapier-interfaces-chatbot-embed[is-popup="true"]') as any;
      
      if (!chatbotElement) {
        console.log('Chatbot element not found, waiting for it to load...');
        // Wait a bit for the element to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        chatbotElement = document.querySelector('zapier-interfaces-chatbot-embed[is-popup="true"]') as any;
      }
      
      if (chatbotElement) {
        console.log('Chatbot element found, attempting to trigger...');
        
        // Make sure the element is visible
        chatbotElement.style.display = 'block';
        
        // Try multiple methods to trigger the chatbot
        if (typeof chatbotElement.open === 'function') {
          console.log('Using open() method');
          chatbotElement.open();
        } else if (typeof chatbotElement.show === 'function') {
          console.log('Using show() method');
          chatbotElement.show();
        } else if (typeof chatbotElement.trigger === 'function') {
          console.log('Using trigger() method');
          chatbotElement.trigger();
        } else {
          console.log('Using click event simulation');
          // Simulate a click event
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          chatbotElement.dispatchEvent(clickEvent);
        }
      } else {
         console.error('Zapier chatbot element not found in DOM');
         // Fallback: try to trigger using the global function
         if ((window as any).triggerZapierChatbot) {
           (window as any).triggerZapierChatbot();
         } else {
           // Show fallback modal if Zapier chatbot is not available
           console.log('Showing fallback chat modal');
           setShowFallbackModal(true);
         }
       }
    } catch (error) {
      console.error('Error triggering chatbot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // For now, just show a simple response
      alert(`Thank you for your message: "${message}". We'll get back to you soon! For immediate assistance, please call us at +234 803 123 4567 or email hello@goldentulip.com`);
      setMessage('');
      setShowFallbackModal(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <button
          id="chatbot-button"
          onClick={handleClick}
          disabled={isLoading}
          className={`h-14 w-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-all duration-1000 ease-in-out flex items-center justify-center ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          style={{
            boxShadow: '0 0 5px rgba(180, 83, 9, 0.4)',
            transition: 'transform 1s ease-in-out, box-shadow 1s ease-in-out'
          }}
          title="Chat with us"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Fallback Chat Modal */}
      {showFallbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Chat with Golden Tulip
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFallbackModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  👋 Hello! Welcome to Golden Tulip Hotels. How can we assist you today?
                </p>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                For immediate assistance: +234 803 123 4567
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatbotFloatingButton;
