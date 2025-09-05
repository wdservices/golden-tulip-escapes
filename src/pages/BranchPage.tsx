import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBranchById } from "@/services/branchService";
import { BranchHero } from "@/components/branches/BranchHero";
import { BranchAmenities } from "@/components/branches/BranchAmenities";
import { BranchRooms } from "@/components/branches/BranchRooms";
import { BranchContact } from "@/components/branches/BranchContact";
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

    // Redirect to home if trying to access the main (GRA) branch page
    if (branchId === 'main') {
      navigate('/', { replace: true });
      return;
    }

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
    <div className="bg-white">
      <BranchHero branch={branch} />
      
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Welcome to {branch.fullName}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {branch.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <a href="#rooms">View Rooms & Rates</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#amenities">Explore Amenities</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BranchRooms branch={branch} />
      <BranchAmenities amenities={branch.amenities || []} />
      <BranchContact branch={branch} />
    </div>
  );
};

export default BranchPage;
