import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Branch } from "@/types/branch";

interface BranchContactProps {
  branch: Branch;
}

export const BranchContact = ({ branch }: BranchContactProps) => {
  return (
    <section className="py-16 bg-white" id="contact">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600">
              We're here to assist you with any questions about your stay
            </p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-amber-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <MapPin className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">{branch.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <Phone className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                  <a 
                    href={`tel:${branch.phone?.replace(/\D/g, '')}`} 
                    className="text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    {branch.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <Mail className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                  <a 
                    href={`mailto:${branch.email}`} 
                    className="text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-amber-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <Clock className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Check-in / Check-out</h3>
                  <p className="text-gray-600">
                    Check-in: {branch.checkInTime || '2:00 PM'}<br />
                    Check-out: {branch.checkOutTime || '12:00 PM'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-gray-600 mb-6">
                Have questions about your stay or special requests? Our team is here to help.
              </p>
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <a href={`mailto:${branch.email}?subject=Inquiry about ${branch.name} Branch`}>
                  Send Us a Message
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
