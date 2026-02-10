import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar as CalendarIcon, User, Mail, Phone, MapPin, Bed, Users, X, ChevronDown, CheckCircle } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { addDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { usePaystack } from '../paystackWrapper';
import { db, auth } from '../firebaseConfig';
import { WebView } from 'react-native-webview';

const PAYSTACK_PUBLIC_KEY = "pk_live_5b8a1cc5108ee14b78f38c309af069f46f59ac83";

const CustomPicker = ({ visible, onClose, title, data, onSelect, selectedValue }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.optionItem, selectedValue === item.id && styles.optionSelected]} 
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.optionText, selectedValue === item.id && styles.optionTextSelected]}>
                  {item.name}
                </Text>
                {item.price && <Text style={styles.optionSubText}>{item.price.toLocaleString()} / night</Text>}
                {selectedValue === item.id && <CheckCircle size={20} color="#C5A059" />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const DatePickerModal = ({ visible, onClose, onSelect, selectedDate, title }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <Calendar
              current={selectedDate || new Date().toISOString().split('T')[0]}
              onDayPress={day => {
                onSelect(day.dateString);
                onClose();
              }}
              markedDates={{
                [selectedDate]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
              }}
              theme={{
                backgroundColor: '#1e293b',
                calendarBackground: '#1e293b',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#C5A059',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#C5A059',
                dayTextColor: '#d9e1e8',
                textDisabledColor: '#475569',
                dotColor: '#C5A059',
                selectedDotColor: '#ffffff',
                arrowColor: '#C5A059',
                monthTextColor: '#fff',
                indicatorColor: '#C5A059',
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingScreen({ navigation }) {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    branchId: '',
    branchName: '',
    roomTypeId: '',
    roomTypeName: '',
    roomPrice: 0,
    checkIn: '',
    checkOut: '',
    adults: '1',
    children: '0',
    specialRequests: ''
  });

  // Pickers State
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showAdultsPicker, setShowAdultsPicker] = useState(false);
  const [showChildrenPicker, setShowChildrenPicker] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paystackPayload, setPaystackPayload] = useState(null);
  
  const { popup } = usePaystack();

  // Branch Payment Configuration (Mirrors web config)
  const BRANCH_PAYMENT_CONFIG = {
    'evo-road': {
      subaccount: 'ACCT_qly8r7unbtx4mac',
      branch_name: 'GOLDEN TULIP PORT HARCOURT HOTEL'
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (formData.branchId) {
      fetchRooms(formData.branchId);
    } else {
      setRooms([]);
    }
  }, [formData.branchId]);

  const fetchBranches = async () => {
    try {
      const q = query(collection(db, 'branches'));
      const snapshot = await getDocs(q);
      const branchList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, ...doc.data() }));
      setBranches(branchList);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchRooms = async (branchId) => {
    try {
      // Fetch rooms from the specific branch sub-collection
      const q = query(collection(db, 'branches', branchId, 'rooms'));
      const snapshot = await getDocs(q);
      
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Extract unique room types with their details (replicating web logic)
      const uniqueRoomTypes = new Map();
      
      roomsData.forEach(room => {
        if (room.type && room.pricePerNight) {
          if (!uniqueRoomTypes.has(room.type)) {
            uniqueRoomTypes.set(room.type, {
              id: room.type, // Use type as ID for selection
              name: room.type.charAt(0).toUpperCase() + room.type.slice(1), // Capitalize
              price: Number(room.pricePerNight),
              ...room
            });
          }
        }
      });
      
      const roomList = Array.from(uniqueRoomTypes.values());
      
      if (roomList.length === 0) {
          // Fallback: fetch 'room_types' if sub-collection is empty (legacy support)
          const q2 = query(collection(db, 'room_types'));
          const s2 = await getDocs(q2);
          const fallbackList = s2.docs.map(d => ({ id: d.id, name: d.data().name, price: d.data().price, ...d.data() }));
          setRooms(fallbackList);
      } else {
          setRooms(roomList);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Alert.alert('Error', 'Failed to load rooms for this branch.');
    }
  };

  const calculateTotal = () => {
    if (!formData.roomPrice || !formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Logic from web: price * nights * totalGuests (though unusual, sticking to replica request)
    // Actually, usually it's just nights * price. Let's stick to standard logic unless web strictly enforces guests multiplier.
    // Web: pricePerNight * nights * totalGuests. Okay, I will replicate it.
    const totalGuests = parseInt(formData.adults || 0) + parseInt(formData.children || 0);
    return formData.roomPrice * (diffDays || 1) * (totalGuests || 1);
  };

  const totalPrice = calculateTotal();

  const isPresidentialRoom = () => {
    const roomName = formData.roomTypeName || "";
    const roomId = formData.roomTypeId || "";
    return roomId.toLowerCase().includes("presidential") || roomName.toLowerCase().includes("presidential");
  };

  const maxAdults = 2;
  const maxChildren = isPresidentialRoom() ? 2 : 1;

  const adultOptions = [1, 2].map((num) => ({ id: num.toString(), name: `${num} ${num === 1 ? 'Adult' : 'Adults'}` }));
  const childOptions = Array.from({ length: maxChildren + 1 }, (_, index) => index).map((num) => ({
    id: num.toString(),
    name: `${num} ${num === 1 ? 'Child' : 'Children'}`
  }));

  const buildPaystackHtml = (payload) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="paystack"></div>
        <script src="https://js.paystack.co/v1/inline.js"></script>
        <script>
          const payload = ${JSON.stringify(payload)};
          const startPaystack = () => {
            if (!window.PaystackPop) {
              setTimeout(startPaystack, 100);
              return;
            }
            const config = {
              key: payload.key,
              email: payload.email,
              amount: payload.amount,
              currency: payload.currency,
              ref: payload.reference,
              metadata: payload.metadata
            };
            if (payload.channels && payload.channels.length) {
              config.channels = payload.channels;
            }
            if (payload.subaccount) {
              config.subaccount = payload.subaccount;
            }
            if (payload.bearer) {
              config.bearer = payload.bearer;
            }
            const handler = window.PaystackPop.setup({
              ...config,
              callback: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', response }));
              },
              onClose: function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel' }));
              }
            });
            handler.openIframe();
          };
          document.addEventListener('DOMContentLoaded', startPaystack);
        </script>
      </body>
    </html>
  `;

  const handleSubmit = () => {
    if (!formData.branchId || !formData.roomTypeId || !formData.checkIn || !formData.checkOut || !formData.firstName || !formData.lastName || !formData.phone) {
      return Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
    }
    
    if (totalPrice <= 0) {
      return Alert.alert('Error', 'Invalid total price.');
    }

    const reference = `hoteleasy_mobile_${Date.now()}`;
    const paymentData = {
      key: PAYSTACK_PUBLIC_KEY,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      amount: Math.round(totalPrice * 100),
      email: formData.email,
      reference,
      currency: 'NGN',
      subaccount: BRANCH_PAYMENT_CONFIG[formData.branchId]?.subaccount,
      bearer: BRANCH_PAYMENT_CONFIG[formData.branchId]?.subaccount ? 'subaccount' : undefined,
      metadata: {
        custom_fields: [
          { display_name: "Guest Name", variable_name: "guest_name", value: `${formData.firstName} ${formData.lastName}` },
          { display_name: "Mobile Number", variable_name: "mobile_number", value: formData.phone },
          { display_name: "Room Type", variable_name: "room_type", value: formData.roomTypeName },
          { display_name: "Branch", variable_name: "branch", value: formData.branchName },
          { display_name: "Check-in Date", variable_name: "checkin_date", value: formData.checkIn },
          { display_name: "Check-out Date", variable_name: "checkout_date", value: formData.checkOut }
        ]
      }
    };

    if (Platform.OS !== 'web') {
      setPaystackPayload(paymentData);
      setShowPaystackModal(true);
      return;
    }

    popup.checkout({
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      amount: totalPrice,
      email: formData.email,
      reference,
      subaccount: BRANCH_PAYMENT_CONFIG[formData.branchId]?.subaccount,
      metadata: {
        custom_fields: [
          { display_name: "Guest Name", variable_name: "guest_name", value: `${formData.firstName} ${formData.lastName}` },
          { display_name: "Mobile Number", variable_name: "mobile_number", value: formData.phone },
          { display_name: "Room Type", variable_name: "room_type", value: formData.roomTypeName },
          { display_name: "Branch", variable_name: "branch", value: formData.branchName },
          { display_name: "Check-in Date", variable_name: "checkin_date", value: formData.checkIn },
          { display_name: "Check-out Date", variable_name: "checkout_date", value: formData.checkOut }
        ]
      },
      onCancel: () => {
        Alert.alert('Payment Cancelled', 'You cancelled the payment.');
      },
      onSuccess: (res) => {
        processBooking(res);
      }
    });
  };

  const processBooking = async (paymentData) => {
    setLoading(true);
    try {
      // Extract reference from Paystack response
      const reference = paymentData?.transactionRef?.reference || paymentData?.reference || 'unknown';

      await addDoc(collection(db, 'bookings'), {
        userId: user?.uid,
        guestName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        branchId: formData.branchId,
        branchName: formData.branchName,
        roomTypeId: formData.roomTypeId,
        roomTypeName: formData.roomTypeName,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        specialRequests: formData.specialRequests,
        totalPrice: totalPrice,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentRef: reference,
        platform: 'mobile_app',
        createdAt: new Date()
      });
      
      Alert.alert('Success', 'Your booking has been confirmed!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Payment successful but failed to save booking. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve Your Room</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Guest Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#C5A059" />
            <Text style={styles.sectionTitle}>Guest Information</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput 
                style={styles.input} 
                value={formData.firstName}
                onChangeText={t => updateField('firstName', t)}
                placeholder="John"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput 
                style={styles.input} 
                value={formData.lastName}
                onChangeText={t => updateField('lastName', t)}
                placeholder="Doe"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputContainer}>
            <Mail size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.inputWithIcon} 
              value={formData.email}
              onChangeText={t => updateField('email', t)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#64748b"
            />
          </View>

          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Phone size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.inputWithIcon} 
              value={formData.phone}
              onChangeText={t => updateField('phone', t)}
              keyboardType="phone-pad"
              placeholder="+234..."
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        {/* Hotel Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#C5A059" />
            <Text style={styles.sectionTitle}>Hotel Selection</Text>
          </View>

          <Text style={styles.label}>Select Branch *</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowBranchPicker(true)}>
            <Text style={formData.branchName ? styles.selectText : styles.placeholderText}>
              {formData.branchName || "Choose location"}
            </Text>
            <ChevronDown size={20} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={styles.label}>Room Type *</Text>
          <TouchableOpacity 
            style={[styles.selectBtn, !formData.branchId && styles.disabledBtn]} 
            onPress={() => formData.branchId && setShowRoomPicker(true)}
            disabled={!formData.branchId}
          >
            <Text style={formData.roomTypeName ? styles.selectText : styles.placeholderText}>
              {formData.roomTypeName || "Select room"}
            </Text>
            <ChevronDown size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Stay Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={20} color="#C5A059" />
            <Text style={styles.sectionTitle}>Stay Details</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Check-in *</Text>
              <TouchableOpacity onPress={() => setShowCheckInPicker(true)} style={styles.selectBtn} activeOpacity={0.7}>
                <Text style={formData.checkIn ? styles.selectText : styles.placeholderText}>
                  {formData.checkIn || "YYYY-MM-DD"}
                </Text>
                <CalendarIcon size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Check-out *</Text>
              <TouchableOpacity onPress={() => setShowCheckOutPicker(true)} style={styles.selectBtn} activeOpacity={0.7}>
                <Text style={formData.checkOut ? styles.selectText : styles.placeholderText}>
                  {formData.checkOut || "YYYY-MM-DD"}
                </Text>
                <CalendarIcon size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Adults</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowAdultsPicker(true)}>
                <Text style={styles.selectText}>{formData.adults} {parseInt(formData.adults) === 1 ? 'Adult' : 'Adults'}</Text>
                <ChevronDown size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Children</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowChildrenPicker(true)}>
                <Text style={styles.selectText}>{formData.children} {parseInt(formData.children) === 1 ? 'Child' : 'Children'}</Text>
                <ChevronDown size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Special Requests</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.specialRequests}
            onChangeText={t => updateField('specialRequests', t)}
            multiline
            numberOfLines={4}
            placeholder="Any specific needs?"
            placeholderTextColor="#64748b"
          />
        </View>

        {/* Total Price */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Estimate</Text>
          <Text style={styles.totalAmount}>₦{totalPrice.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
        
        <View style={{height: 40}} />
      </ScrollView>

      {/* Branch Picker */}
      <CustomPicker 
        visible={showBranchPicker} 
        onClose={() => setShowBranchPicker(false)}
        title="Select Branch"
        data={branches}
        selectedValue={formData.branchId}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, branchId: item.id, branchName: item.name, roomTypeId: '', roomTypeName: '', roomPrice: 0 }));
          setShowBranchPicker(false);
        }}
      />

      {/* Room Picker */}
      <CustomPicker 
        visible={showRoomPicker} 
        onClose={() => setShowRoomPicker(false)}
        title="Select Room Type"
        data={rooms}
        selectedValue={formData.roomTypeId}
        onSelect={(item) => {
          const isPresidential = item.id?.toLowerCase().includes("presidential") || item.name?.toLowerCase().includes("presidential");
          setFormData(prev => ({
            ...prev,
            roomTypeId: item.id,
            roomTypeName: item.name,
            roomPrice: item.price,
            adults: '2',
            children: isPresidential ? '2' : '1'
          }));
          setShowRoomPicker(false);
        }}
      />

      <CustomPicker
        visible={showAdultsPicker}
        onClose={() => setShowAdultsPicker(false)}
        title="Select Adults"
        data={adultOptions}
        selectedValue={formData.adults}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, adults: item.id }));
          setShowAdultsPicker(false);
        }}
      />

      <CustomPicker
        visible={showChildrenPicker}
        onClose={() => setShowChildrenPicker(false)}
        title="Select Children"
        data={childOptions}
        selectedValue={formData.children}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, children: item.id }));
          setShowChildrenPicker(false);
        }}
      />

      {/* Check-in Picker */}
      <DatePickerModal 
        visible={showCheckInPicker}
        onClose={() => setShowCheckInPicker(false)}
        title="Select Check-in Date"
        selectedDate={formData.checkIn}
        onSelect={(date) => updateField('checkIn', date)}
      />

      {/* Check-out Picker */}
      <DatePickerModal 
        visible={showCheckOutPicker}
        onClose={() => setShowCheckOutPicker(false)}
        title="Select Check-out Date"
        selectedDate={formData.checkOut}
        onSelect={(date) => updateField('checkOut', date)}
      />

      <Modal visible={showPaystackModal} animationType="slide" onRequestClose={() => setShowPaystackModal(false)}>
        <View style={styles.paystackContainer}>
          <View style={styles.paystackHeader}>
            <Text style={styles.paystackTitle}>Paystack Payment</Text>
            <TouchableOpacity onPress={() => setShowPaystackModal(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={['*']}
            source={{ html: paystackPayload ? buildPaystackHtml(paystackPayload) : '' }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data?.type === 'success') {
                  setShowPaystackModal(false);
                  const response = data.response || {};
                  processBooking({
                    reference: response.reference,
                    status: response.status,
                    transaction: response.trans,
                    transactionRef: response
                  });
                } else if (data?.type === 'cancel') {
                  setShowPaystackModal(false);
                  Alert.alert('Payment Cancelled', 'You cancelled the payment.');
                }
              } catch (error) {
                setShowPaystackModal(false);
                Alert.alert('Payment Error', 'Unable to complete payment. Please try again.');
              }
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.paystackLoading}>
                <ActivityIndicator color="#C5A059" size="large" />
              </View>
            )}
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1D3649' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#162b3b' },
  backBtn: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 20 },
  section: { marginBottom: 24, backgroundColor: '#1e293b', padding: 16, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  label: { color: '#cbd5e1', marginBottom: 8, fontSize: 14, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfInput: { flex: 1 },
  input: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, color: '#fff', borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  inputIcon: { marginLeft: 12 },
  inputWithIcon: { flex: 1, padding: 12, color: '#fff' },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  selectText: { color: '#fff' },
  placeholderText: { color: '#64748b' },
  disabledBtn: { opacity: 0.5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#C5A059', padding: 20, borderRadius: 16, marginBottom: 20 },
  totalLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  totalAmount: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 24, maxHeight: '80%', width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  optionSelected: { backgroundColor: 'rgba(197, 160, 89, 0.1)' },
  optionText: { color: '#fff', fontSize: 16 },
  optionTextSelected: { color: '#C5A059', fontWeight: 'bold' },
  optionSubText: { color: '#94a3b8', fontSize: 14 },
  paystackContainer: { flex: 1, backgroundColor: '#0f172a' },
  paystackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#162b3b' },
  paystackTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  paystackLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
