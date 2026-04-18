import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function FeedbackScreen({ navigation }) {
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async () => {
    if (!type || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const user = auth.currentUser;

    try {
      await addDoc(collection(db, 'feedback'), {
        type,
        message: message.trim(),
        userId: user ? user.uid : 'anonymous',
        userEmail: user ? user.email : 'anonymous@example.com',
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Share Your Feedback</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <MessageSquare size={48} color="#C5A059" />
          </View>
          <Text style={styles.subtitle}>
            We value your opinion. Please let us know about your stay and services at Golden Tulip.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'suggestion' && styles.typeButtonActive]}
                onPress={() => setType('suggestion')}
              >
                <Text style={[styles.typeButtonText, type === 'suggestion' && styles.typeButtonTextActive]}>Suggestion</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'complaint' && styles.typeButtonActive]}
                onPress={() => setType('complaint')}
              >
                <Text style={[styles.typeButtonText, type === 'complaint' && styles.typeButtonTextActive]}>Complaint</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'appreciation' && styles.typeButtonActive]}
                onPress={() => setType('appreciation')}
              >
                <Text style={[styles.typeButtonText, type === 'appreciation' && styles.typeButtonTextActive]}>Appreciation</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {type === 'suggestion' ? 'Your Suggestion' : 
               type === 'complaint' ? 'Your Complaint' : 
               type === 'appreciation' ? 'Your Appreciation' : 'Your Message'}
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder={`Enter your ${type || 'message'} here...`}
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <CheckCircle size={48} color="#C5A059" />
            </View>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalText}>Thank you for your feedback!</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                setMessage('');
                setType('');
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3649',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#C5A059',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#cbd5e1',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  typeButtonText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitButton: {
    backgroundColor: '#C5A059',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalIconContainer: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#C5A059',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
