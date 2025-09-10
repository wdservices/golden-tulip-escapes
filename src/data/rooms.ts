import type { RoomType } from '@/types/room';

export const roomTypes: RoomType[] = [
  {
    id: 'standard-room',
    name: 'Standard Room',
    description: 'Affordable comfort with modern amenities perfect for business and leisure travelers in Port Harcourt.',
    longDescription: 'Our Standard Rooms offer a perfect blend of comfort and style. Featuring a king-size bed, modern furnishings, and city views, these rooms are designed for your ultimate relaxation. The en-suite bathroom includes premium toiletries and a rain shower.',
    price: 108450,
    size: 35,
    capacity: 2,
    bedType: 'King Size',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Smart TV',
      'Work desk',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=false&sm=false&sp=false&sfr=false&sl=false&sop=false'
  },
  {
    id: 'superior-room',
    name: 'Superior Room',
    description: 'Spacious design with upgraded features, blending elegance and convenience for a relaxing stay.',
    longDescription: 'The Superior Room offers a spacious design with upgraded features, perfect for both work and relaxation. Enjoy city views, a king-size bed with premium linens, and a luxurious bathroom with a rain shower. The room also features a work desk and a comfortable seating area.',
    price: 121860,
    size: 60,
    capacity: 3,
    bedType: 'King Size + Sofa Bed',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Smart TV',
      'Work desk',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/executive-suite-vr-tour'
  },
  {
    id: 'premium-standard-room',
    name: 'Premium Standard Room',
    description: 'Enjoy premium comfort with enhanced amenities and stylish décor at an unbeatable value.',
    longDescription: 'Enjoy premium comfort with enhanced amenities and stylish décor at an unbeatable value. Our Premium Standard Rooms feature a king-size bed, city views, and modern amenities to ensure a comfortable and productive stay.',
    price: 122940,
    size: 120,
    capacity: 4,
    bedType: 'King Size + Queen Sofa Bed',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Smart TV',
      'Work desk',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/presidential-suite-vr-tour'
  },
  {
    id: 'premium-superior-room',
    name: 'Premium Superior Room',
    description: 'Refined interiors, extra space, and thoughtful touches designed for longer, more relaxing stays.',
    longDescription: 'Refined interiors, extra space, and thoughtful touches designed for longer, more relaxing stays. Our Premium Superior Rooms offer a king-size bed, city views, and premium amenities to ensure a comfortable and enjoyable stay.',
    price: 139230,
    size: 75,
    capacity: 4,
    bedType: 'King Size + 2 Twin Beds',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Smart TV',
      'Work desk',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/family-suite-vr-tour'
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe',
    description: 'Luxury accommodation with sophisticated details, ideal for travelers seeking comfort and class.',
    longDescription: 'Luxury accommodation with sophisticated details, ideal for travelers seeking comfort and class. Our Deluxe Rooms feature a king-size bed, city views, and premium amenities to ensure a luxurious and comfortable stay.',
    price: 177480,
    size: 70,
    capacity: 2,
    bedType: 'King Size',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Smart TV',
      'Work desk',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/honeymoon-suite-vr-tour'
  },
  {
    id: 'premium-diplomatic-suite',
    name: 'Premium Diplomatic Suite',
    description: 'Exclusive setting with top-tier facilities, created for executives and distinguished guests.',
    longDescription: 'Exclusive setting with top-tier facilities, created for executives and distinguished guests. Our Premium Diplomatic Suite features a king-size bed, city views, separate living room area, and office space to ensure a productive and comfortable stay.',
    price: 245070,
    size: 80,
    capacity: 2,
    bedType: 'King Size',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Separate Living Room Area',
      'Office Space',
      'Smart TV',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/premium-diplomatic-suite-vr-tour'
  },
  {
    id: 'ambassadorial-suite',
    name: 'Ambassadorial Suite',
    description: 'Expansive suite offering refined luxury, separate lounge, and premium hospitality for elite travelers.',
    longDescription: 'Expansive suite offering refined luxury, separate lounge, and premium hospitality for elite travelers. Our Ambassadorial Suite features a king-size bed, city views, separate living area, and office space to ensure a luxurious and comfortable stay.',
    price: 354150,
    size: 100,
    capacity: 4,
    bedType: 'King Size',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Separate Living Area',
      'Office Space',
      'Premium Amenities',
      'Smart TV',
      'Executive Lounge'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/ambassadorial-suite-vr-tour'
  },
  {
    id: 'presidential-suite',
    name: 'Presidential Suite',
    description: 'The ultimate in Golden Tulip Port Harcourt hotel. Luxurious, spacious, elegant, and designed for unforgettable stays.',
    longDescription: 'The ultimate in Golden Tulip Port Harcourt hotel. Luxurious, spacious, elegant, and designed for unforgettable stays. Our Presidential Suite features a king-size bed, city views, luxury living space, and office space to ensure an unforgettable and comfortable stay.',
    price: 520650,
    size: 120,
    capacity: 4,
    bedType: 'King Size',
    amenities: [
      'King-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Premium dining',
      'Air conditioning',
      'Luxury Living Space',
      'Office Space',
      'Premium Amenities',
      'Smart TV'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/presidential-suite-vr-tour'
  }
];

export default roomTypes;
