import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Maximize2, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MiniAdsBanner({ imageSource, onExpand, onClose }) {
  const [imgError, setImgError] = React.useState(false);
  
  const displaySource = imgError ? require('../assets/branches/evergreen/deluxe_room.webp') : imageSource;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.contentContainer} onPress={onExpand}>
        <View style={styles.imageWrapper}>
          <Image 
            source={displaySource} 
            style={styles.image} 
            resizeMode="cover" 
            onError={(e) => {
              console.log("MiniAdsBanner Image Error:", e.nativeEvent.error);
              setImgError(true);
            }}
          />
        </View>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>VIEW OFFER</Text>
        </View>
        
        <View style={styles.iconContainer}>
          <Maximize2 size={12} color="#fff" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={12} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above bottom navigation
    left: 20,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  contentContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#C5A059', // Gold border
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#C5A059',
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 2,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    elevation: 9,
  }
});
