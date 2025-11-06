import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bed, Users, ArrowLeft, Check, Star, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { getBranchById } from '@/services/branchService';
import { Branch } from '@/types/branch';

export const RoomDetailPage = () => {
  const { branchId, roomId } = useParams<{ branchId: string; roomId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [room, setRoom] = useState<Branch['roomTypes'][0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId || !roomId) {
      setError('Missing branch or room information');
      setIsLoading(false);
      return;
    }

    try {
      const branchData = getBranchById(branchId);
      if (!branchData) {
        setError('Branch not found');
        navigate('/404', { replace: true });
        return;
      }

      setBranch(branchData);

      // Find the room by its URL-friendly name using branch-specific room data
      const decodedRoomId = roomId.replace(/-/g, ' ');
      const roomData = branchData.roomTypes?.find(
        (r) => r.name.toLowerCase() === decodedRoomId.toLowerCase()
      );

      if (!roomData) {
        setError('Room not found');
        navigate(`/branch/${branchId}`, { replace: true });
        return;
      }

      setRoom(roomData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load room information');
    } finally {
      setIsLoading(false);
    }
  }, [branchId, roomId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !room || !branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Room</h1>
        <p className="text-gray-600 mb-6">{error || 'The requested room could not be found.'}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // Branch-specific styling
  const isEvoRoad = branchId === 'evo-road';
  
  return (
    <div className={`min-h-screen ${isEvoRoad ? 'bg-gradient-to-br from-blue-50 via-white to-yellow-50' : 'bg-background'}`}>
      {/* Hero Section */}
      <section className={`relative h-[70vh] ${isEvoRoad ? 'bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-yellow-900/60' : 'bg-gradient-to-b from-black/80 to-black/60'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30">
          {branchId === 'garden-city' && room.name.toLowerCase() === 'superior room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HGx1?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
              className="w-full h-full object-cover"
            />
          ) : branchId === 'garden-city' && room.name.toLowerCase() === 'standard room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HGxX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'super executive room' ? (
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HphP?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'deluxe room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HphX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'executive deluxe room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7Hph1?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'executive twin room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7Hphd?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'royal suites room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HphC?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'standard room' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HpLN?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'executive suite' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HpLm?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : room.name.toLowerCase() === 'deluxe suite' ? (
            <iframe 
              width="100%" 
              height="640" 
              frameBorder="0" 
              allow="xr-spatial-tracking; gyroscope; accelerometer" 
              allowFullScreen 
              scrolling="no" 
              src="https://kuula.co/share/collection/7HpLs?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=1.5&autop=90&autopalt=1&thumbs=1"
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070" 
              alt={room.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${isEvoRoad ? 'from-blue-900/90 to-transparent' : 'from-black/90 to-transparent'} p-6`}>
          <div className="container mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className={`mb-4 text-white ${isEvoRoad ? 'border-blue-200/30 bg-blue-800/40 hover:bg-blue-700/60' : 'border-white/30 bg-black/40 hover:bg-black/60'}`}
              onClick={() => navigate(`/branch/${branchId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {branch.name}
            </Button>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{room.name}</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isEvoRoad ? 'bg-yellow-500/20 border border-yellow-300/30' : 'bg-white/20 border border-white/30'}`}>
                <Star className={`h-5 w-5 ${isEvoRoad ? 'text-yellow-300' : 'text-primary'}`} />
                <span className="font-medium text-white">4.8</span>
              </div>
            </div>
            <p className={`text-xl mt-2 drop-shadow-md ${isEvoRoad ? 'text-yellow-100' : 'text-white'}`}>{room.priceRange}/night</p>
          </div>
        </div>
      </section>

      {/* Room Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className={`rounded-xl shadow-lg p-8 mb-8 ${isEvoRoad ? 'bg-white/90 backdrop-blur-sm border border-blue-100' : 'bg-card'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isEvoRoad ? 'text-blue-900' : 'text-foreground'}`}>Room Overview</h2>
              <p className={`mb-6 leading-relaxed ${isEvoRoad ? 'text-slate-700' : 'text-muted-foreground'}`}>{room.description}</p>
              
              <div className={`flex items-center gap-2 mb-6 ${isEvoRoad ? 'text-blue-800' : 'text-foreground'}`}>
                <Users className={`h-5 w-5 ${isEvoRoad ? 'text-blue-600' : 'text-primary'}`} />
                <span>Accommodates up to {room.capacity} guests</span>
              </div>
              
              <h3 className={`text-xl font-semibold mb-3 ${isEvoRoad ? 'text-blue-900' : 'text-foreground'}`}>Room Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {room.features?.map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-2 ${isEvoRoad ? 'text-slate-700' : 'text-muted-foreground'}`}>
                    <Check className={`h-5 w-5 ${isEvoRoad ? 'text-blue-600' : 'text-primary'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button size="lg" className={`w-full md:w-auto shadow-md ${isEvoRoad ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>
                <Link to={`/book?branch=${branchId}&room=${roomId}`} className="flex items-center">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className={`rounded-xl shadow-lg p-8 mb-8 ${isEvoRoad ? 'bg-white/90 backdrop-blur-sm border border-blue-100' : 'bg-card'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isEvoRoad ? 'text-blue-900' : 'text-foreground'}`}>About {branch.name}</h2>
              <p className={`mb-6 leading-relaxed ${isEvoRoad ? 'text-slate-700' : 'text-muted-foreground'}`}>{branch.description}</p>
              
              <Button variant="outline" className={isEvoRoad ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : ''} asChild>
                <Link to={`/branch/${branchId}`}>
                  View Branch Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Contact Information - Only show for EVO Road */}
            {isEvoRoad && (
              <div className="bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl shadow-lg border border-yellow-200 p-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-900">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold text-blue-900">{branch.phone}</p>
                        <p className="text-sm text-slate-600">Call for reservations</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold text-blue-900">{branch.email}</p>
                        <p className="text-sm text-slate-600">Email inquiries</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">{branch.location}</p>
                      <p className="text-sm text-slate-600">{branch.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomDetailPage;