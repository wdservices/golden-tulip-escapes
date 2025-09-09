import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Wifi, Coffee, Tv, AirVent, Utensils, Users } from 'lucide-react';
import { roomTypes } from '../data/rooms';

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-gradient-to-b from-black/80 to-black/50">
        <div className="absolute inset-0 bg-[url('/images/rooms/hero-bg.jpg')] bg-cover bg-center -z-10" />
        <div className="text-center px-4 z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gold-400">Our Rooms & Suites</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience luxury and comfort in our meticulously designed rooms and suites, each offering a unique blend of modern amenities and elegant decor.
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomTypes.map((room) => (
            <div key={room.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gold-400/50 transition-colors">
              <div className="relative h-64">
                <img 
                  src={room.images?.[0] || '/placeholder-room.jpg'} 
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  From ${room.price?.toLocaleString()}/night
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{room.name}</h3>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1">4.9</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    <Users className="w-3 h-3 mr-1" />
                    {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}
                  </div>
                  <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    <span>Size: {room.size} m²</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Link to={`/rooms/${room.id}`} className="group">
                    <Button variant="link" className="text-gold-400 p-0 group-hover:underline">
                      View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to={`/book?room=${room.id}`}>
                    <Button className="bg-gold-500 hover:bg-gold-600 text-white">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gold-400">Room Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Free WiFi</h3>
              <p className="text-sm text-gray-400">High-speed internet access</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Coffee Maker</h3>
              <p className="text-sm text-gray-400">Premium coffee selection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Smart TV</h3>
              <p className="text-sm text-gray-400">Streaming services available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AirVent className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-semibold mb-1">Air Conditioning</h3>
              <p className="text-sm text-gray-400">Climate control in all rooms</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gold-600/10 to-gold-800/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gold-400">Ready for an Unforgettable Stay?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your perfect room today and experience luxury redefined at our hotel.
          </p>
          <Link to="/book">
            <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-white text-lg px-8 py-6">
              Book Your Stay Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
