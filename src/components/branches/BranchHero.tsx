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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-gradient-gold">
            {branch.fullName}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl leading-relaxed">
            {branch.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-10 py-7 rounded-xl font-medium shadow-glow-sm hover:shadow-glow transition-all duration-300"
            >
              <Link to="/booking">
                <Calendar className="mr-3 h-5 w-5" />
                Book Now
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="text-white border-white hover:bg-white/10 text-lg px-10 py-7 rounded-xl font-medium hover:shadow-glow-sm transition-all duration-300"
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
