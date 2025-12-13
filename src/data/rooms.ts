import type { RoomType } from '@/types/room';

export const roomTypes: RoomType[] = [
  {
    id: 'standard-room',
    name: 'Standard Room',
    description: 'Affordable comfort with modern amenities perfect for business and leisure travelers in Port Harcourt.',
    longDescription: 'Affordable comfort with modern amenities perfect for business and leisure travelers in Port Harcourt.',
    price: 108450,
    size: 35,
    capacity: 2,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
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
      '/images/standard room.jpg',
      '/images/standard room.jpg',
      '/images/standard room.jpg',
      '/images/standard room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=false&sm=false&sp=false&sfr=false&sl=false&sop=false&sl=false'
  },
  {
    id: 'superior-room',
    name: 'Superior Room',
    description: 'Spacious design with upgraded features, blending elegance and convenience for a relaxing stay.',
    longDescription: 'Spacious design with upgraded features, blending elegance and convenience for a relaxing stay.',
    price: 121860,
    size: 40,
    capacity: 2,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
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
      '/images/superior room.png',
      '/images/superior room.png',
      '/images/superior room.png',
      '/images/superior room.png'
    ],
    vrTourUrl: 'https://webobook.com/public/superior-room-vr-tour'
  },
  {
    id: 'premium-standard-room',
    name: 'Premium Standard Room',
    description: 'Enjoy premium comfort with enhanced amenities and stylish décor at an unbeatable value.',
    longDescription: 'Enjoy premium comfort with enhanced amenities and stylish décor at an unbeatable value.',
    price: 122940,
    size: 38,
    capacity: 2,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
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
      '/images/premium standard.png',
      '/images/premium standard.png',
      '/images/premium standard.png',
      '/images/premium standard.png'
    ],
    vrTourUrl: 'https://webobook.com/public/premium-standard-room-vr-tour'
  },
  {
    id: 'premium-superior-room',
    name: 'Premium Superior Room',
    description: 'Refined interiors, extra space, and thoughtful touches designed for longer, more relaxing stays.',
    longDescription: 'Refined interiors, extra space, and thoughtful touches designed for longer, more relaxing stays.',
    price: 139230,
    size: 45,
    capacity: 2,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
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
      '/images/premium superior suite.png',
      '/images/premium superior suite.png',
      '/images/premium superior suite.png',
      '/images/premium superior suite.png'
    ],
    vrTourUrl: 'https://webobook.com/public/premium-superior-room-vr-tour'
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe',
    description: 'Luxury accommodation with sophisticated details, ideal for travelers seeking comfort and class.',
    longDescription: 'Luxury accommodation with sophisticated details, ideal for travelers seeking comfort and class.',
    price: 177480,
    size: 50,
    capacity: 2,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
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
      '/images/deluxe room suite.png',
      '/images/deluxe room suite.png',
      '/images/deluxe room suite.png',
      '/images/deluxe room suite.png'
    ],
    vrTourUrl: 'https://kuula.co/share/collection/7HphX?logo=1&info=1&fs=1&vr=0&sd=1&autorotate=0.16&autop=90&autopalt=1&thumbs=-1'
  },
  {
    id: 'premium-diplomatic-suite',
    name: 'Premium Diplomatic Suite',
    description: 'Exclusive setting with top-tier facilities, created for executives and distinguished guests.',
    longDescription: 'Exclusive setting with top-tier facilities, created for executives and distinguished guests.',
    price: 245070,
    size: 70,
    capacity: 2,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
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
      '/images/premium deplomatic suite.png',
      '/images/premium deplomatic suite.png',
      '/images/premium deplomatic suite.png',
      '/images/premium deplomatic suite.png'
    ],
    vrTourUrl: 'https://webobook.com/public/premium-diplomatic-suite-vr-tour'
  },
  {
    id: 'ambassadorial-suite',
    name: 'Ambassadorial Suite',
    description: 'Expansive suite offering refined luxury, separate lounge, and premium hospitality for elite travelers.',
    longDescription: 'Expansive suite offering refined luxury, separate lounge, and premium hospitality for elite travelers.',
    price: 354150,
    size: 90,
    capacity: 4,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Air conditioning',
      'Separate Living Area',
      'Office Space',
      'Premium Amenities',
      'Smart TV',
      'Executive Lounge',
      'Coffee/tea maker',
      'Complimentary breakfast'
    ],
    images: [
      '/images/ambassadorial room suite.jpg',
      '/images/ambassadorial room suite.jpg',
      '/images/ambassadorial room suite.jpg',
      '/images/ambassadorial room suite.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/ambassadorial-suite-vr-tour'
  },
  {
    id: 'presidential-suite',
    name: 'Presidential Suite',
    description: 'The ultimate in Golden Tulip Port Harcourt hotel. Luxurious, spacious, elegant, and designed for unforgettable stays.',
    longDescription: 'The ultimate in Golden Tulip Port Harcourt hotel. Luxurious, spacious, elegant, and designed for unforgettable stays.',
    price: 520650,
    size: 120,
    capacity: 4,
    bedType: 'Queen Size',
    amenities: [
      'Queen-size bed',
      'City view',
      'Free Wi-Fi',
      'Concierge services',
      'Premium dining',
      'Air conditioning',
      'Luxury Living Space',
      'Office Space',
      'Premium Amenities',
      'Smart TV',
      'Executive Lounge',
      'Coffee/tea maker',
      'Jacuzzi',
      'Complimentary breakfast'
    ],
    images: [
      '/images/presidential room.jpg',
      '/images/presidential room.jpg',
      '/images/presidential room.jpg',
      '/images/presidential room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/presidential-suite-vr-tour'
  }
];

export default roomTypes;
