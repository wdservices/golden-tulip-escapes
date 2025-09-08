import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewBookingForm } from "@/components/NewBookingForm";
import { useAuth } from "@/contexts/AuthContext";

export const BookPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const handleBookingSuccess = () => {
    // Redirect to dashboard after successful booking
    navigate('/dashboard');
  };

  const handleBack = () => {
    // If user came from a specific page, go back, otherwise go to home
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="inline-flex items-center text-amber-800 hover:bg-amber-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {location.key !== 'default' ? 'Go Back' : 'Back to Home'}
          </Button>
          <h1 className="text-3xl font-bold text-amber-800 mb-2">Book Your Stay</h1>
          <p className="text-gray-600">Fill in the details below to reserve your room</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <NewBookingForm onBookingSuccess={handleBookingSuccess} />
        </div>
      </div>
    </div>
  );
};

export default BookPage;
