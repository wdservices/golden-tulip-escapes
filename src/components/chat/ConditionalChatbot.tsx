import { useLocation } from 'react-router-dom';
import { ChatbotFloatingButton } from './ChatbotFloatingButton';

export const ConditionalChatbot = () => {
  const location = useLocation();
  
  // Hide chatbot on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Don't render chatbot on admin pages
  if (isAdminRoute) {
    return null;
  }
  
  return <ChatbotFloatingButton />;
};

export default ConditionalChatbot;