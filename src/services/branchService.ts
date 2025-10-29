import { Branch, BranchMeta } from "@/types/branch";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import hotelLobby from "@/assets/hotel-lobby.jpg";
import luxurySuite from "@/assets/luxury-suite.jpg";
import restaurant from "@/assets/restaurant.jpg";
// Using existing images for pool and spa as placeholders
const pool = hotelExterior;
const spa = luxurySuite;

// Function to get branch metadata for branch selector
export async function getBranches(): Promise<BranchMeta[]> {
  try {
    // Always start with static branch data to ensure all branches are available
    const staticBranches = branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      fullName: branch.fullName,
      // Use image as logo fallback
      logo: branch.image
    }));

    // Try to fetch from Firestore and merge with static data
    const branchesCollection = collection(db, 'branches');
    const branchSnapshot = await getDocs(branchesCollection);
    
    if (!branchSnapshot.empty) {
      const firestoreBranches = branchSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          fullName: data.fullName || data.name || '',
          logo: data.logo || '',
          color: data.color || ''
        } as BranchMeta;
      });

      // Merge Firestore data with static data, preferring Firestore data when available
      const mergedBranches = staticBranches.map(staticBranch => {
        const firestoreBranch = firestoreBranches.find(fb => fb.id === staticBranch.id);
        return firestoreBranch || staticBranch;
      });

      // Add any Firestore branches that don't exist in static data
      const additionalBranches = firestoreBranches.filter(
        fb => !staticBranches.find(sb => sb.id === fb.id)
      );

      return [...mergedBranches, ...additionalBranches];
    }
    
    // Return static data if Firestore is empty
    return staticBranches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    // Fallback to static data on error
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      fullName: branch.fullName,
      logo: branch.image
    }));
  }
}

