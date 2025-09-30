import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bed, Users, ArrowLeft, Check, Star, ArrowRight } from 'lucide-react';
import { getBranchById } from '@/services/branchService';
import { Branch } from '@/types/branch';
import { Panorama360Viewer } from '@/components/ui/Panorama360Viewer';
import { roomTypes as updatedRoomTypes } from '@/data/rooms';
import { RoomType } from '@/types/room';

export const RoomDetailPage = () => {
  const { branchId, roomId } = useParams<{ branchId: string; roomId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [room, setRoom] = useState<RoomType | null>(null);
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
        navigate('/not-found', { replace: true });
        return;
      }

      setBranch(branchData);

      // Find the room by its URL-friendly name using updated room data
      const decodedRoomId = roomId.replace(/-/g, ' ');
      const roomData = updatedRoomTypes.find(
        (r) => r.name.toLowerCase() === decodedRoomId.toLowerCase()
      );

      if (!roomData) {
        setError('Room not found');
        navigate(`/branch/${branchId}`, { replace: true });
        return;
      }

      // Use the updated room data with VR tour URL and rating
      const roomWithExtras = {
        ...roomData,
        rating: 4.8, // Sample rating
        image360: roomData.vrTourUrl || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070', // Use VR tour URL or placeholder
      };

      setRoom(roomWithExtras);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with 360 Viewer */}
      <section className="relative h-[70vh] bg-black">
        <Panorama360Viewer imageUrl={room.image360 || ''} />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="container mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4 text-white border-white/20 bg-black/30 hover:bg-black/50"
              onClick={() => navigate(`/branch/${branchId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {branch.name}
            </Button>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{room.name}</h1>
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium text-white">{room.rating}</span>
              </div>
            </div>
            <p className="text-xl text-white/80 mt-2">₦{room.price?.toLocaleString()}/night</p>
          </div>
        </div>
      </section>

      {/* Room Details */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Room Overview</h2>
              <p className="text-muted-foreground mb-6">{room.description}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <span>Accommodates up to {room.capacity} guests</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Room Amenities</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {room.amenities?.map((amenity, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
              
              <Button size="lg" className="w-full md:w-auto">
                <Link to={`/booking?branch=${branchId}&room=${roomId}`} className="flex items-center">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="bg-card rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">About {branch.name}</h2>
              <p className="text-muted-foreground mb-6">{branch.description}</p>
              
              <Button variant="outline" asChild>
                <Link to={`/branch/${branchId}`}>
                  View Branch Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomDetailPage;