import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Linking, Keyboard, Pressable } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Forgot Password State
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);

  const handleSubmit = async () => {
    if (isLogin) {
      if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    } else {
      if (!name || !email || !phone || !password) return Alert.alert('Error', 'Please fill in all fields');
      if (!termsAccepted) return Alert.alert('Error', 'You must accept the Terms and Conditions');
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Profile
        await updateProfile(user, { displayName: name });

        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: name,
          email: email,
          phone: phone,
          photoURL: user.photoURL || null,
          role: 'user',
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: {}
        });
      }
    } catch (error) {
      Alert.alert(isLogin ? 'Login Failed' : 'Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      return Alert.alert('Error', 'Please enter your email address');
    }
    
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setIsResetSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <ImageBackground 
        source={require('../assets/branches/garden-city/1670228609dsc_1161885e.jpg')} 
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient colors={['rgba(29, 54, 73, 0.7)', 'rgba(29, 54, 73, 0.95)']} style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.mainScrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Golden Tulip</Text>
              <Text style={styles.subtitle}>Luxury Accommodation</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.form}>
                <View style={styles.authToggle}>
                  <TouchableOpacity
                    style={[styles.toggleOption, isLogin && styles.toggleActive]}
                    onPress={() => setIsLogin(true)}
                  >
                    <Text style={[styles.toggleOptionText, isLogin && styles.toggleActiveText]}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleOption, !isLogin && styles.toggleActive]}
                    onPress={() => setIsLogin(false)}
                  >
                    <Text style={[styles.toggleOptionText, !isLogin && styles.toggleActiveText]}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.welcome}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
                <Text style={styles.instruction}>
                  {isLogin ? 'Enter your credentials to sign in' : 'Fill in the details to get started'}
                </Text>

                {!isLogin && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#94a3b8"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      placeholderTextColor="#94a3b8"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.inputIconButton} onPress={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                  </TouchableOpacity>
                </View>

                {!isLogin && (
                  <View style={styles.checkboxRow}>
                    <TouchableOpacity
                      style={[styles.checkbox, termsAccepted && styles.checkboxActive]}
                      onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                      {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>
                      I have read and agree to the{' '}
                      <Text style={styles.checkboxLink} onPress={() => Linking.openURL('https://goldentulipportharcourt.com/terms')}>
                        Terms and Conditions
                      </Text>
                    </Text>
                  </View>
                )}

                {isLogin && (
                  <TouchableOpacity 
                    style={styles.forgotPassContainer} 
                    onPress={() => {
                      setResetEmail(email);
                      setResetModalVisible(true);
                      setIsResetSent(false);
                    }}
                  >
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Forgot Password Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={resetModalVisible}
          onRequestClose={() => setResetModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setResetModalVisible(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <Pressable onPress={() => {}} style={styles.modalContent}>
                {isResetSent ? (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Check Your Email</Text>
                      <TouchableOpacity onPress={() => { setResetModalVisible(false); setIsResetSent(false); setResetEmail(''); }}>
                        <X size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.successIconContainer}>
                      <Text style={styles.successIcon}>✓</Text>
                    </View>

                    <Text style={styles.modalText}>
                      We've sent a password reset link to:
                    </Text>
                    <Text style={styles.resetEmailText}>{resetEmail}</Text>
                    
                    <Text style={styles.modalNote}>
                      Please check your inbox and also your spam/junk folder if you don't see it.
                    </Text>

                    <TouchableOpacity 
                      style={styles.button} 
                      onPress={() => { setResetModalVisible(false); setIsResetSent(false); setResetEmail(''); }}
                    >
                      <Text style={styles.buttonText}>Back to Sign In</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Reset Password</Text>
                      <TouchableOpacity onPress={() => setResetModalVisible(false)}>
                        <X size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.modalText}>
                      Enter your email address and we'll send you a link to reset your password.
                    </Text>
                    
                    <Text style={styles.modalNote}>
                      Note: If you don't see the email, please check your spam folder.
                    </Text>

                    <TextInput
                      style={styles.modalInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#94a3b8"
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                    <TouchableOpacity 
                      style={styles.button} 
                      onPress={handlePasswordReset}
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#1D3649' },
  container: { flex: 1 },
  mainScrollView: { flexGrow: 1, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#e2e8f0', marginTop: 5 },
  formContainer: { paddingHorizontal: 20, flex: 1, justifyContent: 'center' },
  scrollContent: { paddingBottom: 20 },
  form: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  authToggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 4, marginBottom: 24 },
  toggleOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: '#C5A059' },
  toggleOptionText: { color: '#94a3b8', fontWeight: '600' },
  toggleActiveText: { color: '#fff', fontWeight: 'bold' },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  instruction: { fontSize: 14, color: '#cbd5e1', marginBottom: 24 },
  input: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputField: { flex: 1, padding: 16, color: '#fff' },
  inputIconButton: { paddingHorizontal: 16, paddingVertical: 12 },
  button: { backgroundColor: '#C5A059', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  toggleButton: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#C5A059', fontSize: 14, fontWeight: '600' },
  forgotPassContainer: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotPassText: { color: '#C5A059', fontSize: 14 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxActive: { backgroundColor: '#C5A059', borderColor: '#C5A059' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, color: '#cbd5e1', fontSize: 13, lineHeight: 18 },
  checkboxLink: { color: '#C5A059', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalKeyboardView: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1D3649', width: '85%', maxWidth: 400, padding: 28, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  modalText: { color: '#cbd5e1', marginBottom: 16, lineHeight: 22, fontSize: 15 },
  modalNote: { color: '#94a3b8', fontSize: 13, fontStyle: 'italic', marginBottom: 20 },
  modalInput: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, color: '#fff', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', fontSize: 16 },
  successIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#C5A059', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  successIcon: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  resetEmailText: { color: '#C5A059', fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }
});
