import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { collection, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    try {
      const uid = auth.currentUser.uid;
      const email = auth.currentUser.email || '';

      const rootByUid = await getDocs(query(collection(db, 'bookings'), where('userId', '==', uid)));
      const rootByEmail = email ? await getDocs(query(collection(db, 'bookings'), where('email', '==', email))) : { docs: [] };
      const cgByEmail = email ? await getDocs(query(collectionGroup(db, 'bookings'), where('guestEmail', '==', email))) : { docs: [] };
      const cgByUid = await getDocs(query(collectionGroup(db, 'bookings'), where('userId', '==', uid)));

      const raw = [];
      for (const d of rootByUid.docs) raw.push({ id: d.id, ...d.data() });
      for (const d of rootByEmail.docs) raw.push({ id: d.id, ...d.data() });
      for (const d of cgByEmail.docs) raw.push({ id: d.id, ...d.data() });
      for (const d of cgByUid.docs) raw.push({ id: d.id, ...d.data() });

      const seen = new Set();
      const normalized = raw.map(b => {
        const branchName = b.branchName || '';
        const roomTypeName = b.roomTypeName || b.roomType || '';
        const checkIn = b.checkIn || b.checkInDate || null;
        const checkOut = b.checkOut || b.checkOutDate || null;
        const totalPrice = Number(b.totalPrice || b.totalAmount || 0);
        const status = b.status || 'confirmed';
        const createdAt = b.createdAt || b.bookingDate || b.checkInDate || b.checkIn || null;
        const key = `${b.id}:${b.branchId || ''}`;
        return { id: b.id, branchName, roomTypeName, checkIn, checkOut, totalPrice, status, createdAt, branchId: b.branchId || '' };
      }).filter(b => {
        const k = `${b.id}:${b.branchId}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      normalized.sort((a, b) => {
        const toMs = (v) => {
          if (!v) return 0;
          if (v.seconds) return v.seconds * 1000;
          const t = new Date(v).getTime();
          return isNaN(t) ? 0 : t;
        };
        return toMs(b.createdAt) - toMs(a.createdAt);
      });

      setBookings(normalized);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.hotelName}>{item.branchName}</Text>
        <Text style={[styles.status, { color: item.status === 'confirmed' ? '#4ade80' : '#facc15' }]}>
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.roomType}>{item.roomTypeName}</Text>
      <Text style={styles.date}>Check-in: {formatDate(item.checkIn)}</Text>
      <Text style={styles.date}>Check-out: {formatDate(item.checkOut)}</Text>
      <Text style={styles.price}>Total: ₦{item.totalPrice?.toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No bookings found.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3649',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#162b3b',
  },
  backBtn: {
    marginRight: 16,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C5A059',
  },
  status: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  roomType: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    color: '#ccc',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
  },
});
