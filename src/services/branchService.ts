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
    id: "port-harcourt",
    name: "Port Harcourt Hotel",
    fullName: "GOLDEN TULIP PORT HARCOURT HOTEL",
    location: "GRA Phase II, Port Harcourt",
    description: "Our flagship location offering premium luxury and world-class amenities in the heart of the city.",
    image: hotelExterior,
    address: "1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State",
    phone: "+234 905 777 7780",
    email: "reservations@goldentulipportharcourt.com",
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
    id: "stadium-31",
    name: "31 Stadium Rd.",
    fullName: "GOLDEN TULIP PORT HARCOURT, 31 STADIUM RD.",
    location: "Stadium Road, Port Harcourt",
    description: "Experience luxury with stunning views and premium amenities in the heart of Port Harcourt.",
    image: hotelLobby,
    address: "31 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
    phone: "+234 704 338 3142",
    email: "reservationsgt@rivotels.com",
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
        description: "Spacious room with stunning views",
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
    id: "garden-city",
    name: "Garden City",
    fullName: "GOLDEN TULIP PORT HARCOURT, GARDEN CITY",
    location: "Stadium Road, Port Harcourt",
    description: "Premium business hotel with easy access to major business districts and attractions.",
    image: luxurySuite,
    address: "63 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
    phone: "+234 704 215 6775",
    email: "reservations@rivotels.com",
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
    id: "evergreen",
    name: "Evergreen",
    fullName: "GOLDEN TULIP PORT HARCOURT, EVERGREEN.",
    location: "GRA Phase III, Port Harcourt",
    description: "A serene getaway destination with beautiful landscapes and premium comfort.",
    image: restaurant,
    address: "Plot F35 Woke Street, Off Sani Abacha Road, GRA Phase III, Port Harcourt, Rivers State",
    phone: "+234 906 243 5584",
    email: "reservations@rivotelinternational.com",
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

// Get all branches
export const getMainBranches = (): Branch[] => {
  return branches;
};

// Get only the main branch
export const getMainBranch = (): Branch | undefined => {
  return branches.find(branch => branch.id === 'main');
};
