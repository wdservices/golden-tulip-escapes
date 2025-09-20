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
    <section className="py-20 bg-muted/10" id="policies">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hotel Information
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Important details about our policies and services
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {operatingHours && (
            <div className="bg-card rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-medium mb-6 flex items-center">
                <Info className="h-5 w-5 text-primary mr-3" />
                Operating Hours
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center group transition-colors">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="text-foreground font-medium">{operatingHours.checkIn}</span>
                </li>
                <li className="flex justify-between items-center group">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="text-foreground font-medium">{operatingHours.checkOut}</span>
                </li>
                <li className="flex justify-between items-center group">
                  <span className="text-muted-foreground">Front Desk:</span>
                  <span className="text-foreground font-medium">{operatingHours.frontDesk}</span>
                </li>
                <li className="flex justify-between items-center group">
                  <span className="text-muted-foreground">Restaurant:</span>
                  <span className="text-foreground font-medium">{operatingHours.restaurant}</span>
                </li>
                <li className="flex justify-between items-center group">
                  <span className="text-muted-foreground">Bar:</span>
                  <span className="text-foreground font-medium">{operatingHours.bar}</span>
                </li>
              </ul>
            </div>
          )}

          {paymentMethods && paymentMethods.length > 0 && (
            <div className="bg-card rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-medium mb-6 flex items-center">
                <CreditCard className="h-5 w-5 text-primary mr-3" />
                Payment Methods
              </h3>
              <ul className="space-y-3">
                {paymentMethods.map((method, index) => (
                  <li key={index} className="text-muted-foreground flex items-start group transition-colors">
                    <span className="text-primary mr-2">•</span>
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {policies && policies.length > 0 && (
            <div className="bg-card rounded-xl shadow-lg p-8 md:col-span-2">
              <h3 className="text-xl font-medium mb-6">
                Hotel Policies
              </h3>
              <ul className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {policies.map((policy, index) => (
                  <li key={index} className="text-muted-foreground flex items-start group transition-colors">
                    <span className="text-primary mr-2">•</span>
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