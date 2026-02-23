import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isWeb, setIsWeb] = useState(Platform.OS === 'web');

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted && !isWeb) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      // 1. Check for pending discount (Block scan if discount is available)
      // Fetch all attendance records
      const attendanceQuery = query(
        collection(db, 'sunday_brunch_attendance'),
        where('userId', '==', auth.currentUser?.uid)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const totalVisits = attendanceSnapshot.size;

      // Fetch all redemptions
      const redemptionsQuery = query(
        collection(db, 'sunday_brunch_redemptions'),
        where('userId', '==', auth.currentUser?.uid)
      );
      const redemptionsSnapshot = await getDocs(redemptionsQuery);
      const totalRedemptions = redemptionsSnapshot.size;

      // Calculate active visits
      const activeVisits = totalVisits - (totalRedemptions * 5);

      if (activeVisits >= 5) {
        Alert.alert(
          'Discount Available', 
          'You have a 20% discount waiting to be used! Please redeem it before scanning for a new visit.', 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      // 2. Check if user has already scanned this specific QR code (Event ID)
      // NOTE: We only check for the exact same eventId. If admin generates a NEW code (new eventId),
      // this check will pass, allowing the user to scan again.
      const q = query(
        collection(db, 'sunday_brunch_attendance'),
        where('eventId', '==', data),
        where('userId', '==', auth.currentUser?.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        Alert.alert('Already Checked In', 'You have already scanned this specific QR code. Wait for a new code to scan again.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      // Assuming data is the event/session ID
      
      // Fetch user profile to get phone number
      let phoneNumber = 'N/A';
      if (auth.currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
             phoneNumber = userDoc.data().phoneNumber || 'N/A';
          }
        } catch (err) {
          console.log("Error fetching user profile:", err);
        }
      }

      await addDoc(collection(db, 'sunday_brunch_attendance'), {
        eventId: data,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || 'App User',
        userEmail: auth.currentUser?.email,
        userPhone: phoneNumber,
        scannedAt: serverTimestamp(),
        platform: 'mobile_app'
      });
      Alert.alert('Success', `Checked in successfully for: ${data}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to register attendance');
      setScanned(false);
    }
  };

  if (isWeb) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.text}>Camera scanning not supported in web preview.</Text>
          <Text style={styles.subtext}>Please test on a physical device.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
        </View>
        
        <View style={styles.scanFrame}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>

        <Text style={styles.instruction}>Align the QR code within the frame to check in</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10, color: '#fff' },
  button: { backgroundColor: '#C5A059', padding: 12, borderRadius: 8, alignSelf: 'center' },
  text: { color: '#fff', fontSize: 16, textAlign: 'center' },
  subtext: { color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  overlay: { flex: 1, justifyContent: 'space-between', paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  backBtn: { marginRight: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 280, height: 280, alignSelf: 'center', justifyContent: 'space-between', position: 'absolute', top: '30%' },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#C5A059' },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#C5A059' },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#C5A059' },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#C5A059' },
  instruction: { color: '#fff', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16, marginHorizontal: 20, borderRadius: 8 }
});
