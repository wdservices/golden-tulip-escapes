import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, ArrowLeft, Camera, Sparkles, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { key: "Wellness",       thumb: "/images/gallery/wellness/spar2.jpg",         blurb: "Serene spa, sauna & unwind rituals" },
  { key: "Rooms",          thumb: "/images/gallery/rooms/img2.jpg",             blurb: "Signature suites & warm interiors" },
  { key: "Catering",       thumb: "/images/gallery/catering/61940181_XXL.jpg",  blurb: "Culinary moments & fine dining" },
  { key: "Meetings",       thumb: "/images/gallery/meetings/73066312_XXL.jpg",  blurb: "Boardrooms built for big ideas" },
  { key: "Facilities",     thumb: "/images/gallery/facility/6429175_XXL.jpg",   blurb: "Fitness, lounges & amenities" },
  { key: "Other pictures", thumb: "/images/gallery/others/img7.jpeg",           blurb: "Golden hours around the property" },
];

const allImages: Record<string, string[]> = {
  Wellness: [
    "/images/gallery/wellness/spar2.jpg",
  ],
  Rooms: [
    "/images/gallery/rooms/img1.jpg","/images/gallery/rooms/img2.jpg","/images/gallery/rooms/img3.jpg",
    "/images/gallery/rooms/img4.jpg","/images/gallery/rooms/img5.jpg","/images/gallery/rooms/img6.jpg",
    "/images/gallery/rooms/img7.jpg","/images/gallery/rooms/img8.jpg","/images/gallery/rooms/img9.jpg",
    "/images/gallery/rooms/img10.jpg","/images/gallery/rooms/img11.jpg","/images/gallery/rooms/img12.jpg",
    "/images/gallery/rooms/img13.jpg","/images/gallery/rooms/img14.jpg","/images/gallery/rooms/img15.jpg",
    "/images/gallery/rooms/img16.jpg","/images/gallery/rooms/img17.jpg","/images/gallery/rooms/img18.jpg",
    "/images/gallery/rooms/img19.jpg",
  ],
  Catering: [
    "/images/gallery/catering/61940181_XXL.jpg","/images/gallery/catering/61940891_XXL.jpg",
    "/images/gallery/catering/61941477_XXL.jpg","/images/gallery/catering/6429151_XXL.jpg",
    "/images/gallery/catering/6429155_XXL.jpg","/images/gallery/catering/6429161_XXL.jpg",
    "/images/gallery/catering/6429179_XXL.jpg","/images/gallery/catering/73067586_XXL.jpg",
    "/images/gallery/catering/73067764_XXL.jpg","/images/gallery/catering/73088759_XXL.jpg",
    "/images/gallery/catering/73171504_XXL.jpg","/images/gallery/catering/73171526_XXL.jpg",
    "/images/gallery/catering/73171552_XXL.jpg","/images/gallery/catering/73171558_XXL.jpg",
    "/images/gallery/catering/83649324_XXL.jpg","/images/gallery/catering/83649328_XXL.jpg",
    "/images/gallery/catering/83649330_XXL.jpg","/images/gallery/catering/83649350_XXL.jpg",
  ],
  Meetings: [
    "/images/gallery/meetings/73066312_XXL.jpg","/images/gallery/meetings/73066320_XXL.jpg",
    "/images/gallery/meetings/73066322_XXL.jpg","/images/gallery/meetings/73066326_XXL.jpg",
    "/images/gallery/meetings/73066328_XXL.jpg","/images/gallery/meetings/73066336_XXL.jpg",
    "/images/gallery/meetings/73066338_XXL.jpg","/images/gallery/meetings/73066348_XXL.jpg",
    "/images/gallery/meetings/73066366_XXL.jpg","/images/gallery/meetings/73066372_XXL.jpg",
    "/images/gallery/meetings/73066384_XXL.jpg","/images/gallery/meetings/73066394_XXL.jpg",
    "/images/gallery/meetings/73066398_XXL.jpg","/images/gallery/meetings/73171590_XXL.jpg",
    "/images/gallery/meetings/73171592_XXL.jpg","/images/gallery/meetings/73171598_XXL.jpg",
  ],
  Facilities: [
    "/images/gallery/facility/6429175_XXL.jpg","/images/gallery/facility/6429187_XXL.jpg",
  ],
  "Other pictures": [
    "/images/gallery/others/1764979633.jpg","/images/gallery/others/55bec446-891e-4e29-90ee-40fc7f8166b9.jpg",
    "/images/gallery/others/61940047_xxl.jpg","/images/gallery/others/61993873_xxl.jpg",
    "/images/gallery/others/6429153_xxl.jpg","/images/gallery/others/6429169_xxl.jpg",
    "/images/gallery/others/6429177_xxl.jpg","/images/gallery/others/6429189_xxl.jpg",
    "/images/gallery/others/6467642_xxl.jpg","/images/gallery/others/6467760_xxl.jpg",
    "/images/gallery/others/73066230_xxl.jpg","/images/gallery/others/73067466_xxl.jpg",
    "/images/gallery/others/73067470_xxl.jpg","/images/gallery/others/73067760_xxl.jpg",
    "/images/gallery/others/73088757_xxl.jpg","/images/gallery/others/8f80e40b-50fc-4add-bb8d-67d9b35bb415.jpg",
    "/images/gallery/others/997a855f-4002-4acf-afc7-6692c59e0f2a.jpg","/images/gallery/others/bb4880f1-fffa-4fa1-adca-fdb4c4bc35aa.jpg",
    "/images/gallery/others/bb77f16e-1741-4bff-b2f3-c4b82110eb03.jpg","/images/gallery/others/bd9afaea-9314-4318-afa1-0137776b3d63.jpg",
    "/images/gallery/others/d785ed32-0368-4cbc-9402-7cec49509f5a.jpg","/images/gallery/others/dbedd5e6-e290-46fc-81c2-8726c8645249.jpg",
    "/images/gallery/others/f0ee7315-f4f9-4c5f-bb30-0af1e141140a.jpg","/images/gallery/others/f264c762-c79c-409c-859e-7d074f517744.jpg",
    "/images/gallery/others/img.jpg","/images/gallery/others/img2.jpg","/images/gallery/others/img3.jpg",
    "/images/gallery/others/img4.jpeg","/images/gallery/others/img5.jpeg","/images/gallery/others/img6.jpeg",
    "/images/gallery/others/img7.jpeg",
  ],
};

