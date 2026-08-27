import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import { fetchActiveAds } from './services/adsService';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';
import BrunchAttendanceScreen from './screens/BrunchAttendanceScreen';
import BranchDetailsScreen from './screens/BranchDetailsScreen';
import ContactsScreen from './screens/ContactsScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import PrivacySecurityScreen from './screens/PrivacySecurityScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Home, Calendar, QrCode, LogOut, Menu, User, BookOpen, Coffee, Phone, MessageSquare } from 'lucide-react-native';
import { PaystackProvider } from './paystackWrapper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AdsBanner from './components/AdsBanner';
import MiniAdsBanner from './components/MiniAdsBanner';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const user = auth.currentUser;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        {/* Background Image from Login Page */}
        <Image 
          source={require('./assets/branches/garden-city/1670228609dsc_1161885e.jpg')} 
          style={styles.headerBackgroundImage}
          resizeMode="cover"
        />
        
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'G'}</Text>
        </View>
        <Text style={styles.drawerName}>{user?.displayName || 'Guest'}</Text>
        <Text style={styles.drawerEmail}>{user?.email}</Text>
      </View>
      
      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => signOut(auth)}
        >
          <LogOut size={20} color="#ffffff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#C5A059',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#cbd5e1',
        drawerStyle: {
          backgroundColor: '#1D3649',
          width: 280,
        },
        drawerLabelStyle: {
          marginLeft: 0,
        }
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ color }) => <Home size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Booking" 
        component={BookingScreen} 
        options={{
          title: 'Book Now',
          drawerIcon: ({ color }) => <Calendar size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="MyBookings" 
        component={MyBookingsScreen} 
        options={{
          title: 'My Bookings',
          drawerIcon: ({ color }) => <BookOpen size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'My Profile',
          drawerIcon: ({ color }) => <User size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="QRScanner" 
        component={QRScannerScreen} 
        options={{
          title: 'QR Scanner',
          drawerIcon: ({ color }) => <QrCode size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="BrunchAttendance" 
        component={BrunchAttendanceScreen} 
        options={{
          title: 'Sunday Brunch',
          drawerIcon: ({ color }) => <Coffee size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Contacts" 
        component={ContactsScreen} 
        options={{
          title: 'Contact Details',
          drawerIcon: ({ color }) => <Phone size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Feedback" 
        component={FeedbackScreen} 
        options={{
          title: 'Share Feedback',
          drawerIcon: ({ color }) => <MessageSquare size={22} color={color} />
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showMainAd, setShowMainAd] = useState(false);
  const [showMiniAd, setShowMiniAd] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch Ads
  useEffect(() => {
    const unsubscribeAds = fetchActiveAds((fetchedAds) => {
      setAds(fetchedAds);
      if (fetchedAds.length > 0) {
        setShowMainAd(true);
        setShowMiniAd(false);
      } else {
        setShowMainAd(false);
        setShowMiniAd(false);
      }
    });
    return () => {
      if (unsubscribeAds) unsubscribeAds();
    };
  }, []);

  // Ad Rotation Logic
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  // Calculate ad duration based on website logic
  const getAdDuration = () => {
    if (ads.length === 0) return 6000;
    // Minimum 10 seconds, or 5 seconds per ad, max 20 seconds
    return Math.min(Math.max(10000, ads.length * 5000), 20000);
  };

  const handleMainAdClose = () => {
    setShowMainAd(false);
    // Show mini ad after a short delay to match website behavior
    setTimeout(() => {
      if (ads.length > 0) {
        setShowMiniAd(true);
      }
    }, 500);
  };

  const handleMiniAdExpand = () => {
    setShowMiniAd(false);
    setShowMainAd(true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D3649' }}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  const currentAd = ads.length > 0 ? ads[currentAdIndex] : null;

  return (
    <PaystackProvider publicKey="pk_live_5b8a1cc5108ee14b78f38c309af069f46f59ac83">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                <>
                  <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
                  <Stack.Screen name="BranchDetails" component={BranchDetailsScreen} />
                  <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                </>
              ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
          {showMainAd && currentAd && (
            <AdsBanner
              imageSource={currentAd.imageUrl ? { uri: currentAd.imageUrl } : require('./assets/branches/evergreen/deluxe_room.webp')}
              title={currentAd.title}
              description={currentAd.description}
              onClose={handleMainAdClose}
              autoHideAfterMs={getAdDuration()}
            />
          )}
          {showMiniAd && currentAd && (
            <MiniAdsBanner
              imageSource={currentAd.imageUrl ? { uri: currentAd.imageUrl } : require('./assets/branches/evergreen/deluxe_room.webp')}
              onExpand={handleMiniAdExpand}
              onClose={() => setShowMiniAd(false)}
            />
          )}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PaystackProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    minHeight: 180,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#162b3b',
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  headerBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2, // Faint effect
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerEmail: {
    color: '#94a3b8',
    fontSize: 14,
  },
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'medium',
  }
});
