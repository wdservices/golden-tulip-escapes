import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Mail, ArrowLeft } from 'lucide-react-native';

const BRANCH_CONTACTS = [
  {
    name: 'Golden Tulip EVO Road',
    phones: ['+234 905 777 7780', '+234 905 777 7782'],
    emails: ['reservations@goldentulipportharcourt.com', 'fom@goldentulipportharcourt.com']
  },
  {
    name: 'GOLDEN TULIP STADIUM ROAD',
    phones: ['+234 704 338 3142', '+234 704 338 3141'],
    emails: ['reservationsgt@rivotels.com', 'fomgt@rivotels.com']
  },
  {
    name: 'GOLDEN TULIP GARDEN CITY',
    phones: ['+234 704 215 6775', '+234 906 243 5585'],
    emails: ['reservations@rivotels.com', 'fom@rivotels.com']
  },
  {
    name: 'GOLDEN TULIP EVERGREEN',
    phones: ['+234 906 243 5582', '+234 916 998 8444'],
    emails: ['reservations@rivotelinternational.com', 'sales@rivotelinternational.com']
  }
];

export default function ContactsScreen({ navigation }) {
  const handleCall = (phone) => {
    const cleaned = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleaned}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Contact Details</Text>
              <Text style={styles.subtitle}>All branches</Text>
            </View>
          </View>
        </View>

        <View style={styles.list}>
          {BRANCH_CONTACTS.map((branch, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Phone size={16} color="#C5A059" />
                  <Text style={styles.sectionTitle}>Phone</Text>
                </View>
                {branch.phones.map((phone, phoneIndex) => (
                  <TouchableOpacity key={`phone-${index}-${phoneIndex}`} onPress={() => handleCall(phone)}>
                    <Text style={styles.detailTextLink}>{phone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Mail size={16} color="#C5A059" />
                  <Text style={styles.sectionTitle}>Email</Text>
                </View>
                {branch.emails.map((email, emailIndex) => (
                  <TouchableOpacity key={`email-${index}-${emailIndex}`} onPress={() => handleEmail(email)}>
                    <Text style={styles.detailTextLinkMuted}>{email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1D3649' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 14, marginTop: 2 },
  list: { padding: 20, gap: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  branchName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  section: { marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionTitle: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },
  detailTextLink: { color: '#fff', fontSize: 14, marginBottom: 4 },
  detailTextLinkMuted: { color: '#cbd5e1', fontSize: 14, marginBottom: 4 }
});
