import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { LogOut, MapPin, Building2, Calendar, User, QrCode, Menu } from 'lucide-react-native';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const BRANCHES = [
  { id: 'evo-road', name: 'Evo Road', image: require('../assets/evo-road-cover.webp') },
  { id: 'garden-city', name: 'Garden City', image: require('../assets/branches/garden-city/standard_room.webp') },
  { id: 'stadium-31', name: 'Stadium 31', image: require('../assets/branches/stadium-31/img20251204133623.jpg') },
  { id: 'evergreen', name: 'Evergreen', image: require('../assets/branches/evergreen/standard_room.webp') },
];

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setGreeting(getGreeting());
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
              <Menu size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.username}>{user?.displayName || 'Guest'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutBtn}>
            <LogOut size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.featuredCard}>
          <Image source={BRANCHES[0].image} style={styles.featuredImage} />
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredTitle}>Experience Luxury</Text>
            <Text style={styles.featuredSubtitle}>Book your stay today</Text>
            <TouchableOpacity 
              style={styles.bookNowBtn}
              onPress={() => navigation.navigate('Booking')}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          {[
            { icon: Calendar, label: 'Bookings', color: '#3b82f6', action: () => navigation.navigate('Booking') },
            { icon: QrCode, label: 'Sunday Brunch', color: '#10b981', action: () => navigation.navigate('BrunchAttendance') },
            { icon: MapPin, label: 'Contacts', color: '#f59e0b', action: () => navigation.navigate('Contacts') },
            { icon: User, label: 'Profile', color: '#8b5cf6', action: () => navigation.navigate('Profile') },
          ].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem} onPress={action.action}>
              <View style={[styles.iconBox, { backgroundColor: action.color }]}>
                <action.icon size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Our Locations</Text>
        {BRANCHES.map((branch) => (
          <TouchableOpacity 
            key={branch.id} 
            style={styles.branchCard}
            onPress={() => navigation.navigate('BranchDetails', { branch })}
          >
            <Image source={branch.image} style={styles.branchImage} />
            <View style={styles.branchInfo}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={styles.branchMeta}>
                <MapPin size={14} color="#94a3b8" />
                <Text style={styles.branchLocation}>Port Harcourt, Nigeria</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1D3649' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  greeting: { color: '#94a3b8', fontSize: 16 },
  username: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  logoutBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  featuredCard: { margin: 20, height: 200, borderRadius: 20, overflow: 'hidden' },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.6)' },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  featuredSubtitle: { color: '#e2e8f0', fontSize: 14, marginBottom: 10 },
  bookNowBtn: { backgroundColor: '#C5A059', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  bookNowText: { color: '#fff', fontWeight: 'bold' },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  actionItem: { alignItems: 'center' },
  iconBox: { padding: 16, borderRadius: 16, marginBottom: 8 },
  actionLabel: { color: '#cbd5e1', fontSize: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
  branchCard: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  branchImage: { width: 100, height: 100 },
  branchInfo: { padding: 16, justifyContent: 'center' },
  branchName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  branchMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  branchLocation: { color: '#94a3b8', fontSize: 12 }
});
