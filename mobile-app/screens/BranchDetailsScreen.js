import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BRANCH_IMAGES } from '../data/BranchImages';

export default function BranchDetailsScreen({ route, navigation }) {
  const { branch } = route.params;
  const localGallery = BRANCH_IMAGES[branch.id] || [];
  
  // Combine main branch image with local gallery images
  // Using a Set to avoid potential duplicates if branch.image is also in the gallery
  const initialImages = [branch.image, ...localGallery];
  
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchBranchImages();
  }, []);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setSelectedIndex(roundIndex);
  };

  const nextImage = () => {
    if (selectedIndex < images.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const prevImage = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const fetchBranchImages = async () => {
    try {
      // Fetch rooms to get more images for the gallery
      // We still fetch from Firebase, but append to local images
      const q = query(collection(db, 'branches', branch.id, 'rooms'));
      const snapshot = await getDocs(q);
      
      const roomImages = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.images && Array.isArray(data.images)) {
          roomImages.push(...data.images);
        } else if (data.image) {
          roomImages.push(data.image);
        }
      });
      
      // Remove duplicates and add to state
      const uniqueImages = [...new Set(roomImages)];
      if (uniqueImages.length > 0) {
        setImages(prev => {
          // Filter out any Firebase images that might already match local ones (unlikely but good practice)
          const newImages = uniqueImages.filter(img => !prev.includes(img));
          return [...prev, ...newImages];
        });
      }
    } catch (error) {
      console.error("Error fetching branch images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{branch.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <TouchableOpacity onPress={() => setSelectedIndex(0)} activeOpacity={0.9} style={{ flex: 1 }}>
            <Image source={branch.image} style={styles.heroImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{branch.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#C5A059" />
              <Text style={styles.locationText}>Port Harcourt, Nigeria</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gallery</Text>
        {loading ? (
          <ActivityIndicator color="#C5A059" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.galleryGrid}>
            {images.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.galleryItem}
                onPress={() => setSelectedIndex(index)}
              >
                <Image 
                  source={typeof img === 'string' ? { uri: img } : img} 
                  style={styles.galleryImage} 
                />
              </TouchableOpacity>
            ))}
            {images.length === 0 && <Text style={styles.emptyText}>No additional images available.</Text>}
          </View>
        )}
      </ScrollView>

      {/* Full Screen Image Viewer */}
      <Modal 
        visible={selectedIndex >= 0} 
        transparent={true} 
        onRequestClose={() => setSelectedIndex(-1)}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setSelectedIndex(-1)}
          >
            <X size={30} color="#fff" />
          </TouchableOpacity>
          
          {selectedIndex >= 0 && (
            <Image 
              source={typeof images[selectedIndex] === 'string' ? { uri: images[selectedIndex] } : images[selectedIndex]} 
              style={styles.fullScreenImage} 
              resizeMode="contain"
            />
          )}

          {selectedIndex > 0 && (
            <TouchableOpacity style={[styles.navButton, styles.leftNav]} onPress={prevImage}>
              <ChevronLeft size={30} color="#fff" />
            </TouchableOpacity>
          )}
          
          {selectedIndex >= 0 && selectedIndex < images.length - 1 && (
            <TouchableOpacity style={[styles.navButton, styles.rightNav]} onPress={nextImage}>
              <ChevronRight size={30} color="#fff" />
            </TouchableOpacity>
          )}
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
  heroSection: { height: 250, borderRadius: 20, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#cbd5e1', fontSize: 14 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryItem: { width: '31%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  galleryImage: { width: '100%', height: '100%' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  fullScreenImage: { width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    zIndex: 10,
    elevation: 10,
  },
  leftNav: { left: 20 },
  rightNav: { right: 20 },
});
