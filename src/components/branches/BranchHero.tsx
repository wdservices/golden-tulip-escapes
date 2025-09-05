import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Branch } from "@/types/branch";

interface BranchHeroProps {
  branch: Branch;
}

export const BranchHero = ({ branch }: BranchHeroProps) => {
  return (
    <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={branch.image}
          alt={`${branch.name} Branch`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {branch.fullName}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            {branch.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-6"
            >
              <Link to="/booking">
                <Calendar className="mr-2 h-5 w-5" />
                Book Now
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="text-white border-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Link to={`/branches/${branch.id}#rooms`}>
                View Rooms & Suites
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
