import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBranchById } from "@/services/branchService";
import { BranchHero } from "@/components/branches/BranchHero";
import { BranchAmenities } from "@/components/branches/BranchAmenities";
import { BranchContact } from "@/components/branches/BranchContact";
import { BranchRooms } from "@/components/branches/BranchRooms";
import { BranchDining } from "@/components/branches/BranchDining";
import { BranchEvents } from "@/components/branches/BranchEvents";
import { BranchPolicies } from "@/components/branches/BranchPolicies";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Branch } from "@/types/branch";

export const BranchPage = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) {
      setError("No branch ID provided");
      setIsLoading(false);
      return;
    }

    // No need to redirect any branch pages now

    // Simulate API call
    const fetchBranch = async () => {
      try {
        const branchData = getBranchById(branchId);
        if (!branchData) {
          setError("Branch not found");
          navigate("/not-found", { replace: true });
          return;
        }
        setBranch(branchData);
      } catch (err) {
        console.error("Error fetching branch:", err);
        setError("Failed to load branch information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranch();
  }, [branchId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Branch</h1>
        <p className="text-gray-600 mb-6">{error || "The requested branch could not be found."}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BranchHero branch={branch} />
      
      <div className="py-20 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
              Welcome to {branch.fullName}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              {branch.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild className="text-lg px-6 py-5">
                <a href="#amenities">Explore Amenities</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BranchRooms roomTypes={branch.roomTypes} />
      <BranchDining diningOptions={branch.diningOptions} />
      <BranchAmenities amenities={branch.amenities || []} />
      <BranchEvents events={branch.events} />
      <BranchPolicies 
        policies={branch.policies} 
        paymentMethods={branch.paymentMethods} 
        operatingHours={branch.operatingHours} 
      />
      <BranchContact branch={branch} />
    </div>
  );
};

export default BranchPage;
