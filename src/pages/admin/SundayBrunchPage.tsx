import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { collection, addDoc, query, orderBy, onSnapshot, where, Timestamp, getDocs, writeBatch, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, RefreshCw, Users, Calendar, Trash2, Download, Gift, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

interface Attendee {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  scannedAt: Timestamp;
  eventId: string;
}

interface Redemption {
  id: string;
  userId: string;
  redeemedAt: Timestamp;
  discountType: string;
  platform: string;
}

const SundayBrunchPage = () => {
  const [currentEventId, setCurrentEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const TARGET_SCANS = 5;

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;

    const svg = qrCodeRef.current.querySelector('svg');
    if (!svg) return;

    // Create a clone to manipulate dimensions for high-res output
    const svgClone = svg.cloneNode(true) as SVGElement;
    const size = 2048; // High definition size
    svgClone.setAttribute('width', size.toString());
    svgClone.setAttribute('height', size.toString());
    
    // Ensure viewBox is set if not already (QRCodeSVG usually sets it, but good to be safe)
    if (!svgClone.getAttribute('viewBox')) {
        svgClone.setAttribute('viewBox', `0 0 ${svg.getAttribute('width') || 200} ${svg.getAttribute('height') || 200}`);
    }

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      if (ctx) {
        // Fill white background (optional but good for QR codes)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `brunch-qr-${currentEventId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Reset Brunch Data
  const handleResetBrunch = async () => {
    try {
      setIsResetting(true);
      
      // Get all attendance records
      const attendanceRef = collection(db, 'sunday_brunch_attendance');
      const snapshot = await getDocs(attendanceRef);
      
      if (snapshot.empty) {
        toast({
          title: "No Records to Clear",
          description: "Attendance list is already empty.",
        });
        setIsResetting(false);
        return;
      }

      // Delete in batches (max 500 per batch)
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      toast({
        title: "Brunch Reset Successful",
        description: "All attendance records have been cleared.",
      });

      // Generate a new code for the fresh start
      generateNewCode();
      
    } catch (error) {
      console.error("Error resetting brunch:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Could not clear attendance records.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Generate a new Event ID (QR Code)
  const generateNewCode = async () => {
    const newId = `BRUNCH-${format(new Date(), 'yyyyMMdd')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    try {
      // Persist the new code to Firestore
      await setDoc(doc(db, 'brunch_config', 'active_session'), { 
        eventId: newId,
        createdAt: Timestamp.now()
      });
      
      setCurrentEventId(newId);
      toast({
        title: "New QR Code Generated",
        description: `Event ID: ${newId}`,
      });
    } catch (error) {
      console.error("Error saving new code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save new QR code.",
      });
    }
  };

  // Listen for attendees scanning this specific code
  useEffect(() => {
    // Listen for active session changes
    const configUnsubscribe = onSnapshot(doc(db, 'brunch_config', 'active_session'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.eventId && data.eventId !== currentEventId) {
          setCurrentEventId(data.eventId);
        }
      } else {
        // If no config exists, generate one
        generateNewCode();
      }
    });

    return () => configUnsubscribe();
  }, []); // Only run on mount to set up listener

  useEffect(() => {
    setLoading(true);
    // Fetch ALL attendance records for the current "season" (collection)
    // This ensures that even if the QR code is regenerated, previous scans remain visible
    // unti the admin explicitly resets (clears) the collection.
    const q = query(
      collection(db, 'sunday_brunch_attendance'),
      orderBy('scannedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAttendees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Attendee[];
      setAttendees(newAttendees);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attendees:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Run once on mount (and keep listening)

  // Listen for redemptions
  useEffect(() => {
    const q = query(
      collection(db, 'sunday_brunch_redemptions'),
      orderBy('redeemedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRedemptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Redemption[];
      setRedemptions(newRedemptions);
    }, (error) => {
      console.error("Error fetching redemptions:", error);
    });

    return () => unsubscribe();
  }, []);

  // Calculate stats per user
  const userStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    attendees.forEach(a => {
      if (a.userId) {
        stats[a.userId] = (stats[a.userId] || 0) + 1;
      }
    });
    return stats;
  }, [attendees]);

  // Group attendees by User ID for the main table view
  const uniqueAttendees = React.useMemo(() => {
    const map = new Map<string, Attendee>();
    attendees.forEach(a => {
      // Keep the most recent scan as the representative row
      if (!map.has(a.userId)) {
        map.set(a.userId, a);
      }
    });
    return Array.from(map.values());
  }, [attendees]);

  // Get all scans for a specific user
  const getUserScans = (userId: string) => {
    return attendees.filter(a => a.userId === userId).sort((a, b) => b.scannedAt.seconds - a.scannedAt.seconds);
  };

  // Get redemptions for a specific user
  const getUserRedemptions = (userId: string) => {
    return redemptions.filter(r => r.userId === userId).sort((a, b) => b.redeemedAt.seconds - a.redeemedAt.seconds);
  };

  // Handle Admin Redemption
  const handleAdminRedeem = async (user: Attendee) => {
    try {
      if (!confirm(`Are you sure you want to redeem the discount for ${user.userName}?`)) return;

      await addDoc(collection(db, 'sunday_brunch_redemptions'), {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        redeemedAt: serverTimestamp(),
        discountType: '20%',
        platform: 'admin_dashboard'
      });

      toast({
        title: "Discount Redeemed",
        description: `20% discount marked as used for ${user.userName}`,
      });
    } catch (error) {
      console.error("Error redeeming discount:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record redemption.",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sunday Brunch</h1>
          <p className="text-muted-foreground">Manage attendance and QR codes for Sunday Brunch events.</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isResetting}>
                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Reset Brunch
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all attendance records
                  from the database and reset the brunch session for both the admin dashboard and mobile app users.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetBrunch} className="bg-red-600 hover:bg-red-700">
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={generateNewCode} className="bg-[#C5A059] hover:bg-[#b08d4d]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QR Code Generator Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C5A059]" />
              Current Session
            </CardTitle>
            <CardDescription>Scan this code to check in</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
            {currentEventId ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div ref={qrCodeRef} className="p-4 bg-white rounded-xl shadow-sm border">
                  <QRCodeSVG value={currentEventId} size={200} level="H" includeMargin />
                </div>
                <Button variant="outline" size="sm" onClick={downloadQRCode} className="w-full max-w-[200px]">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            ) : (
              <div className="h-[200px] w-[200px] flex items-center justify-center bg-gray-100 rounded-xl flex-col p-4 text-center">
                {loading ? (
                   <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                   <>
                     <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                     <p className="text-sm text-gray-500">No active session</p>
                     <p className="text-xs text-gray-400">Click Generate New Code</p>
                   </>
                )}
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-500">Event ID</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-lg font-mono font-bold text-[#C5A059]">
                {currentEventId || '---'}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Attendance List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#C5A059]" />
              Live Attendance (Unique Guests)
            </CardTitle>
            <CardDescription>
              {uniqueAttendees.length} unique guest{uniqueAttendees.length !== 1 && 's'} checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Progress (Visits)</TableHead>
                    <TableHead>Latest Check-in</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueAttendees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No check-ins yet. Waiting for scans...
                      </TableCell>
                    </TableRow>
                  ) : (
                    uniqueAttendees.map((attendee) => {
                      const totalVisits = userStats[attendee.userId] || 1;
                      const userRedemptionCount = redemptions.filter(r => r.userId === attendee.userId).length;
                      const activeVisits = totalVisits - (userRedemptionCount * 5);
                      const remaining = Math.max(0, 5 - activeVisits);
                      const isEligible = activeVisits >= 5;
                      
                      return (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.userName}</TableCell>
                        <TableCell>{attendee.userPhone || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={`font-bold ${isEligible ? "text-green-600" : "text-[#C5A059]"}`}>
                              {activeVisits} / 5
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {isEligible 
                                ? 'Discount Available!' 
                                : `${remaining} more to go`}
                            </span>
                            {userRedemptionCount > 0 && (
                              <span className="text-[10px] text-gray-400 mt-1">
                                {userRedemptionCount} discount{userRedemptionCount !== 1 && 's'} used
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {attendee.scannedAt?.seconds 
                            ? format(new Date(attendee.scannedAt.seconds * 1000), 'h:mm a')
                            : 'Just now'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isEligible && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-8"
                                onClick={() => handleAdminRedeem(attendee)}
                              >
                                <Gift className="w-4 h-4 mr-1" />
                                Use Discount
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(attendee.userId)} className="h-8">
                                  View History
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>{attendee.userName}'s History</DialogTitle>
                                  <DialogDescription>
                                    Active Visits: {activeVisits} | Total Lifetime Visits: {totalVisits}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto">
                                  
                                  {/* Redemptions Section */}
                                  {getUserRedemptions(attendee.userId).length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-green-600" />
                                        Redemptions
                                      </h4>
                                      <div className="space-y-2">
                                        {getUserRedemptions(attendee.userId).map((redemption) => (
                                          <div key={redemption.id} className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-100">
                                            <div className="flex flex-col">
                                              <span className="text-sm font-medium text-green-700">20% Discount Used</span>
                                              <span className="text-xs text-green-600/70 capitalize">Via {redemption.platform.replace('_', ' ')}</span>
                                            </div>
                                            <span className="text-xs text-green-700 font-medium">
                                              {redemption.redeemedAt?.seconds 
                                                ? format(new Date(redemption.redeemedAt.seconds * 1000), 'MMM d, yyyy') 
                                                : ''}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Scans Section */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-[#C5A059]" />
                                      Visit History
                                    </h4>
                                    <div className="space-y-2">
                                      {getUserScans(attendee.userId).map((scan, index) => (
                                        <div key={scan.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg border">
                                          <div className="flex flex-col">
                                            <span className="font-medium">Visit #{totalVisits - index}</span>
                                            <span className="text-xs text-muted-foreground">Event ID: {scan.eventId}</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-sm font-medium">
                                              {scan.scannedAt?.seconds 
                                                ? format(new Date(scan.scannedAt.seconds * 1000), 'MMM d, yyyy') 
                                                : 'Just now'}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                              {scan.scannedAt?.seconds 
                                                ? format(new Date(scan.scannedAt.seconds * 1000), 'h:mm a') 
                                                : ''}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )})
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SundayBrunchPage;
