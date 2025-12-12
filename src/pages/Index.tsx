import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BranchTabs } from "@/components/BranchTabs";
import { InfoSections } from "@/components/InfoSections";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const Index = () => {
  // Don't set main as the default active tab
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Wellness");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const location = useLocation();
  useEffect(() => {
    if (location.hash === '#gallery') {
      setIsGalleryOpen(true);
    }
  }, [location.hash]);

  const handleTabChange = (branch: string) => {
    // If clicking on main branch, reset the active tab
    if (branch === 'main') {
      setActiveBranch(null);
    } else {
      setActiveBranch(branch);
    }
  };

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBookNowClick = () => {
    if (isAuthenticated) {
      navigate('/book');
    } else {
      navigate('/auth', { state: { from: '/book' } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeBranch || ''} onTabChange={handleTabChange} onOpenGallery={() => setIsGalleryOpen(true)} />
      
      <main>
        <HeroSection 
          activeBranch={activeBranch} 
          onBookNowClick={handleBookNowClick}
        />
        
        <BranchTabs 
          selectedBranch={activeBranch} 
          onBranchSelect={handleTabChange}
        />

        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-6xl w-[95vw] h-[80vh] sm:h-[75vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Pictures Gallery</DialogTitle>
            </DialogHeader>
            <div className="flex h-full flex-col gap-4 pr-2 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pb-2">
                {[
                  { key: "Wellness", thumb: "/images/gallery/wellness/spar2.jpg" },
                  { key: "Rooms", thumb: "/images/gallery/rooms/img (2).jpg" },
                  { key: "Catering", thumb: "/images/gallery/catering/61940181_XXL.jpg" },
                  { key: "Meetings", thumb: "/images/gallery/meetings/73066312_XXL.jpg" },
                  { key: "Facilities", thumb: "/images/gallery/facility/6429175_XXL.jpg" },
                  { key: "Other pictures", thumb: "/images/gallery/others/61940047_XXL.jpg" },
                ].map(({ key, thumb }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full text-left rounded-xl border ${selectedCategory === key ? "border-primary ring-1 ring-primary/30" : "border-border"} bg-card hover:border-primary/60 hover:ring-1 hover:ring-primary/20 transition-colors shadow-sm hover:shadow-md`}
                  >
                    <img src={thumb} alt={key} className="w-full h-20 object-cover rounded-t-xl" />
                    <div className="px-2 py-1 text-xs font-medium">{key}</div>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">{selectedCategory}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(
                    selectedCategory === "Wellness" ? [
                      "/images/gallery/wellness/spar2.jpg"
                    ] : selectedCategory === "Rooms" ? [
                      "/images/gallery/rooms/img (2).jpg",
                      "/images/gallery/rooms/img (3).jpg",
                      "/images/gallery/rooms/img (4).jpg",
                      "/images/gallery/rooms/img (5).jpg",
                      "/images/gallery/rooms/img (6).jpg",
                      "/images/gallery/rooms/img (7).jpg",
                      "/images/gallery/rooms/img (8).jpg",
                      "/images/gallery/rooms/img (9).jpg",
                      "/images/gallery/rooms/img (10).jpg",
                      "/images/gallery/rooms/img (12).jpg",
                      "/images/gallery/rooms/img (13).jpg",
                      "/images/gallery/rooms/img (14).jpg",
                      "/images/gallery/rooms/img (15).jpg",
                      "/images/gallery/rooms/img (16).jpg",
                      "/images/gallery/rooms/img (17).jpg",
                      "/images/gallery/rooms/img (18).jpg",
                      "/images/gallery/rooms/img (19).jpg",
                      "/images/gallery/rooms/img (20).jpg",
                      "/images/gallery/rooms/img (22).jpg",
                    ] : selectedCategory === "Catering" ? [
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
                      "/images/gallery/catering/IMG_7822.JPG",
                    ] : selectedCategory === "Meetings" ? [
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
                    ] : selectedCategory === "Facilities" ? [
                      "/images/gallery/facility/6429175_XXL.jpg",
                      "/images/gallery/facility/6429187_XXL.jpg",
                    ] : [
                      "/images/gallery/others/1764979633.png",
                      "/images/gallery/others/61940047_XXL.jpg",
                      "/images/gallery/others/61993873_XXL.jpg",
                      "/images/gallery/others/6429153_XXL.jpg",
                      "/images/gallery/others/6429169_XXL.jpg",
                      "/images/gallery/others/6429177_XXL.jpg",
                      "/images/gallery/others/6429189_XXL.jpg",
                      "/images/gallery/others/6467642_XXL.jpg",
                      "/images/gallery/others/6467760_XXL.jpg",
                      "/images/gallery/others/73066230_XXL.jpg",
                      "/images/gallery/others/73067466_XXL.jpg",
                      "/images/gallery/others/73067470_XXL.jpg",
                      "/images/gallery/others/73067760_XXL.jpg",
                      "/images/gallery/others/73088757_XXL.jpg",
                      "/images/gallery/others/IMG_2650.jpg",
                      "/images/gallery/others/IMG_2652.jpg",
                      "/images/gallery/others/IMG_2661.jpg",
                      "/images/gallery/others/img (11).jpg",
                      "/images/gallery/others/img (21).jpg",
                    ]
                  ).map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        setLightboxSrc(src);
                        setIsGalleryOpen(false);
                      }}
                      className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg"
                    >
                      <img src={src} alt={selectedCategory} className="w-full h-48 sm:h-64 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!lightboxSrc}
          onOpenChange={(open) => {
            if (!open) {
              setLightboxSrc(null);
              setIsGalleryOpen(true);
            }
          }}
        >
          <DialogContent className="max-w-4xl w-[95vw] bg-transparent border-none shadow-none p-0">
            <div className="relative w-full">
              {lightboxSrc && (
                <img src={lightboxSrc} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <InfoSections />
        
        {/* About Section */}
        <section id="about" className="py-20 bg-gradient-to-b from-background via-muted/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-serif font-bold mb-4 text-gradient-gold">
                  About Golden Tulip
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Experience unparalleled luxury and hospitality in the heart of Port Harcourt
                </p>
              </div>

              <div className="card-luxury border-l-4 border-l-amber-500 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-glow">
                <div className="space-y-8">
                  {/* Main Content - Collapsible */}
                  <div className="prose prose-lg max-w-none">
                    <div className={`transition-all duration-700 ease-in-out ${showFullAbout ? 'max-h-none' : 'max-h-80 overflow-hidden relative'}`}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-serif font-semibold mb-4 text-gradient-gold">
                            First-Class International Business Hotel
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            Golden Tulip Port Harcourt Hotel is a first-class, 4-Star International Business Hotel. The Flagship Location is situated in the Government Residential Area (G. R. A) of Port Harcourt the Garden City of Nigeria. This Exclusive Residential Area provides a serene and peaceful environment while offering proximity to a variety of other attractions and amenities in the area.
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            Conveniently located 35 kilometers from Port Harcourt International Airport, the Hotel is close to the Port Harcourt Polo Club, Genesis Deluxe Cinema, Everyday Emporium Shopping Mall, Air Assault Golf Course and the Famous Shell Club.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-2xl font-serif font-semibold mb-4 text-gradient-rose">
                            Prime Location & Accessibility
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            The Hotel is located 1km from the Aba Expressway with an easy access link to the Port Harcourt International Airport, Omagwa, 35km away. The primary means of transportation to and fro the Airport is by Taxi or Car Hire, both of which can be arranged at the Hotel's Reception.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-2xl font-serif font-semibold mb-4 text-gradient-emerald">
                            World-Class Accommodation
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            The Golden Tulip Chain of Hotels is a living mix of our high international standard of full-service Hotel offering excellent accommodation in long stay suites, relaxing resorts and state of art meeting facilities. The Individual Golden Tulip Hotels deliver high quality accommodation combined with the unique personality of its staff and the local flavors of its location.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-2xl font-serif font-semibold mb-4 text-gradient-violet">
                            Luxury Amenities & Services
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            This business-friendly Hotel has a portfolio of four properties in Port Harcourt with a combined capacity of 245 rooms fully air-conditioned Guestrooms equipped with separate Bathtubs and showers, make up/shaving mirrors, hair dryers and complimentary bath amenities.
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            Additional In-room facilities and general Hotel Services include electronic safes, Television equipped with premium satellite channels, turndown service, an iron and ironing board available on request. All 245 rooms are en-suite, offering complimentary high-speed internet, smoke detectors, Refrigerators, Coffee Tea Makers and Complimentary bottled water.
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-2xl p-6 border border-amber-500/20">
                          <h3 className="text-2xl font-serif font-semibold mb-4 text-gradient-gold text-center">
                            Our Commitment to Excellence
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-lg font-semibold mb-3 text-primary">Room Features</h4>
                              <ul className="text-muted-foreground space-y-1 text-sm">
                                <li>• Ultra-firm comfortable mattresses with Orthopedic mattresses available on request</li>
                                <li>• City/courtyard views from all rooms</li>
                                <li>• All beds feature premium bedding</li>
                                <li>• Climate-controlled air conditioning</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold mb-3 text-primary">Service Philosophy</h4>
                              <ul className="text-muted-foreground space-y-1 text-sm">
                                <li>• Wide service options to fit customer choices</li>
                                <li>• Uniform service standards of excellence across all properties</li>
                                <li>• Refreshingly uncomplicated quality accommodation</li>
                                <li>• Enduring value for money and refreshing guest experience</li>
                              </ul>
                            </div>
                          </div>
                          <div className="mt-6 text-center">
                            <p className="text-lg font-semibold text-primary mb-2">Welcome to "Tranquility and Comfort in the heart of the Garden City"</p>
                            <p className="text-muted-foreground">We promise an enduring value for money and the most refreshing guest experience at any of our hotel properties. "Playtime, Anytime"</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="text-center mt-8">
                      <Button 
                        onClick={() => setShowFullAbout(!showFullAbout)}
                        className="btn-luxury group"
                        size="lg"
                      >
                        {showFullAbout ? (
                          <>
                            Show Less
                            <ChevronUp className="ml-2 h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                          </>
                        ) : (
                          <>
                            Read More About Golden Tulip
                            <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="text-center bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl p-6 border border-amber-500/20">
                      <div className="text-4xl font-bold text-gradient-gold mb-2">4</div>
                      <p className="text-muted-foreground font-medium">Premium Locations</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-rose-500/10 to-rose-600/10 rounded-2xl p-6 border border-rose-500/20">
                      <div className="text-4xl font-bold text-gradient-rose mb-2">245</div>
                      <p className="text-muted-foreground font-medium">Fully Equipped Rooms</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl p-6 border border-emerald-500/20">
                      <div className="text-4xl font-bold text-gradient-emerald mb-2">24/7</div>
                      <p className="text-muted-foreground font-medium">Full-Service Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
                Contact Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get in touch with our team for reservations, inquiries, or special requests
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-primary">Get In Touch</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">📞</span>
                        </div>
                        <div>
                          <p className="font-semibold">Reservations Hotline</p>
                          <p className="text-muted-foreground">+234 905 777 7780</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">📧</span>
                        </div>
                        <div>
                          <p className="font-semibold">Email Address</p>
                          <p className="text-muted-foreground">reservations@goldentulipportharcourt.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">📍</span>
                        </div>
                        <div>
                          <p className="font-semibold">Head Office</p>
                          <p className="text-muted-foreground">1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-card p-8 rounded-2xl">
                  <h3 className="text-2xl font-semibold mb-6 text-primary">Send us a Message</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      className="btn-luxury w-full py-3"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