const fallback = "/images/gallery/others/img7.jpeg";

// Brand tokens (solid, no gradients)
const BLUE = "hsl(var(--royal-blue))";
const GOLD = "hsl(var(--golden-yellow))";

const spanPattern = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = selectedCategory ? allImages[selectedCategory] ?? [] : [];
  const totalCount = useMemo(
    () => Object.values(allImages).reduce((n, arr) => n + arr.length, 0),
    []
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length));
      if (e.key === "ArrowLeft")  setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, images.length]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % images.length);
  };
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 shadow-[0_1px_0_hsl(var(--border)),0_10px_30px_-20px_hsl(var(--royal-blue)/0.25)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-[hsl(var(--royal-blue))] shadow-[0_4px_14px_hsl(var(--royal-blue)/0.12)] hover:shadow-[0_8px_22px_hsl(var(--royal-blue)/0.28)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[0_10px_25px_-8px_hsl(var(--royal-blue)/0.55)]"
                style={{ backgroundColor: BLUE }}
              >
                <Camera className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--royal-blue))]/70 font-semibold">
                  Golden Tulip · Gallery
                </p>
                <h1 className="font-serif text-xl md:text-2xl font-bold leading-tight truncate text-[hsl(var(--royal-blue))]">
                  {selectedCategory ?? "Moments in Frame"}
                </h1>
              </div>
            </div>
          </div>
          {selectedCategory && (
            <button
              onClick={() => { setSelectedCategory(null); setLightboxIndex(null); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-[0_10px_25px_-8px_hsl(var(--royal-blue)/0.55)] hover:shadow-[0_14px_30px_-8px_hsl(var(--royal-blue)/0.75)] hover:-translate-y-0.5 transition-all duration-300"
              style={{ backgroundColor: BLUE }}
            >
              All Categories
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 md:py-16">
        {!selectedCategory ? (
          <>
            {/* Hero intro */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-12 md:mb-16 text-center max-w-3xl mx-auto"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-[0_6px_18px_hsl(var(--royal-blue)/0.12)] text-xs font-semibold mb-6"
                style={{ color: BLUE }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
                A curated visual journey
              </div>
              <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight text-[hsl(var(--royal-blue))]">
                Step inside the{" "}
                <span className="relative inline-block" style={{ color: GOLD }}>
                  Golden Tulip
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                    style={{ backgroundColor: GOLD, opacity: 0.65 }}
                  />
                </span>{" "}
                experience.
              </h2>
              <p className="mt-5 font-sans text-base md:text-lg text-muted-foreground leading-relaxed">
                Explore {totalCount}+ photographs across six curated collections — rooms, wellness,
                culinary, meetings and more.
              </p>
            </motion.section>

            {/* Bento category grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[210px] gap-4 md:gap-5">
              {categories.map(({ key, thumb, blurb }, i) => {
                const count = allImages[key]?.length ?? 0;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedCategory(key)}
                    className={`group relative overflow-hidden rounded-3xl text-left bg-white shadow-[0_10px_30px_-12px_hsl(var(--royal-blue)/0.25)] hover:shadow-[0_28px_60px_-15px_hsl(var(--royal-blue)/0.45)] transition-all duration-500 will-change-transform hover:-translate-y-1 ${spanPattern[i % spanPattern.length]}`}
                  >
                    <img
                      src={thumb}
                      alt={key}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                    />
                    {/* Solid brand-blue wash for legibility */}
                    <div
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{ backgroundColor: BLUE, opacity: 0.55 }}
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ backgroundColor: BLUE, opacity: 0.15 }}
                    />
                    {/* Golden shine sweep on hover */}
                    <div className="pointer-events-none absolute -inset-x-8 -top-1/2 h-[220%] rotate-12 bg-white/25 opacity-0 group-hover:opacity-100 translate-x-[-120%] group-hover:translate-x-[120%] transition-all duration-[1400ms] ease-out" />

                    {/* Content */}
                    <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: GOLD, boxShadow: `0 0 10px ${GOLD}` }}
                          />
                          {count} photo{count !== 1 ? "s" : ""}
                        </span>
                        <span
                          className="h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:rotate-45"
                          style={{ color: BLUE }}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="transform transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                        <h3 className="font-serif text-2xl md:text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                          {key}
                        </h3>
                        <p className="mt-1 font-sans text-sm text-white/90 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                          {blurb}
                        </p>
                        <div
                          className="mt-3 h-[3px] w-10 rounded-full transition-all duration-500 group-hover:w-24"
                          style={{ backgroundColor: GOLD, boxShadow: `0 0 12px ${GOLD}` }}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Category header strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <p
                className="text-[11px] uppercase tracking-[0.24em] font-bold"
                style={{ color: GOLD }}
              >
                Collection
              </p>
              <h2 className="font-serif text-3xl md:text-4xl mt-1 text-[hsl(var(--royal-blue))]">
                {selectedCategory}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {images.length} photograph{images.length !== 1 ? "s" : ""}
              </p>
            </motion.div>

            {/* Masonry image grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-5 [column-fill:_balance]">
              {images.map((src, index) => (
                <motion.button
                  key={src}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.6), ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative mb-4 md:mb-5 w-full block break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-10px_hsl(var(--royal-blue)/0.25)] hover:shadow-[0_24px_50px_-15px_hsl(var(--royal-blue)/0.45)] transition-all duration-500 hover:-translate-y-1"
                >
                  <img
                    src={src}
                    alt={`${selectedCategory} ${index + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ backgroundColor: BLUE, opacity: 0.35 }}
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="h-8 w-8 rounded-full text-white flex items-center justify-center shadow-[0_8px_20px_hsl(var(--golden-yellow)/0.55)]"
                      style={{ backgroundColor: GOLD }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl p-4"
            style={{ backgroundColor: "hsl(var(--royal-blue-dark) / 0.92)" }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
              className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_30px_hsl(var(--golden-yellow)/0.5)] transition-all duration-300 hover:rotate-90"
              style={{ ["--hover-bg" as any]: GOLD }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-x-1"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:translate-x-1"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <div
                className="rounded-3xl overflow-hidden ring-1 ring-white/10"
                style={{ boxShadow: `0 40px 100px -20px hsl(var(--royal-blue) / 0.7)` }}
              >
                <img
                  src={images[lightboxIndex]}
                  alt={`${selectedCategory} ${lightboxIndex + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  style={{ backgroundColor: "hsl(var(--royal-blue-dark))" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                />
              </div>
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium">
                  <span className="font-bold" style={{ color: GOLD }}>{lightboxIndex + 1}</span>
                  <span className="opacity-60"> / {images.length}</span>
                </span>
                <span className="text-xs text-white/60 uppercase tracking-[0.25em]">
                  {selectedCategory}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
