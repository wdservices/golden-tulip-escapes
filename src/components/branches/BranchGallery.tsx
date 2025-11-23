import { Gallery } from "@/components/Gallery";
import { Branch } from "@/types/branch";

interface BranchGalleryProps {
  branch: Branch;
}

export const BranchGallery = ({ branch }: BranchGalleryProps) => {
  // Generate gallery images based on branch data
  const generateBranchGallery = () => {
    const baseImages = [
      {
        id: `${branch.id}-exterior`,
        src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        title: `${branch.name} Exterior`,
        description: `Beautiful exterior view of ${branch.fullName}`,
        category: "Exterior"
      },
      {
        id: `${branch.id}-lobby`,
        src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
        title: `${branch.name} Lobby`,
        description: `Elegant lobby area at ${branch.fullName}`,
        category: "Facilities"
      },
      {
        id: `${branch.id}-room`,
        src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
        title: `Luxury Room at ${branch.name}`,
        description: `Premium accommodation at ${branch.fullName}`,
        category: "Rooms"
      }
    ];

    // Add dining images if branch has dining options
    const diningImages = branch.diningOptions?.slice(0, 2).map((dining, index) => ({
      id: `${branch.id}-dining-${index}`,
      src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
      title: dining.name,
      description: dining.description || `Fine dining experience at ${branch.fullName}`,
      category: "Dining"
    })) || [];

    // Add spa images if branch has spa services
    const spaImages = branch.spaServices?.slice(0, 2).map((spa, index) => ({
      id: `${branch.id}-spa-${index}`,
      src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
      title: spa.name,
      description: spa.description || `Relaxing spa services at ${branch.fullName}`,
      category: "Wellness"
    })) || [];

    // Add event images if branch has events
    const eventImages = branch.events?.slice(0, 2).map((event, index) => ({
      id: `${branch.id}-event-${index}`,
      src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
      title: event.name,
      description: event.description || `Event facilities at ${branch.fullName}`,
      category: "Events"
    })) || [];

    // Add amenities images
    const amenityImages = branch.amenities?.slice(0, 3).map((amenity, index) => ({
      id: `${branch.id}-amenity-${index}`,
      src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
      title: amenity,
      description: `Premium amenity available at ${branch.fullName}`,
      category: "Amenities"
    })) || [];

    return [
      ...baseImages,
      ...diningImages,
      ...spaImages,
      ...eventImages,
      ...amenityImages
    ];
  };

  const branchGalleryImages = generateBranchGallery();

  return (
    <Gallery 
      images={branchGalleryImages}
      title={`${branch.fullName} Gallery`}
      subtitle={`Discover the beauty and elegance of ${branch.fullName}`}
      columns={3}
    />
  );
};