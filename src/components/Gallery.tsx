import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  id: string;
  src: string;
  title: string;
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
    src: "/images/gallery/img (1).jpg",
    title: "Hotel Image 1",
    category: "Gallery"
  },
  {
    id: "2",
    src: "/images/gallery/img (2).jpg",
    title: "Hotel Image 2",
    category: "Gallery"
  },
  {
    id: "3",
    src: "/images/gallery/img (3).jpg",
    title: "Hotel Image 3",
    category: "Gallery"
  },
  {
    id: "4",
    src: "/images/gallery/img (4).jpg",
    title: "Hotel Image 4",
    category: "Gallery"
  },
  {
    id: "5",
    src: "/images/gallery/img (5).jpg",
    title: "Hotel Image 5",
    category: "Gallery"
  },
  {
    id: "6",
    src: "/images/gallery/img (6).jpg",
    title: "Hotel Image 6",
    category: "Gallery"
  },
  {
    id: "7",
    src: "/images/gallery/img (7).jpg",
    title: "Hotel Image 7",
    category: "Gallery"
  },
  {
    id: "8",
    src: "/images/gallery/img (8).jpg",
    title: "Hotel Image 8",
    category: "Gallery"
  },
  {
    id: "9",
    src: "/images/gallery/img (9).jpg",
    title: "Hotel Image 9",
    category: "Gallery"
  },
  {
    id: "10",
    src: "/images/gallery/img (10).jpg",
    title: "Hotel Image 10",
    category: "Gallery"
  },
  {
    id: "11",
    src: "/images/gallery/img (11).jpg",
    title: "Hotel Image 11",
    category: "Gallery"
  },
  {
    id: "12",
    src: "/images/gallery/img (12).jpg",
    title: "Hotel Image 12",
    category: "Gallery"
  },
  {
    id: "13",
    src: "/images/gallery/img (13).jpg",
    title: "Hotel Image 13",
    category: "Gallery"
  },
  {
    id: "14",
    src: "/images/gallery/img (14).jpg",
    title: "Hotel Image 14",
    category: "Gallery"
  },
  {
    id: "15",
    src: "/images/gallery/img (15).jpg",
    title: "Hotel Image 15",
    category: "Gallery"
  },
  {
    id: "16",
    src: "/images/gallery/img (16).jpg",
    title: "Hotel Image 16",
    category: "Gallery"
  },
  {
    id: "17",
    src: "/images/gallery/img (17).jpg",
    title: "Hotel Image 17",
    category: "Gallery"
  },
  {
    id: "18",
    src: "/images/gallery/img (18).jpg",
    title: "Hotel Image 18",
    category: "Gallery"
  },
  {
    id: "19",
    src: "/images/gallery/img (19).jpg",
    title: "Hotel Image 19",
    category: "Gallery"
  },
  {
    id: "20",
    src: "/images/gallery/img (20).jpg",
    title: "Hotel Image 20",
    category: "Gallery"
  },
  {
    id: "21",
    src: "/images/gallery/img (21).jpg",
    title: "Hotel Image 21",
    category: "Gallery"
  },
  {
    id: "22",
    src: "/images/gallery/img (22).jpg",
    title: "Hotel Image 22",
    category: "Gallery"
  },
  {
    id: "23",
    src: "/images/gallery/spar2.jpg",
    title: "Hotel Image 23",
    category: "Gallery"
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
  const [showAllImages, setShowAllImages] = useState(false);
  const [visibleImages, setVisibleImages] = useState(6);
  const [displayedImages, setDisplayedImages] = useState(images.slice(0, visibleImages));

  // Auto-rotate images every 20 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setDisplayedImages(prevImages => {
        if (prevImages.length <= 1) return prevImages;
        
        // Move the last image to the front (bottom to top rotation)
        const newImages = [...prevImages];
        const lastImage = newImages.pop()!;
        newImages.unshift(lastImage);
        
        return newImages;
      });
    }, 20000); // 20 seconds

    return () => clearInterval(rotationInterval);
  }, []);

  // Update displayed images when visibleImages changes
  useEffect(() => {
    setDisplayedImages(images.slice(0, visibleImages));
  }, [visibleImages, images]);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const handleViewMore = () => {
    setShowAllImages(true);
    setVisibleImages(images.length);
  };

  const handleViewLess = () => {
    setShowAllImages(false);
    setVisibleImages(6);
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
            {displayedImages.map((image, index) => (
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
                  <h3 className="text-xl font-semibold">{image.title}</h3>
                  {image.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-primary/80 text-xs font-medium rounded-full">
                      {image.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View More / View Less Button */}
          {images.length > 6 && (
            <div className="text-center mt-12">
              <Button
                onClick={showAllImages ? handleViewLess : handleViewMore}
                variant="outline"
                className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] border-yellow-400 hover:bg-yellow-300 hover:border-yellow-300 px-8 py-3 text-lg font-semibold"
              >
                {showAllImages ? "View Less" : "View More"}
              </Button>
            </div>
          )}
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
                <h3 className="text-2xl font-bold text-white">{selectedImage.title}</h3>
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