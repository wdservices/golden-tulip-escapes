import { Branch } from "@/types/branch";
import { Info, CreditCard } from "lucide-react";

interface BranchPoliciesProps {
  policies?: Branch["policies"];
  paymentMethods?: Branch["paymentMethods"];
  operatingHours?: Branch["operatingHours"];
}

export const BranchPolicies = ({ policies, paymentMethods, operatingHours }: BranchPoliciesProps) => {
  if ((!policies || policies.length === 0) && (!paymentMethods || paymentMethods.length === 0) && !operatingHours) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50" id="policies">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hotel Information
          </h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {operatingHours && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 text-amber-700 mr-2" />
                Operating Hours
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="text-gray-900 font-medium">{operatingHours.checkIn}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="text-gray-900 font-medium">{operatingHours.checkOut}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Front Desk:</span>
                  <span className="text-gray-900 font-medium">{operatingHours.frontDesk}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Restaurant:</span>
                  <span className="text-gray-900 font-medium">{operatingHours.restaurant}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Bar:</span>
                  <span className="text-gray-900 font-medium">{operatingHours.bar}</span>
                </li>
              </ul>
            </div>
          )}

          {paymentMethods && paymentMethods.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 text-amber-700 mr-2" />
                Payment Methods
              </h3>
              <ul className="space-y-2">
                {paymentMethods.map((method, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {policies && policies.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Hotel Policies
              </h3>
              <ul className="space-y-2">
                {policies.map((policy, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    {policy}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};