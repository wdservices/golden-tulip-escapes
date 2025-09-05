import { Branch } from "@/types/branch";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import hotelLobby from "@/assets/hotel-lobby.jpg";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";
// Using existing images for pool and spa as placeholders
const pool = hotelExterior;
const spa = luxurySuite;

const branches: Branch[] = [
  {
    id: "main",
    name: "GRA",
    fullName: "Golden Tulip GRA",
    location: "Government Reserved Area, Port Harcourt",
    description: "Our flagship location offering premium luxury and world-class amenities in the heart of the city.",
    image: hotelExterior,
    address: "123 GRA Phase 2, Port Harcourt, Rivers State, Nigeria",
    phone: "+234 803 123 4567",
    email: "gra@goldentulip.com",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Fitness Center",
      "Restaurant & Bar",
      "Spa & Wellness Center",
      "24/7 Room Service",
      "Business Center",
      "Free Parking"
    ],
    roomTypes: [
      {
        name: "Deluxe Room",
        description: "Elegant room with a king-size bed and city view",
        priceRange: "₦45,000 - ₦65,000",
        capacity: 2
      },
      {
        name: "Executive Suite",
        description: "Spacious suite with separate living area and premium amenities",
        priceRange: "₦75,000 - ₦95,000",
        capacity: 2
      },
      {
        name: "Presidential Suite",
        description: "Luxurious suite with premium furnishings and panoramic views",
        priceRange: "₦150,000 - ₦200,000",
        capacity: 4
      }
    ],
    gallery: [hotelExterior, hotelLobby, luxurySuite, restaurant, pool, spa]
  },
  {
    id: "waterlines",
    name: "Waterlines",
    fullName: "Golden Tulip Waterlines",
    location: "Waterlines, Port Harcourt",
    description: "Experience waterfront luxury with stunning views of the Bonny River.",
    image: hotelLobby,
    address: "45 Marine Base Road, Waterlines, Port Harcourt, Nigeria",
    phone: "+234 803 234 5678",
    email: "waterlines@goldentulip.com",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    amenities: [
      "Free WiFi",
      "Rooftop Pool",
      "Fitness Center",
      "Rooftop Restaurant & Bar",
      "Spa & Wellness Center",
      "24/7 Room Service",
      "Business Center",
      "Free Parking"
    ],
    roomTypes: [
      {
        name: "Superior Room",
        description: "Comfortable room with modern amenities and city view",
        priceRange: "₦40,000 - ₦60,000",
        capacity: 2
      },
      {
        name: "Deluxe Room with River View",
        description: "Spacious room with stunning views of the Bonny River",
        priceRange: "₦55,000 - ₦75,000",
        capacity: 2
      },
      {
        name: "Executive Suite",
        description: "Luxurious suite with separate living area and premium amenities",
        priceRange: "₦90,000 - ₦120,000",
        capacity: 2
      }
    ],
    gallery: [hotelLobby, pool, luxurySuite, restaurant, spa, hotelExterior]
  },
  {
    id: "airforce",
    name: "Airforce Base",
    fullName: "Golden Tulip Airforce Base",
    location: "Airforce Base, Port Harcourt",
    description: "Premium business hotel located near the airport with easy access to major business districts.",
    image: luxurySuite,
    address: "Airforce Base, Airport Road, Port Harcourt, Nigeria",
    phone: "+234 803 345 6789",
    email: "airforce@goldentulip.com",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Fitness Center",
      "Restaurant & Bar",
      "Conference Facilities",
      "24/7 Room Service",
      "Business Center",
      "Airport Shuttle",
      "Free Parking"
    ],
    roomTypes: [
      {
        name: "Standard Room",
        description: "Comfortable room with essential amenities",
        priceRange: "₦35,000 - ₦50,000",
        capacity: 2
      },
      {
        name: "Deluxe Room",
        description: "Spacious room with modern amenities and work desk",
        priceRange: "₦50,000 - ₦70,000",
        capacity: 2
      },
      {
        name: "Executive Room",
        description: "Premium room with additional workspace and amenities",
        priceRange: "₦70,000 - ₦90,000",
        capacity: 2
      }
    ],
    gallery: [luxurySuite, hotelLobby, hotelExterior, restaurant, pool, spa]
  },
  {
    id: "oyigbo",
    name: "Oyigbo",
    fullName: "Golden Tulip Oyigbo",
    location: "Oyigbo, Rivers State",
    description: "A serene getaway destination with beautiful landscapes and premium comfort.",
    image: restaurant,
    address: "KM 5, East-West Road, Oyigbo, Rivers State, Nigeria",
    phone: "+234 803 456 7890",
    email: "oyigbo@goldentulip.com",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Fitness Center",
      "Restaurant & Bar",
      "Spa & Wellness Center",
      "24/7 Room Service",
      "Garden & Outdoor Seating",
      "Free Parking"
    ],
    roomTypes: [
      {
        name: "Classic Room",
        description: "Comfortable room with garden or pool view",
        priceRange: "₦30,000 - ₦45,000",
        capacity: 2
      },
      {
        name: "Deluxe Room",
        description: "Spacious room with premium amenities and scenic views",
        priceRange: "₦45,000 - ₦65,000",
        capacity: 2
      },
      {
        name: "Family Suite",
        description: "Spacious suite perfect for families with separate living area",
        priceRange: "₦80,000 - ₦100,000",
        capacity: 4
      }
    ],
    gallery: [restaurant, pool, spa, hotelExterior, hotelLobby, luxurySuite]
  }
];

export const getBranchById = (id: string): Branch | undefined => {
  return branches.find(branch => branch.id === id);
};

export const getAllBranches = (): Branch[] => {
  return branches;
};

// Get all branches except the main (GRA) branch
export const getMainBranches = (): Branch[] => {
  return branches.filter(branch => branch.id !== 'main');
};

// Get only the main branch
export const getMainBranch = (): Branch | undefined => {
  return branches.find(branch => branch.id === 'main');
};
