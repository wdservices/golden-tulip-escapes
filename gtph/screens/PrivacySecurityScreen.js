import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield, Lock, Eye, Bell, Trash2, ChevronRight } from 'lucide-react-native';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

export default function PrivacySecurityScreen({ navigation }) {
  const user = auth.currentUser;
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data including bookings will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete Firestore user doc
              await deleteDoc(doc(db, 'users', user.uid));
              // Delete Firebase Auth user
              await deleteUser(user);
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
            } catch (error) {
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Re-authentication Required', 'Please sign out and sign back in before deleting your account.');
              } else {
                Alert.alert('Error', error.message);
              }
            }
          }
        },
      ]
    );
  };

  const ToggleRow = ({ icon: Icon, label, description, value, onValueChange }) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <View style={styles.iconBox}>
          <Icon size={20} color="#C5A059" />
        </View>
        <View style={styles.toggleContent}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#334155', true: 'rgba(197, 160, 89, 0.4)' }}
        thumbColor={value ? '#C5A059' : '#94a3b8'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <ToggleRow
            icon={Lock}
            label="Biometric Login"
            description="Use fingerprint or face ID to sign in"
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
          />

          <ToggleRow
            icon={Shield}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <ToggleRow
            icon={Bell}
            label="Booking Notifications"
            description="Receive updates about your bookings"
            value={bookingNotifications}
            onValueChange={setBookingNotifications}
          />

          <ToggleRow
            icon={Eye}
            label="Marketing Emails"
            description="Receive offers and promotions via email"
            value={marketingEmails}
            onValueChange={setMarketingEmails}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View style={styles.iconBox}>
                <Eye size={20} color="#C5A059" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Download My Data</Text>
                <Text style={styles.actionDescription}>Get a copy of your personal data</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Trash2 size={20} color="#ef4444" />
              </View>
              <View>
                <Text style={[styles.actionLabel, { color: '#ef4444' }]}>Delete Account</Text>
                <Text style={styles.actionDescription}>Permanently remove your account and data</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3649',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  actionDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
});
