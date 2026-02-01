import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { ChevronLeft, Gift, Award, Calendar, QrCode, Menu, CheckCircle } from 'lucide-react-native';

export default function BrunchAttendanceScreen({ navigation }) {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  
  const TARGET_SCANS = 5;

  useEffect(() => {
    if (!user) return;

    // Listen to Attendance
    const qAttendance = query(
      collection(db, 'sunday_brunch_attendance'),
      where('userId', '==', user.uid)
    );

    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by scannedAt descending
      docs.sort((a, b) => {
        const dateA = a.scannedAt?.toDate ? a.scannedAt.toDate() : new Date(0);
        const dateB = b.scannedAt?.toDate ? b.scannedAt.toDate() : new Date(0);
        return dateB - dateA;
      });
      setHistory(docs);
      setAttendanceCount(docs.length);
    });

    // Listen to Redemptions
    const qRedemptions = query(
      collection(db, 'sunday_brunch_redemptions'),
      where('userId', '==', user.uid)
    );

    const unsubRedemptions = onSnapshot(qRedemptions, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by redeemedAt descending
      docs.sort((a, b) => {
        const dateA = a.redeemedAt?.toDate ? a.redeemedAt.toDate() : new Date(0);
        const dateB = b.redeemedAt?.toDate ? b.redeemedAt.toDate() : new Date(0);
        return dateB - dateA;
      });
      setRedemptions(docs);
      setLoading(false);
    });

    return () => {
      unsubAttendance();
      unsubRedemptions();
    };
  }, [user]);

  const activeVisits = attendanceCount - (redemptions.length * TARGET_SCANS);
  const isEligible = activeVisits >= TARGET_SCANS;
  const scansLeft = Math.max(0, TARGET_SCANS - activeVisits);
  const progress = Math.min(activeVisits / TARGET_SCANS, 1);

  const handleRedeem = async () => {
    try {
      await addDoc(collection(db, 'sunday_brunch_redemptions'), {
        userId: user.uid,
        userName: user.displayName || 'App User',
        userEmail: user.email,
        redeemedAt: serverTimestamp(),
        discountType: '20%',
        platform: 'mobile_app'
      });
      setShowRedeemModal(false);
      Alert.alert('Success', 'Discount redeemed successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to redeem discount');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sunday Brunch Club</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('QRScanner')} style={styles.headerScanBtn}>
          <QrCode size={20} color="#C5A059" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <ImageBackground 
            source={{ uri: 'https://rivotels.com/images/garden%20city%20images/carousel%20image/IMG20251204143022.jpg' }} 
            style={styles.cardBackground}
            imageStyle={{ borderRadius: 20, opacity: 0.3 }}
          >
            <TouchableOpacity 
              style={styles.cardContent} 
              activeOpacity={isEligible ? 0.7 : 1}
              onPress={() => isEligible && setShowRedeemModal(true)}
            >
              <Award size={48} color={isEligible ? "#FFD700" : "#C5A059"} />
              <Text style={styles.cardTitle}>
                {isEligible ? "Reward Unlocked!" : `${scansLeft} Scans to go`}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isEligible 
                  ? "Tap here to redeem your 20% discount!" 
                  : "Scan the QR code at our Sunday Brunch to earn rewards."}
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{activeVisits} / {TARGET_SCANS} Completed</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {isEligible && (
          <TouchableOpacity onPress={() => setShowRedeemModal(true)} style={styles.rewardBox}>
            <Gift size={32} color="#fff" />
            <View>
              <Text style={styles.rewardTitle}>20% OFF</Text>
              <Text style={styles.rewardDesc}>Tap to Redeem Now</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Redemptions History */}
        {redemptions.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Redemption History</Text>
            <View style={styles.historyList}>
              {redemptions.map((item, index) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={[styles.checkIcon, { backgroundColor: '#10b981' }]}>
                      <CheckCircle size={16} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.historyTitle}>20% Discount Used</Text>
                      <Text style={styles.historyDate}>
                        {item.redeemedAt?.toDate ? item.redeemedAt.toDate().toDateString() : 'Unknown Date'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyStatus}>Redeemed</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Attendance History</Text>
        
        {loading ? (
          <ActivityIndicator color="#C5A059" />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#334155" />
            <Text style={styles.emptyText}>No brunch attendance recorded yet.</Text>
            <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('QRScanner')}>
              <QrCode size={20} color="#fff" />
              <Text style={styles.scanBtnText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((item, index) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.checkIcon}>
                    <Calendar size={16} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>Brunch Visit #{history.length - index}</Text>
                    <Text style={styles.historyDate}>
                      {item.scannedAt?.toDate ? item.scannedAt.toDate().toDateString() : 'Unknown Date'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyStatus}>Completed</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Redeem Confirmation Modal */}
      <Modal
        visible={showRedeemModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Award size={48} color="#C5A059" />
            <Text style={styles.modalTitle}>Redeem 20% Discount?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to use your discount now? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowRedeemModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleRedeem}
              >
                <Text style={styles.confirmBtnText}>Yes, Use Discount</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1D3649' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#162b3b' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  headerScanBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 20 },
  card: { height: 240, backgroundColor: '#1e293b', borderRadius: 20, marginBottom: 24 },
  cardBackground: { flex: 1, justifyContent: 'center' },
  cardContent: { padding: 24, alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  cardSubtitle: { color: '#cbd5e1', textAlign: 'center', marginBottom: 20 },
  progressContainer: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: '#C5A059', borderRadius: 4 },
  progressText: { color: '#C5A059', fontWeight: 'bold' },
  rewardBox: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#10b981', padding: 20, borderRadius: 16, marginBottom: 24 },
  rewardTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  rewardDesc: { color: '#fff', fontSize: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  historyList: { gap: 12 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 12 },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#C5A059', justifyContent: 'center', alignItems: 'center' },
  historyTitle: { color: '#fff', fontWeight: 'bold' },
  historyDate: { color: '#94a3b8', fontSize: 12 },
  historyStatus: { color: '#10b981', fontSize: 12, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 40, gap: 16 },
  emptyText: { color: '#64748b' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#C5A059', padding: 12, borderRadius: 8 },
  scanBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1e293b', padding: 24, borderRadius: 16, alignItems: 'center', gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  modalText: { color: '#cbd5e1', textAlign: 'center', fontSize: 14 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  confirmBtn: { backgroundColor: '#C5A059' },
  cancelBtnText: { color: '#fff' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' }
});
