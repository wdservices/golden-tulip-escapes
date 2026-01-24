import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your Firebase configuration (from application)
const firebaseConfig = {
  apiKey: "AIzaSyBqcue6P_Gcl8E9mGLsxDLdJRlSAbSwVoI",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "101687023536",
  appId: "1:101687023536:web:5ecb99a06a824ca219e875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Corporate halls data to be added to Firestore
const corporateHallsData = [
  {
    id: "anioma-hall",
    name: "Anioma Restaurant",
    capacity: 500,
    priceRange: "From ₦1,000,000 per day",
    description: "A grand restaurant perfect for large corporate events, conferences, and celebrations. Features state-of-the-art facilities and elegant décor. Can also be arranged to hall standard for various events.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage"],
    location: "Ground Floor, Main Building",
    size: "2,500 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7HvLS?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1",
    type: "hall"
  },
  {
    id: "abuja-hall",
    name: "Abuja Hall",
    capacity: 300,
    priceRange: "From ₦750,000 per day",
    description: "An elegant mid-sized hall ideal for corporate meetings, seminars, and private functions. Modern amenities with professional ambiance.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service"],
    location: "First Floor, East Wing",
    size: "1,800 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmv?logo=0&info=1&fs=1&vr=0&sd=1&autop=90&thumbs=1&autorotate=0.16",
    type: "hall"
  },
  {
    id: "lagos-hall",
    name: "Lagos Hall",
    capacity: 200,
    priceRange: "From ₦400,000 per day",
    description: "A sophisticated smaller hall perfect for intimate corporate gatherings, board meetings, and executive events.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector"],
    location: "Second Floor, West Wing",
    size: "1,200 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7HpmX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1",
    type: "hall"
  },
  {
    id: "kano-hall",
    name: "Kano Hall",
    capacity: 150,
    priceRange: "From ₦300,000 per day",
    description: "A cozy and professional space designed for small to medium corporate events, training sessions, and workshops.",
    features: ["Air Conditioning", "Free WiFi", "Sound System", "Projector"],
    location: "First Floor, Central Wing",
    size: "900 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpmq?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1",
    type: "hall"
  },
  {
    id: "rivers-hall-boardroom",
    name: "Rivers Hall - Boardroom",
    capacity: 25,
    priceRange: "From ₦400,000 per day",
    description: "An executive boardroom designed for high-level discussions and strategic planning with premium amenities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Sound System", "Projector", "Catering Service", "Executive Seating"],
    location: "Executive Floor, Premium Wing",
    size: "800 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7Hpm9?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1",
    type: "hall"
  },
  {
    id: "the-pavilion-event-centre",
    name: "The Pavilion/ Event Centre",
    capacity: 300,
    priceRange: "From ₦3,000,000 per day",
    description: "Our largest venue, suitable for grand corporate events, exhibitions, and large-scale conferences with world-class facilities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Stage", "VIP Lounge", "Exhibition Space", "Multiple Breakout Rooms"],
    location: "Ground Floor, Grand Wing",
    size: "5,000 sq ft",
    kuulaEmbedUrl: "https://kuula.co/share/collection/7HvmX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1",
    type: "hall"
  },
  {
    id: "the-marquee",
    name: "The Marquee",
    capacity: 100,
    priceRange: "₦500,000 per day",
    description: "A flexible outdoor/indoor space, perfect for corporate receptions and product launches. Features elegant tent-style architecture with modern amenities.",
    features: ["Air Conditioning", "Free WiFi", "Parking", "Catering Service", "Sound System", "Projector", "Outdoor Access", "Garden View"],
    location: "Garden Terrace, West Wing",
    size: "3,000 sq ft",
    kuulaEmbedUrl: "",
    type: "hall"
  }
];

async function addCorporateHallsToFirestore() {
  try {
    console.log("Adding corporate halls to Firestore...");
    
    // Add halls to a separate collection
    for (const hall of corporateHallsData) {
      const hallRef = doc(db, "halls", hall.id);
      await setDoc(hallRef, hall);
      console.log(`Added hall: ${hall.name}`);
    }
    
    console.log("Corporate halls successfully added to Firestore!");
    console.log("\nNext steps:");
    console.log("1. Update CorporateHallDetailPage.tsx to fetch from Firestore");
    console.log("2. Update CorporateHallsPage.tsx to fetch from Firestore");
    
  } catch (error) {
    console.error("Error adding corporate halls to Firestore:", error);
  }
}

addCorporateHallsToFirestore();