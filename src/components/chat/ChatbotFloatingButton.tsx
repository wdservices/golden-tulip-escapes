import React, { useEffect, useState } from 'react';

export const ChatbotFloatingButton = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.1 : 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <a
      href="https://wa.me/2348031234567?text=Hello,%20I%27d%20like%20to%20make%20a%20reservation%20at%20Golden%20Tulip%20Hotel."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 shadow-lg"
      title="Chat on WhatsApp"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 1s ease-in-out',
      }}
    >
      <img
        src="/whatsapp.png"
        alt="WhatsApp"
        className="h-14 w-auto"
      />
    </a>
  );
};

export default ChatbotFloatingButton;
