import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description?: string;
  category?: string;
}

interface GalleryProps {
  images?: GalleryImage[];
  title?: string;
  subtitle?: string;
  columns?: number;
}

const defaultImages: GalleryImage[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    title: "Luxury Suite",
    description: "Elegant and spacious suite with premium amenities",
    category: "Rooms"
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
    title: "Fine Dining Restaurant",
    description: "Exquisite culinary experience in an elegant setting",
    category: "Dining"
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    title: "Swimming Pool",
    description: "Relax and unwind in our pristine pool area",
    category: "Facilities"
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
    title: "Spa & Wellness",
    description: "Rejuvenating spa treatments and wellness services",
    category: "Wellness"
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&fit=crop",
    title: "Conference Hall",
    description: "State-of-the-art facilities for business events",
    category: "Events"
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
    title: "Hotel Lobby",
    description: "Grand entrance with sophisticated design",
    category: "Facilities"
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop",
    title: "Garden View",
    description: "Beautifully landscaped gardens and outdoor spaces",
    category: "Exterior"
  },
  {
    id: "8",
    src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    title: "Executive Lounge",
    description: "Exclusive lounge area for our premium guests",
    category: "Facilities"
  }
];

export const Gallery = ({ 
  images = defaultImages, 
  title = "Our Gallery", 
  subtitle = "Explore our beautiful facilities and accommodations",
  columns = 3 
}: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentImageIndex - 1 + images.length) % images.length
      : (currentImageIndex + 1) % images.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const getGridColumns = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <>
      <section id="gallery" className="py-20 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-6 text-golden-yellow drop-shadow-lg">
              {title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className={`grid ${getGridColumns()} gap-6 md:gap-8`}>
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105"
                onClick={() => openLightbox(image, index)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-white/90 line-clamp-2">{image.description}</p>
                  )}
                  {image.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-primary/80 text-xs font-medium rounded-full">
                      {image.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateImage('prev')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateImage('next')}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-white/90">{selectedImage.description}</p>
                )}
                {selectedImage.category && (
                  <span className="inline-block mt-2 px-3 py-1 bg-primary text-xs font-medium rounded-full text-white">
                    {selectedImage.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};