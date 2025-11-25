import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BranchGallery {
  id: string;
  name: string;
  images: string[];
  description: string;
}

const BRANCH_GALLERIES: Record<string, BranchGallery> = {
  'evo-road': {
    id: 'evo-road',
    name: 'Golden Tulip EVO Road',
    images: [
      '/images/hero section image/image (1).jpg',
      '/images/hero section image/image (2).jpg',
      '/images/hero section image/image (3).jpg',
      '/images/hero section image/image (4).jpg',
      '/images/hero section image/image (5).jpg',
      '/images/hero section image/image (6).jpg'
    ],
    description: 'Experience luxury accommodation at our flagship EVO Road location in the heart of Port Harcourt.'
  },
  'garden-city': {
    id: 'garden-city',
    name: 'Golden Tulip Garden City',
    images: [
      '/images/garden city images/standard room.webp',
      '/images/garden city images/superior room.webp',
      '/images/hero section image/image (1).jpg',
      '/images/hero section image/image (3).jpg'
    ],
    description: 'Discover comfort and elegance at our Garden City location.'
  },
  'stadium-31': {
    id: 'stadium-31',
    name: 'Golden Tulip Stadium 31',
    images: [
      '/images/stadium road 31 images/deluxe.webp',
      '/images/stadium road 31 images/executive deluxe.webp',
      '/images/stadium road 31 images/executive twin.webp',
      '/images/stadium road 31 images/royal room.webp',
      '/images/stadium road 31 images/super executive.webp'
    ],
    description: 'Experience premium hospitality at our Stadium Road 31 location.'
  },
  'evergreen': {
    id: 'evergreen',
    name: 'Golden Tulip Evergreen',
    images: [
      '/images/evergreen images/standard room.webp',
      '/images/evergreen images/deluxe room.webp',
      '/images/evergreen images/executive room.webp',
      '/images/evergreen images/superior room.webp'
    ],
    description: 'Enjoy tranquility and comfort at our Evergreen location.'
  }
};

export function AndroidGalleryPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const gallery = branchId ? BRANCH_GALLERIES[branchId] : null;
  
  if (!gallery) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Gallery Not Found</h1>
          <Link to="/android" className="text-blue-600 hover:underline">
            Back to Android App
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
            <Link to="/android" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Android App
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{gallery.name}</h1>
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
                    index === currentImageIndex ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
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
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Book This Room
          </button>
        </div>
      </main>
    </div>
  );
}