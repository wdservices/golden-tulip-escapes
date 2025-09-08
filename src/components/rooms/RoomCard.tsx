import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Room } from '@/types/room';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bed, Wifi, Tv, Coffee, Waves, Wind, Utensils, Dumbbell, Shield } from 'lucide-react';

// Map amenity names to icons
const amenityIcons: { [key: string]: React.ReactNode } = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Minibar': <Coffee className="h-4 w-4" />,
  'Ocean view': <Waves className="h-4 w-4" />,
  'Air conditioning': <Wind className="h-4 w-4" />,
  'Restaurant': <Utensils className="h-4 w-4" />,
  'Fitness center': <Dumbbell className="h-4 w-4" />,
  '24/7 Security': <Shield className="h-4 w-4" />,
};

interface RoomCardProps {
  room: Room;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === room.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? room.images.length - 1 : prevIndex - 1
    );
  };

  const handleBookNow = () => {
    navigate(`/book?room=${room.id}`);
  };

  const handleCardClick = () => {
    navigate(`/book?room=${room.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        {/* Image Gallery */}
        <div className="relative h-64 overflow-hidden group">
          <img
            src={room.images[currentImageIndex]}
            alt={`${room.name} - ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Navigation Arrows */}
          {room.images.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}
          
          {/* Image Indicators */}
          {room.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {room.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Room Size Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {room.size} m²
            </span>
          </div>
        </div>
        
        <div className="p-6 flex flex-col h-full">
          {/* Room Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">₦{room.price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm block">/ night</span>
            </div>
          </div>
          
          {/* Room Description */}
          <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
          
          {/* Room Features */}
          <div className="mt-4 mb-6">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Bed className="h-4 w-4 mr-2 text-blue-500" />
              <span>{room.bedCount} {room.bedType} bed{room.bedCount > 1 ? 's' : ''}</span>
              <span className="mx-2">•</span>
              <span>Max {room.maxOccupancy} {room.maxOccupancy > 1 ? 'guests' : 'guest'}</span>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="mt-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <span className="text-blue-500 mr-2">
                    {amenityIcons[amenity] || <span className="h-4 w-4">•</span>}
                  </span>
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
              {room.amenities.length > 4 && (
                <div className="text-sm text-blue-600">
                  +{room.amenities.length - 4} more
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/book?room=${room.id}`);
              }}
            >
              View Details
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleBookNow}
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
