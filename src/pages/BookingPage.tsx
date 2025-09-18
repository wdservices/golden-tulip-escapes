import { useSearchParams } from "react-router-dom";
import { NewBookingForm } from "@/components/NewBookingForm";
import { Footer } from "@/components/Footer";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const selectedBranch = searchParams.get('branch') || undefined;

  return (
    <div className="min-h-screen bg-background">
      <NewBookingForm 
        selectedBranch={selectedBranch}
        showLocationDropdown={true}
        onBookingSuccess={() => {
          // Optional: Add any additional success handling here
          console.log('Booking completed successfully');
        }}
      />
      <Footer />
    </div>
  );
};

export default BookingPage;
