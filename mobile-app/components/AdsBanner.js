import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';

export default function AdsBanner({ imageSource, title, description, onClose, autoHideAfterMs = 6000 }) {
  const [visible, setVisible] = useState(true);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, autoHideAfterMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHideAfterMs, onClose]);

  if (!visible) return null;

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    onClose && onClose();
  };

  const displaySource = imgError ? require('../assets/branches/evergreen/deluxe room.webp') : imageSource;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image 
              source={displaySource} 
              style={styles.image} 
              resizeMode="cover" 
              onError={(e) => {
                console.log("AdsBanner Image Error:", e.nativeEvent.error);
                setImgError(true);
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            
            <TouchableOpacity style={styles.ctaButton} onPress={handleClose}>
              <Text style={styles.ctaText}>View Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#C5A059',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