const branches: Branch[] = [
  {
    id: "evo-road",
    name: "Evo Road",
    fullName: "GOLDEN TULIP PORT HARCOURT HOTEL",
    location: "GRA Phase II, Port Harcourt",
    description: "A premium 4-star hotel in the heart of Port Harcourt, offering modern rooms, fine dining, meeting halls, gym, spa services, and world class hospitality for business and leisure travelers.",
    image: hotelExterior,
    address: "1c Evo Crescent Off Evo Road, GRA Phase II, Port Harcourt, Rivers State",
    phone: "+234 905 777 7780, +234 905 777 7782",
    email: "reservations@goldentulipportharcourt.com, fom@goldentulipportharcourt.com",
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
    description: "A stylish hotel designed for comfort and convenience, blending contemporary luxury with personalized service in a greenery & serene Port Harcourt location.",
    image: hotelLobby,
    address: "31 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
    phone: "+234 704 338 3142, +234 704 338 3141",
    email: "reservationsgt@rivotels.com, fomgt@rivotels.com",
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
        name: "Deluxe Room",
        description: "Our Deluxe Rooms are complemented with modern and luxurious amenities for a wonderful stay.",
        priceRange: "₦120,500 (₦86,250 discounted)",
        capacity: 2,
        features: [
          "Car hire",
          "Flat Tv",
          "Laundry and dry cleaning",
          "Internet – Wifi",
          "Coffee and tea",
          "Air Condition",
          "Work Desk",
          "Room service available 24hrs",
          "Access with card",
          "Well Trained Security Guard"
        ]
      },
      {
        name: "Executive Deluxe Room",
        description: "Our Executive Rooms are spacious, nice and comfortable. The rooms gives access to our gym or swimming pool. The rooms are spacious with a read area.",
        priceRange: "₦135,500 (₦97,750 discounted)",
        capacity: 2,
        features: [
          "Car hire",
          "Refrigerator",
          "Safe",
          "Flat Tv",
          "Laundry and dry cleaning",
          "Internet – Wifi",
          "Coffee and tea",
          "Swimming Pool",
          "Air Condition",
          "Work Desk",
          "Room service available 24hrs",
          "Access with card",
          "Well Trained Security Guard"
        ]
      },
      {
        name: "Executive Twin Room",
        description: "Need more fun, our Executive Twin Rooms give comfort and space to suite your relaxation need. Enjoy complimentary Breakfast with access to pool and gym facilities.",
        priceRange: "₦154,700 (₦115,000 discounted)",
        capacity: 2,
        features: [
          "Car hire",
          "Refrigerator",
          "Safe",
          "Flat Tv",
          "Laundry and dry cleaning",
          "Internet – Wifi",
          "Coffee and tea",
          "Air Condition",
          "Work Desk",
          "Swimming Pool",
          "Room service available 24hrs",
          "Access with card",
          "Well Trained Security Guard"
        ]
      },
      {
        name: "Super Executive Room",
        description: "The Super Executive Suites are always welcoming with nice furniture, either for business or pleasure the suites are always there to make you feel at home.",
        priceRange: "₦197,200 (₦138,000 discounted)",
        capacity: 2,
        features: [
          "Car hire",
          "Refrigerator",
          "Safe",
          "Flat Tv",
          "Laundry and dry cleaning",
          "Internet – Wifi",
          "Coffee and tea",
          "Air Condition",
          "Work Desk",
          "Swimming Pool",
          "Room service available 24hrs",
          "Access with card",
          "Well Trained Security Guard"
        ]
      },
      {
        name: "Royal Suites Room",
        description: "Pamper yourself in our well sized Royal Suite. Your nights will be enjoyable with inour nice laid king Beds. Have your meetings or leisure with family and friends in a cossy and relaxed atmosphere. Nice furniture access to pool and gym, Free Wifi, Breakfast, etc",
        priceRange: "₦272,300 (₦161,000 discounted)",
        capacity: 3,
        features: [
          "Car hire",
          "Refrigerator",
          "Safe",
          "Flat Tv",
          "Laundry and dry cleaning",
          "Internet – Wifi",
          "Coffee and tea",
          "Air Condition",
          "Work Desk",
          "Swimming Pool",
          "Room service available 24hrs",
          "Access with card",
          "Well Trained Security Guard"
        ]
      }
    ],
    diningOptions: [
      {
        name: "Restaurant",
        type: "Restaurant",
        cuisine: "INTERNATIONAL & NIGERIAN CUISINE",
        hours: "6:00 AM - 11:00 PM",
        features: [
          "Breakfast buffet",
          "À la carte lunch and dinner",
          "Themed dinner nights",
          "Private dining available",
          "Private Birthday Parties"
        ]
      },
      {
        name: "Bar",
        type: "Bar",
        cuisine: "Beverages",
        hours: "6:00 AM - 11:00 PM",
        features: [
          "Juice",
          "Soft Drinks & Energy Drinks",
          "Mock tails & Cocktails",
          "Brandy & Vodka",
          "Champagne & Sparkling Wines",
          "Outdoor Seating",
          "Karaoke Session",
          "Swimming"
        ]
      }
    ],
    events: [
      {
        type: "CONFERENCE HALL",
        capacity: "10 - 50 guests",
        priceRange: "₦300,000",
        features: [
          "Conference Meetings",
          "Private Lunch & Dinner",
          "Lecture hall",
          "Corporate Meetings",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Flip charts",
          "Convenience (Toilet)"
        ]
      },
      {
        type: "SHOLLY HALL",
        capacity: "50 - 120 persons",
        priceRange: "₦450,000",
        features: [
          "Conference Meetings",
          "Private Lunch & Dinner",
          "Lecture hall",
          "Corporate Meetings",
          "Birthdays & Weddings",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Flip charts",
          "Convenience (Toilet)"
        ]
      },
      {
        type: "LOLLY HALL",
        capacity: "50 - 150 persons",
        priceRange: "₦550,000",
        features: [
          "Conference Meetings",
          "Private Lunch & Dinner",
          "Lecture hall",
          "Corporate Meetings",
          "Birthdays & Weddings",
          "Church Services & Child Dedication",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Flip charts",
          "Convenience (Toilet)"
        ]
      },
      {
        type: "DOME HALL",
        capacity: "1000 persons",
        priceRange: "₦2,500,000",
        features: [
          "Concert & Shows",
          "Conference Meetings",
          "Private Lunch & Dinner",
          "Lecture hall",
          "Corporate Meetings",
          "Birthdays & Weddings",
          "Church Services & Child Dedication",
          "Catering services",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Flip charts",
          "Convenience (Toilet)"
        ]
      }
    ],
    operatingHours: {
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      frontDesk: "24/7",
      restaurant: "6:30 AM – 9:30AM (Breakfast), 6:30 AM – 10:30AM (Breakfast at Weekends), 12PM - 3:30 PM (Lunch), 6PM – 10PM (Dinner)",
      bar: "10:00 AM - 11:00 PM"
    },
    paymentMethods: [
      "Cash (NGN, USD)",
      "Credit/Debit Cards (Visa, MasterCard, Verve)",
      "Bank Transfers"
    ],
    policies: [
      "Cancellation: 48 hours prior to arrival",
      "Children: Under 12 stay free with parents",
      "Pets: Not allowed",
      "Smoking: Not allowed in the room only at designated areas only",
      "ID: Valid photo ID required at check-in"
    ],
    gallery: [hotelLobby, pool, luxurySuite, restaurant, spa, hotelExterior]
  },
  {
    id: "garden-city",
    name: "Garden City",
    fullName: "GOLDEN TULIP PORT HARCOURT, GARDEN CITY",
    location: "Garden City, Port Harcourt",
    description: "A boutique hotel featuring spacious rooms, a pool, gym, and exceptional dining experiences for both corporate and leisure guests.",
    image: luxurySuite,
    address: "63 Ken Saro Wiwa, Stadium Road, Port Harcourt, Rivers State",
    phone: "+234 704 215 6775, +234 906 243 5585",
    email: "reservations@rivotels.com, fom@rivotels.com",
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    amenities: [
      "Free High-Speed Wi-Fi (Throughout the property)",
      "Swimming Pool (Outdoor pool with poolside service)",
      "Fitness Center (24/7 access with modern equipment)",
      "Spa & Wellness Center (Massage, facials, and body treatments)",
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
    diningOptions: [
      {
        name: "The Wazobia Restaurant",
        type: "Fine Dining Restaurant",
        cuisine: "International & Nigerian Cuisine",
        hours: "6:00 AM - 11:00 PM",
        features: [
          "Breakfast buffet",
          "À la carte lunch and dinner",
          "Themed dinner nights",
          "Private dining available"
        ]
      },
      {
        name: "The Tulip Lounge",
        type: "Bar & Lounge",
        cuisine: "Cocktails & Light Bites",
        hours: "5:00 PM - 2:00 AM",
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
    spaServices: [
      {
        name: "Relaxation Massage",
        duration: "60 mins",
        price: "₦25,000",
        description: "A soothing full-body massage to help you unwind and relax after a long day."
      },
      {
        name: "Deep Tissue Massage",
        duration: "90 mins",
        price: "₦35,000",
        description: "Therapeutic massage for deep muscle relief, perfect for tension and stress relief."
      }
    ],
    roomTypes: [
      {
        name: "Standard Room",
        description: "Comfortable and well-appointed rooms with modern amenities.",
        priceRange: "₦91,831 per night",
        capacity: 2,
        features: [
          "Size: 30 sqm",
          "Queen-size bed",
          "City view",
          "Free Wi-Fi",
          "Air conditioning",
          "Flat-screen TV",
          "Work desk",
          "Coffee/tea maker"
        ]
      },
      {
        name: "Superior Room",
        description: "Comfortable and well-appointed rooms with modern amenities.",
        priceRange: "₦107,154 per night",
        capacity: 2,
        features: [
          "Size: 30 sqm",
          "Queen-size bed",
          "City view",
          "Free Wi-Fi",
          "Air conditioning",
          "Flat-screen TV",
          "Work desk",
          "Coffee/tea maker"
        ]
      },
      {
        name: "Deluxe Room",
        description: "Spacious rooms with premium furnishings and city views.",
        priceRange: "₦127,832 per night",
        capacity: 2,
        features: [
          "Size: 40 sqm",
          "King-size bed",
          "Premium view",
          "Mini bar",
          "Work desk",
          "Free Wi-Fi",
          "Air conditioning"
        ]
      },
      {
        name: "Junior Suite",
        description: "Luxurious suites with separate living area.",
        priceRange: "₦147,850 per night",
        capacity: 2,
        features: [
          "Size: 60 sqm",
          "Separate living area",
          "Premium amenities",
          "Concierge service",
          "Executive lounge access",
          "Complimentary breakfast"
        ]
      },
      {
        name: "Executive Suite",
        description: "Ultimate luxury with premium furnishings.",
        priceRange: "₦168,909 per night",
        capacity: 2,
        features: [
          "Size: 100 sqm",
          "Luxury living space",
          "Personal butler",
          "Premium dining",
          "Private balcony",
          "Jacuzzi"
        ]
      }
    ],
    events: [
      {
        type: "Lady Chinenye Hall",
        capacity: "150 - 300 guests",
        priceRange: "From ₦700,000 per day",
        features: [
          "Professional meeting rooms",
          "Conference facilities",
          "Catering services",
          "Décor and Setup",
          "Entertainment options",
          "Accommodation Package",
          "Audio/Visual equipment",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Projector & screen",
          "Microphone & sound system",
          "Whiteboard & flip charts",
          "Presenter (Mouse Pointer)"
        ]
      },
      {
        type: "Delta Hall",
        capacity: "10 - 20 guests",
        priceRange: "From ₦250,000 per day",
        features: [
          "PA System",
          "TV Screen",
          "Catering services",
          "Audio/Visual equipment",
          "Tables and chairs",
          "Dedicated event coordinator",
          "High-speed Wi-Fi",
          "Microphone & sound system",
          "Whiteboard & flip charts",
          "Presenter (Mouse Pointer)",
          "Custom Menu Planning Service"
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
      "Credit/Debit Cards (Visa, Mastercard, Verve)",
      "Bank Transfer",
      "Hotel Vouchers"
    ],
    policies: [
      "Cancellation: 48 hours prior to arrival",
      "Children: Under 12 stay free with parents",
      "Pets: Not allowed",
      "Smoking: Designated areas only",
      "ID: Valid photo ID required at check-in"
    ],
    gallery: [luxurySuite, hotelLobby, hotelExterior, restaurant, pool, spa]
  },
  {
    id: "evergreen",
    name: "Evergreen",
    fullName: "GOLDEN TULIP PORT HARCOURT, EVERGREEN",
    location: "GRA Phase III, Port Harcourt",
    description: "Enhanced Comfort with exclusive suites, user friendly amenities, and a tranquil atmosphere. Evergreen is the destination for those who desire privacy and sophistication in Port Harcourt.",
    image: restaurant,
    address: "Plot F35 Woke Street, Off Sani Abacha Road, GRA Phase III, Port Harcourt, Rivers State",
    phone: "+234 906 243 5582, +234 916 998 8444",
    email: "reservations@rivotelinternational.com, sales@rivotelinternational.com",
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
        image: "/images/evergreen images/standard room.webp",
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
        image: "/images/evergreen images/deluxe room.webp",
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
        image: "/images/evergreen images/executive room.webp",
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
