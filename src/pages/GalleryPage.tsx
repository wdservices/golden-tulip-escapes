import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { key: "Wellness", thumb: "/images/gallery/wellness/spar2.jpg" },
  { key: "Rooms", thumb: "/images/gallery/rooms/img2.jpg" },
  { key: "Catering", thumb: "/images/gallery/catering/61940181_XXL.jpg" },
  { key: "Meetings", thumb: "/images/gallery/meetings/73066312_XXL.jpg" },
  { key: "Facilities", thumb: "/images/gallery/facility/6429175_XXL.jpg" },
  { key: "Other pictures", thumb: "/images/gallery/others/img7.jpeg" },
];

const allImages: Record<string, string[]> = {
  Wellness: [
    "/images/gallery/wellness/spar2.jpg",
  ],
  Rooms: [
    "/images/gallery/rooms/img1.jpg",
    "/images/gallery/rooms/img2.jpg",
    "/images/gallery/rooms/img3.jpg",
    "/images/gallery/rooms/img4.jpg",
    "/images/gallery/rooms/img5.jpg",
    "/images/gallery/rooms/img6.jpg",
    "/images/gallery/rooms/img7.jpg",
    "/images/gallery/rooms/img8.jpg",
    "/images/gallery/rooms/img9.jpg",
    "/images/gallery/rooms/img10.jpg",
    "/images/gallery/rooms/img11.jpg",
    "/images/gallery/rooms/img12.jpg",
    "/images/gallery/rooms/img13.jpg",
    "/images/gallery/rooms/img14.jpg",
    "/images/gallery/rooms/img15.jpg",
    "/images/gallery/rooms/img16.jpg",
    "/images/gallery/rooms/img17.jpg",
    "/images/gallery/rooms/img18.jpg",
    "/images/gallery/rooms/img19.jpg",
  ],
  Catering: [
    "/images/gallery/catering/61940181_XXL.jpg",
    "/images/gallery/catering/61940891_XXL.jpg",
    "/images/gallery/catering/61941477_XXL.jpg",
    "/images/gallery/catering/6429151_XXL.jpg",
    "/images/gallery/catering/6429155_XXL.jpg",
    "/images/gallery/catering/6429161_XXL.jpg",
    "/images/gallery/catering/6429179_XXL.jpg",
    "/images/gallery/catering/73067586_XXL.jpg",
    "/images/gallery/catering/73067764_XXL.jpg",
    "/images/gallery/catering/73088759_XXL.jpg",
    "/images/gallery/catering/73171504_XXL.jpg",
    "/images/gallery/catering/73171526_XXL.jpg",
    "/images/gallery/catering/73171552_XXL.jpg",
    "/images/gallery/catering/73171558_XXL.jpg",
    "/images/gallery/catering/83649324_XXL.jpg",
    "/images/gallery/catering/83649328_XXL.jpg",
    "/images/gallery/catering/83649330_XXL.jpg",
    "/images/gallery/catering/83649350_XXL.jpg",
  ],
  Meetings: [
    "/images/gallery/meetings/73066312_XXL.jpg",
    "/images/gallery/meetings/73066320_XXL.jpg",
    "/images/gallery/meetings/73066322_XXL.jpg",
    "/images/gallery/meetings/73066326_XXL.jpg",
    "/images/gallery/meetings/73066328_XXL.jpg",
    "/images/gallery/meetings/73066336_XXL.jpg",
    "/images/gallery/meetings/73066338_XXL.jpg",
    "/images/gallery/meetings/73066348_XXL.jpg",
    "/images/gallery/meetings/73066366_XXL.jpg",
    "/images/gallery/meetings/73066372_XXL.jpg",
    "/images/gallery/meetings/73066384_XXL.jpg",
    "/images/gallery/meetings/73066394_XXL.jpg",
    "/images/gallery/meetings/73066398_XXL.jpg",
    "/images/gallery/meetings/73171590_XXL.jpg",
    "/images/gallery/meetings/73171592_XXL.jpg",
    "/images/gallery/meetings/73171598_XXL.jpg",
  ],
  Facilities: [
    "/images/gallery/facility/6429175_XXL.jpg",
    "/images/gallery/facility/6429187_XXL.jpg",
  ],
  "Other pictures": [
    "/images/gallery/others/1764979633.jpg",
    "/images/gallery/others/55bec446-891e-4e29-90ee-40fc7f8166b9.jpg",
    "/images/gallery/others/61940047_xxl.jpg",
    "/images/gallery/others/61993873_xxl.jpg",
    "/images/gallery/others/6429153_xxl.jpg",
    "/images/gallery/others/6429169_xxl.jpg",
    "/images/gallery/others/6429177_xxl.jpg",
    "/images/gallery/others/6429189_xxl.jpg",
    "/images/gallery/others/6467642_xxl.jpg",
    "/images/gallery/others/6467760_xxl.jpg",
    "/images/gallery/others/73066230_xxl.jpg",
    "/images/gallery/others/73067466_xxl.jpg",
    "/images/gallery/others/73067470_xxl.jpg",
    "/images/gallery/others/73067760_xxl.jpg",
    "/images/gallery/others/73088757_xxl.jpg",
    "/images/gallery/others/8f80e40b-50fc-4add-bb8d-67d9b35bb415.jpg",
    "/images/gallery/others/997a855f-4002-4acf-afc7-6692c59e0f2a.jpg",
    "/images/gallery/others/bb4880f1-fffa-4fa1-adca-fdb4c4bc35aa.jpg",
    "/images/gallery/others/bb77f16e-1741-4bff-b2f3-c4b82110eb03.jpg",
    "/images/gallery/others/bd9afaea-9314-4318-afa1-0137776b3d63.jpg",
    "/images/gallery/others/d785ed32-0368-4cbc-9402-7cec49509f5a.jpg",
    "/images/gallery/others/dbedd5e6-e290-46fc-81c2-8726c8645249.jpg",
    "/images/gallery/others/f0ee7315-f4f9-4c5f-bb30-0af1e141140a.jpg",
    "/images/gallery/others/f264c762-c79c-409c-859e-7d074f517744.jpg",
    "/images/gallery/others/img.jpg",
    "/images/gallery/others/img2.jpg",
    "/images/gallery/others/img3.jpg",
    "/images/gallery/others/img4.jpeg",
    "/images/gallery/others/img5.jpeg",
    "/images/gallery/others/img6.jpeg",
    "/images/gallery/others/img7.jpeg",
  ],
};

const fallback = "/images/gallery/others/img7.jpeg";

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = selectedCategory ? allImages[selectedCategory] ?? [] : [];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-golden-yellow">
              {selectedCategory || "Gallery"}
            </h1>
          </div>
          {selectedCategory && (
            <Button
              variant="outline"
              onClick={() => { setSelectedCategory(null); setLightboxIndex(null); }}
              className="text-sm"
            >
              All Categories
            </Button>
          )}
        </div>
      </header>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-5xl w-full mx-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            <img
              src={images[lightboxIndex]}
              alt={`${selectedCategory} ${lightboxIndex + 1}`}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
            />

            <div className="text-center mt-4 text-white text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {!selectedCategory ? (
          /* Category Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ key, thumb }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/60 hover:ring-1 hover:ring-primary/20 transition-all shadow-sm hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={thumb}
                    alt={key}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                  />
                </div>
                <div className="px-3 py-2 text-sm font-semibold text-center">{key}</div>
              </button>
            ))}
          </div>
        ) : (
          /* Image Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((src, index) => (
              <button
                key={src}
                onClick={() => setLightboxIndex(index)}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={src}
                    alt={`${selectedCategory} ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
