import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBranchById } from '@/services/branchService';

export function AndroidGalleryPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const branch = useMemo(() => (branchId ? getBranchById(branchId) : undefined), [branchId]);
  const gallery = branch
    ? {
        id: branch.id!,
        name: branch.fullName || branch.name,
        images: (branch.gallery && branch.gallery.length > 0) ? branch.gallery : [],
        description: branch.description || ''
      }
    : null;
  
  if (!gallery) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Gallery Not Found</h1>
          <Link
            to="/android"
            aria-label="Back to Android App"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
          >
            <span className="text-lg">&lt;</span>
            <span className="font-medium">Back</span>
          </Link>
        </div>
      </div>
    );
  }
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.images.length) % gallery.images.length);
  };
  
  const handleBooking = () => {
    window.location.href = `/booking?branch=${gallery.id}&branchName=${encodeURIComponent(gallery.name)}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/android"
              aria-label="Back to Android App"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            >
              <span className="text-lg">&lt;</span>
              <span className="font-medium">Back</span>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{gallery.name}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">{gallery.description}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <div className="relative h-96 bg-gray-200">
              <img
                src={gallery.images[currentImageIndex]}
                alt={`${gallery.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-hotel.jpg';
                }}
              />
              
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {gallery.images.length}
              </div>
            </div>
            
            <div className="flex overflow-x-auto p-4 space-x-2 bg-gray-50">
              {gallery.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-[hsl(var(--royal-blue))]' 
                      : 'border-gray-300 hover:border-[hsl(var(--royal-blue-light))]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-hotel.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={handleBooking}
            className="bg-[hsl(var(--royal-blue))] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[hsl(var(--royal-blue-light))] transition-colors"
          >
            Book This Room
          </button>
        </div>
      </main>
    </div>
  );
}
