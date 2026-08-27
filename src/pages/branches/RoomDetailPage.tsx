import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, Check, Star, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { getBranchById } from '@/services/branchService';
import { Branch } from '@/types/branch';
import { useBranchRooms, BranchRoom } from '@/hooks/useBranchRooms';

function formatTypeName(type: string): string {
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const RoomDetailPage = () => {
  const { branchId, roomId } = useParams<{ branchId: string; roomId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { rooms: dbRooms, isLoading: isLoadingRooms, formatPrice } = useBranchRooms(branchId);

  useEffect(() => {
    if (!branchId) {
      setError('Missing branch information');
      setIsLoadingBranch(false);
      return;
    }

    const branchData = getBranchById(branchId);
    if (!branchData) {
      setError('Branch not found');
      navigate('/404', { replace: true });
      return;
    }

    setBranch(branchData);
    setIsLoadingBranch(false);
  }, [branchId, navigate]);

  const isLoading = isLoadingBranch || isLoadingRooms;

  const dbRoom: BranchRoom | undefined = dbRooms.find((r) => {
    if (!roomId) return false;
    const target = roomId.toLowerCase();
    const roomType = r.type.toLowerCase().trim();
    return (
      roomType === target ||
      roomType.replace(/\s+/g, '-') === target ||
      roomType.replace(/\s+/g, '') === target.replace(/\s+/g, '')
    );
  });

  const staticByName = new Map<string, Branch['roomTypes'][0]>();
  branch?.roomTypes?.forEach((sr) => {
    const key = sr.name?.toLowerCase().trim() || '';
    staticByName.set(key, sr);
    staticByName.set(key.replace(/\s+/g, '-'), sr);
    staticByName.set(key.replace(/\s+/g, ''), sr);
  });

  const lookupKeys = dbRoom
    ? [
        dbRoom.type.toLowerCase().trim(),
        dbRoom.type.toLowerCase().replace(/-/g, ' '),
        dbRoom.type.toLowerCase().replace(/\s+/g, ''),
      ]
    : [];

  let staticMeta: Branch['roomTypes'][0] | undefined;
  for (const key of lookupKeys) {
    if (staticByName.has(key)) {
      staticMeta = staticByName.get(key);
      break;
    }
  }

  if (!isLoading && !dbRoom && branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h1>
        <p className="text-gray-600 mb-6">The requested room could not be found.</p>
        <Button onClick={() => navigate(`/branch/${branchId}`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {branch.name}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !branch || !dbRoom) {
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

  const roomName = staticMeta?.name || formatTypeName(dbRoom.type);
  const roomDescription = staticMeta?.description || '';
  const roomCapacity = staticMeta?.capacity || 2;
  const roomFeatures = staticMeta?.features || [];
  const roomImage = staticMeta?.image;
  const roomIdSlug = dbRoom.type;

  const isEvoRoad = branchId === 'evo-road';

  return (
    <div className={`min-h-screen ${isEvoRoad ? 'bg-gradient-to-br from-blue-50 via-white to-yellow-50' : 'bg-background'}`}>
      {/* Hero Section */}
      <section className={`relative h-[70vh] ${isEvoRoad ? 'bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-yellow-900/60' : 'bg-gradient-to-b from-black/80 to-black/60'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30">
          {roomImage ? (
            <img src={roomImage} alt={roomName} className="w-full h-full object-cover" />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070"
              alt={roomName}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${isEvoRoad ? 'from-blue-900/90 to-transparent' : 'from-black/90 to-transparent'} p-6 pointer-events-none`}>
          <div className="container mx-auto">
            <Button
              variant="outline"
              size="sm"
              className={`mb-4 text-white pointer-events-auto ${isEvoRoad ? 'border-blue-200/30 bg-blue-800/40 hover:bg-blue-700/60' : 'border-white/30 bg-black/40 hover:bg-black/60'}`}
              onClick={() => navigate(`/branch/${branchId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {branch.name}
            </Button>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{roomName}</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isEvoRoad ? 'bg-yellow-500/20 border border-yellow-300/30' : 'bg-white/20 border border-white/30'}`}>
                <Star className={`h-5 w-5 ${isEvoRoad ? 'text-yellow-300' : 'text-primary'}`} />
                <span className="font-medium text-white">4.8</span>
              </div>
            </div>
            <p className={`text-xl mt-2 drop-shadow-md ${isEvoRoad ? 'text-yellow-100' : 'text-white'}`}>
              {formatPrice(dbRoom.pricePerNight)}/night
            </p>
          </div>
        </div>
      </section>

      {/* Room Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className={`rounded-xl shadow-lg p-8 mb-8 ${isEvoRoad ? 'bg-white/90 backdrop-blur-sm border border-blue-100' : 'bg-card'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isEvoRoad ? 'text-blue-900' : 'text-foreground'}`}>Room Overview</h2>
              {roomDescription && (
                <p className={`mb-6 leading-relaxed ${isEvoRoad ? 'text-slate-700' : 'text-muted-foreground'}`}>{roomDescription}</p>
              )}

              <div className={`flex items-center gap-2 mb-6 ${isEvoRoad ? 'text-blue-800' : 'text-foreground'}`}>
                <Users className={`h-5 w-5 ${isEvoRoad ? 'text-blue-600' : 'text-primary'}`} />
                <span>Accommodates up to {roomCapacity} guests</span>
              </div>

              {roomFeatures.length > 0 && (
                <>
                  <h3 className={`text-xl font-semibold mb-3 ${isEvoRoad ? 'text-blue-900' : 'text-foreground'}`}>Room Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {roomFeatures.map((feature, idx) => (
                      <li key={idx} className={`flex items-center gap-2 ${isEvoRoad ? 'text-slate-700' : 'text-muted-foreground'}`}>
                        <Check className={`h-5 w-5 ${isEvoRoad ? 'text-[hsl(var(--royal-blue))]' : 'text-primary'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Button size="lg" className={`w-full md:w-auto shadow-md ${isEvoRoad ? 'bg-[hsl(var(--royal-blue))] hover:bg-[hsl(var(--royal-blue-dark))] text-white' : ''}`}>
                <Link to={`/book?branch=${branchId}&room=${roomIdSlug}`} className="flex items-center">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className={`rounded-xl shadow-lg p-8 mb-8 ${isEvoRoad ? 'bg-white/90 backdrop-blur-sm border border-[hsl(var(--royal-blue)/0.15)]' : 'bg-card'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isEvoRoad ? 'text-[hsl(var(--royal-blue-dark))]' : 'text-foreground'}`}>About {branch.name}</h2>
              <p className={`mb-6 leading-relaxed ${isEvoRoad ? 'text-slate-700' : 'text-muted-foreground'}`}>{branch.description}</p>

              <Button variant="outline" className={isEvoRoad ? 'border-[hsl(var(--royal-blue)/0.35)] text-[hsl(var(--royal-blue))] hover:bg-[hsl(var(--royal-blue)/0.05)]' : ''} asChild>
                <Link to={`/branch/${branchId}`}>
                  View Branch Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

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
                      <p className="font-semibold text-[hsl(var(--royal-blue-dark))]">{branch.location}</p>
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
