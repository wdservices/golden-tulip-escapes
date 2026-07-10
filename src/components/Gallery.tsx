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
  { id: "1", src: "/images/gallery/rooms/img1.jpg", title: "Room Image 1", category: "Rooms" },
  { id: "2", src: "/images/gallery/rooms/img2.jpg", title: "Room Image 2", category: "Rooms" },
  { id: "3", src: "/images/gallery/rooms/img3.jpg", title: "Room Image 3", category: "Rooms" },
  { id: "4", src: "/images/gallery/rooms/img4.jpg", title: "Room Image 4", category: "Rooms" },
  { id: "5", src: "/images/gallery/rooms/img5.jpg", title: "Room Image 5", category: "Rooms" },
  { id: "6", src: "/images/gallery/rooms/img6.jpg", title: "Room Image 6", category: "Rooms" },
  { id: "7", src: "/images/gallery/rooms/img7.jpg", title: "Room Image 7", category: "Rooms" },
  { id: "8", src: "/images/gallery/rooms/img8.jpg", title: "Room Image 8", category: "Rooms" },
  { id: "9", src: "/images/gallery/rooms/img9.jpg", title: "Room Image 9", category: "Rooms" },
  { id: "10", src: "/images/gallery/rooms/img10.jpg", title: "Room Image 10", category: "Rooms" },
  { id: "11", src: "/images/gallery/rooms/img11.jpg", title: "Room Image 11", category: "Rooms" },
  { id: "12", src: "/images/gallery/rooms/img12.jpg", title: "Room Image 12", category: "Rooms" },
  { id: "13", src: "/images/gallery/rooms/img13.jpg", title: "Room Image 13", category: "Rooms" },
  { id: "14", src: "/images/gallery/rooms/img14.jpg", title: "Room Image 14", category: "Rooms" },
  { id: "15", src: "/images/gallery/rooms/img15.jpg", title: "Room Image 15", category: "Rooms" },
  { id: "16", src: "/images/gallery/rooms/img16.jpg", title: "Room Image 16", category: "Rooms" },
  { id: "17", src: "/images/gallery/rooms/img17.jpg", title: "Room Image 17", category: "Rooms" },
  { id: "18", src: "/images/gallery/rooms/img18.jpg", title: "Room Image 18", category: "Rooms" },
  { id: "19", src: "/images/gallery/rooms/img19.jpg", title: "Room Image 19", category: "Rooms" },
  { id: "20", src: "/images/gallery/catering/61940181_XXL.jpg", title: "Catering Image 1", category: "Catering" },
  { id: "21", src: "/images/gallery/catering/61940891_XXL.jpg", title: "Catering Image 2", category: "Catering" },
  { id: "22", src: "/images/gallery/meetings/73066312_XXL.jpg", title: "Meeting Hall 1", category: "Meetings" },
  { id: "23", src: "/images/gallery/wellness/spar2.jpg", title: "Wellness Spa", category: "Wellness" },
  { id: "24", src: "/images/gallery/facility/6429175_XXL.jpg", title: "Facility Image 1", category: "Facilities" },
  { id: "25", src: "/images/gallery/others/1764979633.jpg", title: "Lobby Reception", category: "Others" },
  { id: "26", src: "/images/gallery/others/61940047_xxl.jpg", title: "Hotel Exterior", category: "Others" },
  { id: "27", src: "/images/gallery/others/6429153_xxl.jpg", title: "Hotel Lounge", category: "Others" },
  { id: "28", src: "/images/gallery/others/73067760_xxl.jpg", title: "Hotel Interior", category: "Others" },
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
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/gallery/others/img7.jpeg'; }}
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
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/gallery/others/img7.jpeg'; }}
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