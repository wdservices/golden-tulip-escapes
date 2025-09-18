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
    fullName: "GOLDEN TULIP HOTEL EVERGREEN",
    location: "GRA Phase III, Port Harcourt",
    description: "A serene getaway destination with beautiful landscapes and premium comfort.",
    image: restaurant,
    address: "Plot F35 Woke Street, Off Sani Abacha Road, GRA Phase III, Port Harcourt, Rivers State",
    phone: "+234 906 243 5584",
    email: "reservations@rivotelinternational.com",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    diningOptions: [
      {
        name: "The Ibom Restaurant",
        type: "Fine Dining Restaurant",
        cuisine: "International & Nigerian Cuisine",
        hours: "6:00 AM - 11:00 PM",
        features: [
          "Breakfast Buffet Like a King",
          "À la carte lunch and dinner",
          "Themed dinner nights",
          "Private dining available"
        ]
      },
      {
        name: "The Ice Bar",
        type: "Bar & Lounge",
        cuisine: "Cocktails, Finger Foods, Barbecue & Grills",
        hours: "4:00 PM - 2:00 AM",
        features: [
          "Signature cocktails",
          "Premium spirits",
          "Live music (Friday & Saturday)",
          "Outdoor seating"
        ]
      },
      {
        name: "Room Service",
        type: "In-Room Dining",
        cuisine: "International",
        hours: "24/7",
        features: [
          "Full menu available",
          "Quick delivery",
          "Special dietary options",
          "Late-night menu"
        ]
      }
    ],
    amenities: [
      "Free High-Speed Wi-Fi (Throughout the property)",
      "Swimming Pool (Outdoor pool with poolside service)",
      "Fitness Center (24/7 access with modern equipment)",
      "Restaurant & Bar (International and local cuisine)",
      "Conference Rooms (Fully equipped for business meetings)",
      "Business Center (Printing, copying, and secretarial services)",
      "24/7 Front Desk (Multilingual staff)",
      "Airport Shuttle (Available on request)",
      "Valet Parking (Complimentary parking service)",
      "Room Service (24-hour service)",
      "Laundry & Dry Cleaning (Same-day service available)",
      "24/7 Security (Professional security services)",
      "Concierge Service (Tour arrangements and local recommendations)"
    ],
    roomTypes: [
      {
        name: "Standard Room",
        description: "Elegantly furnished room with complimentary buffet breakfast, access to gym and outdoor swimming pool, and exceptional dining experiences.",
        priceRange: "₦84,200/night",
        capacity: 2,
        features: [
          "Queen-size bed",
          "City view",
          "Free High-speed uninterrupted Wi-Fi",
          "Air conditioning",
          "Flat-screen TV",
          "Work desk",
          "Coffee/tea maker"
        ]
      },
      {
        name: "Deluxe Suite",
        description: "Elegantly furnished suite with premium furnishings and city views.",
        priceRange: "₦122,300/night",
        capacity: 2,
        features: [
          "King-size bed",
          "Premium view",
          "Mini bar",
          "Work desk",
          "Free High-speed uninterrupted Wi-Fi",
          "Air conditioning"
        ]
      },
      {
        name: "Executive Suite",
        description: "Luxurious suites with separate living area, premium amenities, concierge service, premium furnishings, and complimentary breakfast.",
        priceRange: "₦165,000/night",
        capacity: 3,
        features: [
          "Premium amenities",
          "Concierge service",
          "Premium furnishings",
          "Complimentary breakfast"
        ]
      }
    ],
    events: [
      {
        type: "Corporate Events",
        capacity: "50 - 150 guests",
        priceRange: "From ₦500,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts with markers"
        ]
      },
      {
        type: "Special Occasions",
        capacity: "10 - 200 guests",
        priceRange: "From N100,000 to ₦400,000",
        features: [
          "Private dining rooms",
          "Custom decoration",
          "Themed events",
          "Entertainment options",
          "Custom menu planning",
          "Room setup and cleanup",
          "Audiovisual equipment",
          "Dedicated service staff",
          "Cake and dessert options"
        ]
      }
    ],
    operatingHours: {
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      frontDesk: "24/7",
      restaurant: "6:30 AM - 10:30 PM",
      bar: "10:00 AM - 12:00 AM"
    },
    paymentMethods: [
      "Cash (NGN, USD)",
      "Credit/Debit Cards (Visa, MasterCard, Verve)",
      "Bank Transfer",
      "Hotel Vouchers"
    ],
    policies: [
      "Cancellation: 48 hours prior to arrival",
      "Children: Under 12 stay free with parents with breakfast at no extra cost.",
      "Pets: Not allowed",
      "Smoking: Designated areas only",
      "ID: Valid photo ID required at check-in"
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
